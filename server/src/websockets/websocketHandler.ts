import { v4 } from 'uuid';
import WebSocket from 'ws';
import { getPassage } from '../models/passage';
import { createRace } from '../models/race';
import { createResult } from '../models/result';
import { getUserByField } from '../models/user';
import { MILLISECONDS_PER_MINUTE } from '../utils/constants';
import { writeLog } from '../utils/log';
import { finishSortFunction } from '../utils/helpers';
import {
  RaceData, Message, RaceDataMessage, ErrorMessage, Powerup, Effect,
} from '../utils/types';

export const PLAYER_COLORS = ['#F52E2E', '#5463FF', '#FFC717', '#1F9E40', '#FF6619'];
export const BOT_NAME = 'Bot';

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
    raceInfo.users.forEach((user) => {
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

  connect_user_to_public_room(user: string, ws: WebSocket): RaceData | undefined {
    if (this.userInfo.get(user)) return undefined;

    const roomId = this.find_match();
    return this.connect_user_to_room(user, ws, roomId);
  }

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
    };

    raceInfo.users.push(user);

    if (raceInfo.isPublic && raceInfo.users.length === 2) {
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
      raceInfo.users.splice(index, 1);
      delete raceInfo.userInfo[user];

      if (!raceInfo.hasStarted && user === raceInfo.owner) {
        this.rooms.delete(raceInfo.roomId);
        const message: ErrorMessage = { type: 'error', message: 'Room creator disconnected' };
        this.broadcast_message(raceInfo, message);
      } else if (raceInfo.users.length === 0) {
        this.rooms.delete(raceInfo.roomId);
      } else {
        this.broadcast_race_info(raceInfo);
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
      };

      raceInfo.users.push(BOT_NAME); setTimeout(() => {
        this.start_race(raceInfo.owner, raceInfo);
      }, this.soloTimeout);
    }

    this.rooms.set(roomId, raceInfo);

    return roomId;
  }

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
        const botuser = ri.userInfo[BOT_NAME];
        this.type_char(botuser.charsTyped + 1, BOT_NAME, raceInfo);
        const { passage } = raceInfo;
        if (passage && botuser.charsTyped === passage.length) {
          clearInterval(interval);
        }
      }, 300);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  end_race(raceInfo: RaceData) {
    // This promise chain monstrosity is required, since await in a websocket
    // causes blocking for other users in other rooms
    if (raceInfo.passageId) {
      createRace(raceInfo.passageId).then((dbRace) => {
        Object.entries(raceInfo.userInfo)
          .sort(finishSortFunction)
          .forEach(([username, user], i) => {
            getUserByField('username', username).then((dbUser) => {
              if (dbUser) {
                createResult(dbUser.id, dbRace.id, user.wpm, i + 1);
              }
            });
          });
      });
    }
    raceInfo.users.forEach((user) => {
      this.disconnect_user_from_room(user, raceInfo);
    });
  }

  type_char(charsTyped: number, user: string, raceInfo: RaceData) {
    raceInfo.userInfo[user].charsTyped = charsTyped;
    const endTime = new Date();
    const wpm = ((charsTyped / 5) * MILLISECONDS_PER_MINUTE) / (endTime.getTime() - raceInfo.raceStart!);
    raceInfo.userInfo[user].wpm = Math.floor(wpm);

    if (raceInfo.userInfo[user].inventory === null && !raceInfo.isSolo && Math.random() < 0.05) {
      let powerup:Powerup;
      const powerupRand = Math.random();
      if (powerupRand < 0.05) {
        powerup = 'knockout';
      } else if (powerupRand < 0.1) {
        powerup = 'doubletap';
      } else if (powerupRand < 0.55) {
        powerup = 'rumble';
      } else {
        powerup = 'whiteout';
      }
      raceInfo.userInfo[user].inventory = powerup;
    }

    if (raceInfo.passage && charsTyped === raceInfo.passage.length) {
      raceInfo.userInfo[user].finished = true;
      raceInfo.userInfo[user].finishTime = endTime;
      const users = raceInfo.userInfo;
      if (Object.values(users).every((u) => u.finished)) {
        this.end_race(raceInfo);
      }
    }

    this.broadcast_race_info(raceInfo);
  }

  use_powerup(powerupType: Powerup, user: string, raceInfo: RaceData) {
    let newEffect: Effect;
    switch (powerupType) {
      case 'knockout': {
      // Target the person in first place!
        const [target] = Object.entries(raceInfo.userInfo)
          .map<[string, number]>(([username, u]) => [username, u.charsTyped])
          .reduce<[string|null, number]>(([prevusername, prevcharsTyped], [username, charsTyped]) => {
            if (prevcharsTyped < charsTyped) {
              return [username, charsTyped];
            }
            return [prevusername, prevcharsTyped];
          }, [null, 0]);
        newEffect = {
          powerupType, user, endTime: Date.now() + 1500, target,
        };
        break; }
      case 'doubletap': {
        newEffect = { powerupType, user, endTime: Date.now() + 3000 };
        break; }
      case 'rumble': {
        newEffect = { powerupType, user, endTime: Date.now() + 5000 };
        break; }
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
