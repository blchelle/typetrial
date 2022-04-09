import { v4 } from 'uuid';
import WebSocket from 'ws';
import { getPassage } from '../models/passage';
import { createRace, getRace } from '../models/race';
import { createResult } from '../models/result';
import { getUserByField } from '../models/user';
import { MILLISECONDS_PER_MINUTE } from '../utils/constants';
import { writeLog } from '../utils/log';
import {
  RaceData, Message, RaceDataMessage, ErrorMessage, Powerup, Effect,
} from '../utils/types';

export const PLAYER_COLORS = ['#F52E2E', '#5463FF', '#FFC717', '#1F9E40', '#FF6619'];
export const BOT_NAME = 'Bot';

const TIMEOUT_MS = 180000;

class WsHandler {
  maxUsers: number;

  rooms: Map<string, RaceData>;

  userInfo: Map<string, WebSocket>;

  publicTimeout: number;

  soloTimeout: number;

  constructor(
    maxUsers: number,
    rooms?: Map<string, RaceData>,
    userInfo?: Map<string, WebSocket>,
    publicTimeout: number = 10000,
    soloTimeout: number = 5000,
  ) {
    this.maxUsers = maxUsers;
    this.rooms = rooms || new Map<string, RaceData>();
    this.userInfo = userInfo || new Map<string, WebSocket>();
    this.publicTimeout = publicTimeout;
    this.soloTimeout = soloTimeout;
  }

  broadcast_message(raceInfo: RaceData, message: Message) {
    raceInfo.users
      .filter((username) => !raceInfo.userInfo[username].left)
      .forEach((user) => {
        const ws = this.userInfo.get(user);
        if (ws) {
          try {
            ws?.send(JSON.stringify(message));
          } catch (_) {
            this.disconnect_user_from_room(user, raceInfo);
          }
        }
      });
  }

  broadcast_race_info(raceInfo: RaceData) {
    const message: RaceDataMessage = { type: 'raceData', raceInfo };
    this.broadcast_message(raceInfo, message);
  }

  // Handles matchmaking: FR7
  connect_user_to_public_room(user: string, ws: WebSocket): RaceData | undefined {
    if (this.userInfo.get(user)) return undefined;

    const roomId = this.find_match();
    return this.connect_user_to_room(user, ws, roomId);
  }

  // Handles joining of a known room: FR5, FR7
  connect_user_to_room(user: string, ws: WebSocket, roomId: string): RaceData | undefined {
    const raceInfo = this.rooms.get(roomId);
    const existingUser = this.userInfo.get(user);

    if (!raceInfo) {
      return undefined;
    }

    if (existingUser) {
      if (raceInfo.users.length === 0) {
        this.rooms.delete(roomId);
      }
      return undefined;
    }

    if (raceInfo.users.length >= this.maxUsers) {
      return undefined;
    }

    this.userInfo.set(user, ws);

    const takenColors = Object.values(raceInfo.userInfo).map(({ color }) => color);
    const availableColors = PLAYER_COLORS.filter((color) => !takenColors.includes(color));
    raceInfo.userInfo[user] = {
      color: availableColors[0],
      charsTyped: 0,
      wpm: 0,
      finished: false,
      joinedTime: Date.now(),
      inventory: null,
      left: false,
    };

    raceInfo.users.push(user);

    if (raceInfo.isPublic && !raceInfo.countdownStart && raceInfo.users.length === 2) {
      raceInfo.countdownStart = Date.now();
      raceInfo.raceStart = raceInfo.countdownStart + this.publicTimeout;

      raceInfo.users.forEach((username) => {
        raceInfo.userInfo[username].joinedTime = raceInfo.countdownStart!;
      });

      setTimeout(() => {
        this.start_race('', raceInfo);
      }, this.publicTimeout);
    }

    this.broadcast_race_info(raceInfo);

    return raceInfo;
  }

  disconnect_user_from_room(user: string, raceInfo: RaceData) {
    this.userInfo.delete(user);
    const index = raceInfo.users.indexOf(user);
    if (index > -1) {
      raceInfo.userInfo[user].left = true;

      if (!raceInfo.userInfo[user].finished) {
        raceInfo.users.splice(index, 1);
        delete raceInfo.userInfo[user];
      }

      if (!raceInfo.hasStarted && user === raceInfo.owner) {
        const message: ErrorMessage = { type: 'error', message: 'Room creator disconnected' };
        this.broadcast_message(raceInfo, message);
      } else {
        this.broadcast_race_info(raceInfo);
      }

      if (raceInfo.users.length === 0) {
        this.rooms.delete(raceInfo.roomId);
      }
    }
  }

