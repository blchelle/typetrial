import { v4 } from 'uuid';
import WebSocket from 'ws';
import { RaceData, Message } from '../utils/types';

interface RoomConnection {
  users: string[];
  start: Date;
}

const NEWUSER = 'new_user';
const USERS = 'users';
const REMUSER = 'remove_user';
const MINCON = 60000;


class WsHandler {
  rooms: Map<string, RaceData>;
  userInfo: Map<string, WebSocket>;
  maxUsers: number;

  constructor(
    rooms: Map<string, RaceData>,
    maxUsers: number,
    userInfo?: Map<string, WebSocket>,
  ) {
    this.rooms = rooms || new Map<string, RaceData>();
    this.userInfo = userInfo || new Map<string, WebSocket>();
    this.maxUsers = maxUsers;
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

  
  connect_user_to_public_room(user: string, ws: WebSocket): RaceData | undefined  {
    const roomId = this.find_match();
    return this.connect_user_to_room(user, ws, roomId);
  }

  connect_user_to_room(user: string, ws: WebSocket, roomId: string): RaceData | undefined {
    const raceInfo = this.rooms.get(roomId);

    if (!raceInfo) {
      return undefined;
    }

    const newUserMessage: Message = { type: NEWUSER, msg: user };
    
    const users = raceInfo.users;
    this.userInfo.set(user, ws);
    this.broadcast_message(raceInfo, newUserMessage);
    
    const msg: RoomConnection = {users: users, start: raceInfo.start}
    ws.send(JSON.stringify({ type: USERS, msg: JSON.stringify(msg)}));

    raceInfo.users.push(user);
      
    return raceInfo;
  }

  disconnect_user_from_room(user: string, raceInfo: RaceData) {
    this.userInfo.delete(user);
    let index = raceInfo.users.indexOf(user);
    if (index > -1) {
      raceInfo.users.splice(index, 1);

      if (raceInfo.users.length === 0) {
        this.rooms.delete(raceInfo.roomId);

      } else {
        this.broadcast_message(raceInfo, { type: REMUSER, msg: JSON.stringify(raceInfo.users)});
      }
      return;
    }
  }

  find_match (): string {
    let roomId = '';
    Object.entries(this.rooms).forEach(([id, raceInfo]) => {
      if (!raceInfo.hasStarted && raceInfo.users.length < this.maxUsers && raceInfo.isPublic) {
        roomId = id
      }
    })
    
    return roomId === '' ? this.create_room(true) : roomId;
  }

  create_room(isPublic: boolean) {
    let roomId = v4();

    while (this.rooms.has(roomId)) {
      roomId = v4();
    }

    const now = new Date();
    const start = new Date (now.getTime() + (now.getTimezoneOffset()*MINCON)+10000);
    const raceInfo: RaceData = {roomId, hasStarted: false, isPublic, start, passage: "TODO", users: []};
    this.rooms.set(roomId, raceInfo);

    return roomId;
  }
}

export default WsHandler;
