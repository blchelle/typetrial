import { v4 } from 'uuid';
import WebSocket from 'ws';
import { RaceData, Message } from '../utils/types';

const NEWUSER = 'new_user';
const USERS = 'users';
const REMUSER = 'remove_user';
const MINCON = 60000;

class WsHandler {
  maxUsers: number;

  rooms: Map<string, RaceData>;

  userInfo: Map<string, WebSocket>;

  constructor(
    maxUsers: number,
    rooms?: Map<string, RaceData>,
    userInfo?: Map<string, WebSocket>,
  ) {
    this.maxUsers = maxUsers;
    this.rooms = rooms || new Map<string, RaceData>();
    this.userInfo = userInfo || new Map<string, WebSocket>();
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

  connect_user_to_public_room(user: string, ws: WebSocket): RaceData | undefined {
    const roomId = this.find_match();
    return this.connect_user_to_room(user, ws, roomId);
  }

  connect_user_to_room(user: string, ws: WebSocket, roomId: string): RaceData | undefined {
    const raceInfo = this.rooms.get(roomId);

    if (!raceInfo) {
      return undefined;
    }

    const newUserMessage: Message = { type: NEWUSER, msg: user };

    this.userInfo.set(user, ws);
    this.broadcast_message(raceInfo, newUserMessage);

    ws.send(JSON.stringify({ type: USERS, msg: JSON.stringify(raceInfo) }));

    raceInfo.users.push(user);

    return raceInfo;
  }

  disconnect_user_from_room(user: string, raceInfo: RaceData) {
    this.userInfo.delete(user);
    const index = raceInfo.users.indexOf(user);
    if (index > -1) {
      raceInfo.users.splice(index, 1);

      if (raceInfo.users.length === 0) {
        this.rooms.delete(raceInfo.roomId);
      } else {
        this.broadcast_message(raceInfo, { type: REMUSER, msg: JSON.stringify(raceInfo.users) });
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
    const start = new Date(now.getTime() + (now.getTimezoneOffset() * MINCON) + 10000);
    const raceInfo: RaceData = {
      roomId, hasStarted: false, isPublic, start, passage: 'TODO', users: [],
    };
    this.rooms.set(roomId, raceInfo);

    return roomId;
  }
}

export default WsHandler;
