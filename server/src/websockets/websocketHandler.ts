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
  public_rooms: Map<string, string[]>;

  private_rooms: Map<string, string[]>;

  user_info: Map<string, WebSocket>;

  race_info: Map<string, boolean>;

  maxUsers: number;

  constructor(maxUsers: number, public_rooms?: Map<string, string[]>, private_rooms?: Map<string, string[]>, user_info?: Map<string, WebSocket>, race_info?: Map<string, boolean>) {
    this.public_rooms = public_rooms ? public_rooms : new Map<string, string[]>();
    this.private_rooms = private_rooms ? private_rooms: new Map<string, string[]>();
    this.user_info = user_info ? user_info : new Map<string, WebSocket>();
    this.race_info = race_info ? race_info : new Map<string, boolean>();
    this.maxUsers = maxUsers;
  }

  broadcast_message(roomid: string, message: Message, isPublic: boolean) {
    const users = isPublic ? this.public_rooms.get(roomid) : this.private_rooms.get(roomid);
    if (users) {
      users.forEach((user) => {
        const ws = this.user_info.get(user);
        try {
          ws?.send(JSON.stringify(message));
        }
        catch (_){
          this.disconnect_user_from_room(user, roomid);
        }
      });
    }
  }

  connect_user_to_room(user: string, ws: WebSocket, roomid: string = '') {
    const isPublic = roomid === '';
    const room = isPublic ? this.get_room() : roomid;
    const newUserMessage: Message = { type: NEWUSER, msg: user };
    const users = isPublic ? this.public_rooms.get(room) : this.private_rooms.get(room);

    this.broadcast_message(room, newUserMessage, isPublic);
    ws.send(JSON.stringify({ type: USERS, msg: JSON.stringify(users) }));

    this.user_info.set(user, ws);

    if (isPublic) {
      this.public_rooms.get(room)?.push(user);
    } else {
      this.private_rooms.get(room)?.push(user);
    }
    return room;
  }

  disconnect_user_from_room(user: string, roomid: string) {
    this.user_info.delete(user);

    let index = this.public_rooms.get(roomid)?.indexOf(user);

    if (index !== undefined && index > -1) {
      this.public_rooms.get(roomid)?.splice(index, 1);

      if (this.public_rooms.get(roomid)?.length === 0) {
        this.delete_room(roomid);
      } else {
        this.broadcast_message(roomid, { type: REMUSER, msg: JSON.stringify(this.public_rooms.get(roomid)) }, true);
      }

      return;
    }

    index = this.private_rooms.get(roomid)?.indexOf(user);

    if (index && index > -1) {
      this.private_rooms.get(roomid)?.splice(index, 1);
      if (this.private_rooms.get(roomid)?.length === 0) {
        this.delete_room(roomid);
      } else {
        this.broadcast_message(roomid, { type: REMUSER, msg: JSON.stringify(this.public_rooms.get(roomid)) }, false);
      }
    }
  }

  get_room() {
    let roomId = '';
    this.public_rooms.forEach((users, room) => {
      if (!this.race_info.get(room) && users.length < this.maxUsers) {
        roomId = room;
      }
    });

    return roomId === '' ? this.create_room(true) : roomId;
  }

  create_room(isPublic: boolean) {
    let roomId = v4();

    while (this.public_rooms.has(roomId) || this.private_rooms.has(roomId)) {
      roomId = v4();
    }

    this.race_info.set(roomId, false);

    if (isPublic) {
      this.public_rooms.set(roomId, []);
    } else {
      this.private_rooms.set(roomId, []);
    }

    return roomId;
  }

  delete_room(roomid: string) {
    this.race_info.delete(roomid);
    this.public_rooms.delete(roomid);
    this.private_rooms.delete(roomid);
  }
}

export default WsHandler;