  find_match(): string {
    let foundRoomId = '';
    this.rooms.forEach((raceInfo, roomId) => {
      if (!raceInfo.hasStarted && raceInfo.users.length < this.maxUsers && raceInfo.isPublic) {
        foundRoomId = roomId;
      }
    });

    return foundRoomId === '' ? this.create_room(true, false) : foundRoomId;
  }

  // Handles creation of a room: FR4, FR7
  create_room(isPublic: boolean, isSolo: boolean, owner: string = '') {
    let roomId = v4();

    while (this.rooms.has(roomId)) {
      roomId = v4();
    }

    let raceStart;
    let countdownStart;
    if (isSolo) {
      countdownStart = Math.floor(Date.now() / 1000) * 1000; // Multiple of 1 second
      raceStart = countdownStart + this.soloTimeout;
    }

    const raceInfo: RaceData = {
      roomId,
      hasStarted: false,
      isPublic,
      isSolo,
      countdownStart,
      raceStart,
      users: [],
      userInfo: {},
      owner,
      activeEffects: [],
    };

    // This promise chain is required, since await in a websocket causes blocking for other users in other rooms
    getPassage().then((passage) => {
      raceInfo.passage = passage.text;
      raceInfo.passageId = passage.id;
      this.broadcast_race_info(raceInfo);

      createRace(raceInfo.passageId).then((dbRace) => { raceInfo.id = dbRace.id; });
    });

    if (isSolo) {
      const takenColors = Object.values(raceInfo.userInfo).map(({ color }) => color);
      const availableColors = PLAYER_COLORS.filter((color) => !takenColors.includes(color));
      raceInfo.userInfo[BOT_NAME] = {
        color: availableColors[0],
        charsTyped: 0,
        wpm: 0,
        finished: false,
        joinedTime: Date.now(),
        inventory: null,
        left: false,
      };

      raceInfo.users.push(BOT_NAME); setTimeout(() => {
        this.start_race(raceInfo.owner, raceInfo);
      }, this.soloTimeout);
    }

    this.rooms.set(roomId, raceInfo);

    return roomId;
  }

  // Handles starting of a race: FR6
  start_race(owner: string, raceInfo: RaceData) {
    if (owner !== raceInfo.owner) {
      const ws = this.userInfo.get(owner);
      if (ws) { ws.send(JSON.stringify({ type: 'error', message: 'You do not have permission to start race' })); }
      return;
    }

    if (!raceInfo.isPublic && !raceInfo.isSolo && owner === raceInfo.owner) {
      raceInfo.countdownStart = Date.now();
      raceInfo.raceStart = raceInfo.countdownStart + this.soloTimeout;

      setTimeout(() => {
        raceInfo.hasStarted = true;
        this.broadcast_race_info(raceInfo);
      }, this.soloTimeout);

      raceInfo.users.forEach((user) => {
        raceInfo.userInfo[user].joinedTime = Date.now();
      });

      this.broadcast_race_info(raceInfo);
    } else if (raceInfo.isPublic || raceInfo.isSolo) {
      raceInfo.hasStarted = true;
      this.broadcast_race_info(raceInfo);
    }

    if (raceInfo.isSolo) {
      const { roomId } = raceInfo;
      const interval = setInterval(() => {
        const ri = this.rooms.get(roomId);
        if (!ri) {
          return;
        }
        const botUser = ri.userInfo[BOT_NAME];
        this.type_char(botUser.charsTyped + 1, BOT_NAME, raceInfo);
        const { passage } = raceInfo;
        if (passage && botUser.charsTyped === passage.length) {
          clearInterval(interval);
        }
      }, 300);
    }

    setTimeout(() => {
      const raceInfoLocal = this.rooms.get(raceInfo?.roomId);
      if (!raceInfoLocal) {
        return;
      }

      setTimeout(() => {
        const message: ErrorMessage = { type: 'error', message: 'Race Timed Out!' };
        this.broadcast_message(raceInfo, message);

        const usersCopy = [...raceInfo.users];
        usersCopy.forEach((user) => {
          const ws = this.userInfo.get(user);
          this.disconnect_user_from_room(user, raceInfo);
          if (ws?.readyState === ws?.OPEN) {
            ws?.close();
          }
        });
      }, 100);
    }, process.env.NODE_ENV === 'test' ? 0 : TIMEOUT_MS + this.soloTimeout);
  }

