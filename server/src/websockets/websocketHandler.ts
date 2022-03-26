import { v4 } from 'uuid';
import WebSocket from 'ws';
import { getPassage } from '../models/passage';
import { MILLISECONDS_PER_MINUTE } from '../utils/constants';
import { getUtcTime } from '../utils/helpers';
import {
  RaceData, Message, RaceDataMessage, ErrorMessage,
} from '../utils/types';

export const PLAYER_COLORS = ['#F52E2E', '#5463FF', '#FFC717', '#1F9E40', '#FF6619'];

class WsHandler {
  maxUsers: number;

  rooms: Map<string, RaceData>;

  userInfo: Map<string, WebSocket>;

  timeoutDuration: number;

  constructor(
    maxUsers: number,
    rooms?: Map<string, RaceData>,
    userInfo?: Map<string, WebSocket>,
    timeoutDuration: number = 10000,
  ) {
    this.maxUsers = maxUsers;
    this.rooms = rooms || new Map<string, RaceData>();
    this.userInfo = userInfo || new Map<string, WebSocket>();
    this.timeoutDuration = timeoutDuration;
  }

  broadcast_message(raceInfo: RaceData, message: Message) {
    raceInfo.users.forEach((user) => {
      const ws = this.userInfo.get(user);
      try {
        ws?.send(JSON.stringify(message));
      } catch (_) {
        this.disconnect_user_from_room(user, raceInfo);
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

    raceInfo.userInfo[user] = {
      color: PLAYER_COLORS[raceInfo.users.length], charsTyped: 0, wpm: 0, finished: false,
    };
    raceInfo.users.push(user);

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

    return foundRoomId === '' ? this.create_room(true) : foundRoomId;
  }

  create_room(isPublic: boolean, owner: string = '') {
    let roomId = v4();

    while (this.rooms.has(roomId)) {
      roomId = v4();
    }

    const start = new Date(getUtcTime().getTime() + this.timeoutDuration);

    const raceInfo: RaceData = {
      roomId, hasStarted: false, isPublic, start, users: [], userInfo: {}, owner,
    };

    getPassage().then((passage: string) => {
      raceInfo.passage = passage;
      this.broadcast_race_info(raceInfo);
    });

    if (isPublic) {
      setTimeout(() => {
        this.start_race('', raceInfo);
      }, this.timeoutDuration);
    }

    this.rooms.set(roomId, raceInfo);

    return roomId;
  }

  start_race(owner: string, raceInfo: RaceData) {
    if (owner === raceInfo.owner) {
      raceInfo.hasStarted = true;
      this.broadcast_race_info(raceInfo);
    } else {
      const ws = this.userInfo.get(owner);
      if (ws) { ws.send(JSON.stringify({ type: 'error', message: 'You do not have permision to start race' })); }
    }
  }

  end_race(raceInfo: RaceData) {
    // TODO
    console.log('done');
    this.broadcast_race_info(raceInfo);
  }

  type_char(charsTyped: number, user: string, raceInfo: RaceData) {
    raceInfo.userInfo[user].charsTyped = charsTyped;
    const endTime = new Date(getUtcTime());
    const wpm = ((charsTyped / 5) * MILLISECONDS_PER_MINUTE) / (endTime.getTime() - raceInfo.start.getTime());
    raceInfo.userInfo[user].wpm = wpm;

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
}

export default WsHandler;
