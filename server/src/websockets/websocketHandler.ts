import { v4 } from 'uuid';
import WebSocket from 'ws';
import { RaceData, Message, RaceDataMessage } from '../utils/types';

export const PLAYER_COLORS = ['#F52E2E', '#5463FF', '#FFC717', '#1F9E40', '#FF6619'];

const MINCON = 60000;

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
    const roomId = this.find_match();
    return this.connect_user_to_room(user, ws, roomId);
  }

  connect_user_to_room(user: string, ws: WebSocket, roomId: string): RaceData | undefined {
    const raceInfo = this.rooms.get(roomId);

    if (!raceInfo) {
      return undefined;
    }

    this.userInfo.set(user, ws);

    raceInfo.userInfo[user] = { color: PLAYER_COLORS[raceInfo.users.length], charsTyped: 0 };
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

      if (raceInfo.users.length === 0) {
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

  create_room(isPublic: boolean) {
    let roomId = v4();

    while (this.rooms.has(roomId)) {
      roomId = v4();
    }

    const now = new Date();
    const nowUtc = new Date(now.getTime() + (now.getTimezoneOffset() * MINCON));
    const start = new Date(nowUtc.getTime() + this.timeoutDuration);

    const raceInfo: RaceData = {
      roomId, hasStarted: false, isPublic, start, passage: 'TODO', users: [], userInfo: {},
    };

    if (isPublic) {
      setTimeout(() => {
        this.start_race('', raceInfo);
      }, this.timeoutDuration);
    }

    this.rooms.set(roomId, raceInfo);

    return roomId;
  }

  start_race(_: string, raceInfo: RaceData) {
    // TODO check if user is leader
    raceInfo.hasStarted = true;
    this.broadcast_race_info(raceInfo);
  }

  type_char(charsTyped: number, user: string, raceInfo: RaceData) {
    raceInfo.userInfo[user].charsTyped = charsTyped;
    this.broadcast_race_info(raceInfo);
  }
}

export default WsHandler;