  // eslint-disable-next-line class-methods-use-this
  get_first_place(raceInfo: RaceData) {
    const firstPlace: [string|null, number] = Object.entries(raceInfo.userInfo)
      .map<[string, number]>(([username, u]) => [username, u.charsTyped])
      .reduce<[string|null, number]>(([prevusername, prevcharsTyped], [username, charsTyped]) => {
        if (prevcharsTyped < charsTyped) {
          return [username, charsTyped];
        }
        return [prevusername, prevcharsTyped];
      }, [null, 0]);
    return firstPlace;
  }

  // Handles incoming typing updates, broadcasting them to all users and updating state: FR8
  type_char(charsTyped: number, username: string, raceInfo: RaceData) {
    raceInfo.userInfo[username].charsTyped = charsTyped;
    const endTime = new Date();
    const wpm = ((charsTyped / 5) * MILLISECONDS_PER_MINUTE) / (endTime.getTime() - raceInfo.raceStart!);
    raceInfo.userInfo[username].wpm = Math.floor(wpm);

    const [, firstPlaceChars] = this.get_first_place(raceInfo);
    // Randomly assigns powerups, FR15
    const chance = ((firstPlaceChars - charsTyped) * 0.2) / (raceInfo.passage?.length ?? 100) + 0.02;
    if (raceInfo.userInfo[username].inventory === null && !raceInfo.isSolo && Math.random() < chance) {
      let powerup:Powerup;
      const powerupRand = Math.random();
      if (powerupRand < 0.25) {
        powerup = 'knockout';
      } else if (powerupRand < 0.5) {
        powerup = 'doubletap';
      } else if (powerupRand < 0.75) {
        powerup = 'rumble';
      } else {
        powerup = 'whiteout';
      }
      raceInfo.userInfo[username].inventory = powerup;
    }

    if (raceInfo.passage && charsTyped === raceInfo.passage.length) {
      raceInfo.userInfo[username].finished = true;
      raceInfo.userInfo[username].finishTime = endTime;

      Promise.all([
        getUserByField('username', username),
        getRace(raceInfo.id),
      ]).then(([dbUser, dbRace]) => {
        const rankings = Object.entries(raceInfo.userInfo).filter(([, userInfo]) => userInfo.finishTime);
        rankings.sort(([, userA], [, userB]) => userA.finishTime!.getTime() - userB.finishTime!.getTime());
        const myRank = rankings.findIndex(([user]) => user === username) + 1;

        createResult(dbUser?.id, dbRace.id, raceInfo.userInfo[username].wpm, myRank);
      });
    }

    this.broadcast_race_info(raceInfo);
  }

  use_powerup(powerupType: Powerup, user: string, raceInfo: RaceData) {
    let newEffect: Effect;
    switch (powerupType) {
      // Handles usage of knockout powerup: FR19
      case 'knockout': {
      // Target the person in first place!
        const [target] = this.get_first_place(raceInfo);
        newEffect = {
          powerupType, user, endTime: Date.now() + 1500, target,
        };
        break; }
      // Handles usage of doubletap powerup: FR17
      case 'doubletap': {
        newEffect = { powerupType, user, endTime: Date.now() + 3000 };
        break; }
      // Handles usage of doubletap rumble: FR18
      case 'rumble': {
        newEffect = { powerupType, user, endTime: Date.now() + 5000 };
        break; }
      // Handles usage of doubletap rumble: FR16
      case 'whiteout': {
        newEffect = { powerupType, user, endTime: Date.now() + 5000 };
        break; }
      default:
        writeLog({ event: 'Powerup type not recognized', user, powerupType }, 'error');
        newEffect = { powerupType: 'whiteout', user, endTime: Date.now() + 5000 };
    }
    raceInfo.activeEffects.push(newEffect);
    raceInfo.userInfo[user].inventory = null;
    this.broadcast_race_info(raceInfo);
  }
}

export default WsHandler;
