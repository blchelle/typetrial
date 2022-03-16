import { v4 } from 'uuid';
import WebSocket from 'ws';

interface Message {
  type: string;
  msg: string;
}

const NEWUSER = 'new_user';
const USERS = 'users';
const REMUSER = 'remove_user';

class WsHandler {
  publicRooms: Map<string, string[]>;

  privateRooms: Map<string, string[]>;

  userInfo: Map<string, WebSocket>;

  raceInfo: Map<string, boolean>;

  maxUsers: number;

  constructor(
    maxUsers: number,
    publicRooms?: Map<string, string[]>,
    privateRooms?: Map<string, string[]>,
    userInfo?: Map<string, WebSocket>,
    raceInfo?: Map<string, boolean>,
  ) {
    this.publicRooms = publicRooms || new Map<string, string[]>();
    this.privateRooms = privateRooms || new Map<string, string[]>();
    this.userInfo = userInfo || new Map<string, WebSocket>();
    this.raceInfo = raceInfo || new Map<string, boolean>();
    this.maxUsers = maxUsers;
  }

  broadcast_message(roomid: string, message: Message, isPublic: boolean) {
    const users = isPublic ? this.publicRooms.get(roomid) : this.privateRooms.get(roomid);
    if (users) {
      users.forEach((user) => {
        const ws = this.userInfo.get(user);
        try {
          ws?.send(JSON.stringify(message));
        } catch (_) {
          this.disconnect_user_from_room(user, roomid);
        }
      });
    }
  }

  connect_user_to_room(user: string, ws: WebSocket, roomid: string = ''): string {
    const isPublic = roomid === '';
    const room = isPublic ? this.get_room() : this.get_room(roomid);

    if (room === 'FULL') return 'FULL';

    const newUserMessage: Message = { type: NEWUSER, msg: user };
    const users = isPublic ? this.publicRooms.get(room) : this.privateRooms.get(room);

    this.broadcast_message(room, newUserMessage, isPublic);
    ws.send(JSON.stringify({ type: USERS, msg: JSON.stringify(users) }));

    this.userInfo.set(user, ws);

    if (isPublic) {
      this.publicRooms.get(room)?.push(user);
    } else {
      this.privateRooms.get(room)?.push(user);
    }
    return room;
  }

  disconnect_user_from_room(user: string, roomid: string) {
    this.userInfo.delete(user);

    let index = this.publicRooms.get(roomid)?.indexOf(user);

    if (index !== undefined && index > -1) {
      this.publicRooms.get(roomid)?.splice(index, 1);

      if (this.publicRooms.get(roomid)?.length === 0) {
        this.delete_room(roomid);
      } else {
        this.broadcast_message(roomid, { type: REMUSER, msg: JSON.stringify(this.publicRooms.get(roomid)) }, true);
      }

      return;
    }

    index = this.privateRooms.get(roomid)?.indexOf(user);

    if (index !== undefined && index > -1) {
      this.privateRooms.get(roomid)?.splice(index, 1);
      if (this.privateRooms.get(roomid)?.length === 0) {
        this.delete_room(roomid);
      } else {
        this.broadcast_message(roomid, { type: REMUSER, msg: JSON.stringify(this.privateRooms.get(roomid)) }, false);
      }
    }
  }

  get_room(room?: string): string {
    if (!room) {
      let roomId = '';
      this.publicRooms.forEach((users, r) => {
        if (!this.raceInfo.get(r) && users.length < this.maxUsers) {
          roomId = r;
        }
      });

      return roomId === '' ? this.create_room(true) : roomId;
    }

    const users = this.privateRooms.get(room);

    if (users) {
      return users.length >= this.maxUsers ? 'FULL' : room;
    }

    return 'FULL';
  }

  create_room(isPublic: boolean) {
    let roomId = v4();

    while (this.publicRooms.has(roomId) || this.privateRooms.has(roomId)) {
      roomId = v4();
    }

    this.raceInfo.set(roomId, false);

    if (isPublic) {
      this.publicRooms.set(roomId, []);
    } else {
      this.privateRooms.set(roomId, []);
    }

    return roomId;
  }

  delete_room(roomid: string) {
    this.raceInfo.delete(roomid);
    this.publicRooms.delete(roomid);
    this.privateRooms.delete(roomid);
  }
}

export default WsHandler;
