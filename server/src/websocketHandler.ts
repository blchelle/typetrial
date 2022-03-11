import { v4 } from 'uuid';
import { WebSocket } from 'ws';

class WsHandler {
    public_rooms: Map<string, string[]>;
    private_rooms: Map<string, string[]>;
    user_info: Map<string, WebSocket>;
    race_info: Map<string, boolean>;
    max_users: number;

    constructor(max_users: number) {
        this.public_rooms = new Map<string, string[]>();
        this.private_rooms = new Map<string, string[]>();
        this.user_info = new Map<string, WebSocket> ();
        this.race_info = new Map<string, boolean>();
        this.max_users = max_users;
    }

    broadcast_message (roomid: string, sender: string, message: string, is_public: boolean) {
        let users = is_public ? this.public_rooms.get(roomid): this.private_rooms.get(roomid);
        if (users) {
            users.forEach((user) => {
                this.user_info.get(user)?.send(JSON.stringify({ sender, data: message }));
            })
        }
    }

    connect_user_to_room (user: string, ws: WebSocket, roomid: string = "") {
        this.user_info.set(user, ws);

        if (roomid == "") {
            const room = this.get_room();
            this.public_rooms.get(room)?.push(user);
            return room;
        }
        
        else {
            this.private_rooms.get(roomid)?.push(user);
            return roomid;
        }  
    }

    disconnect_user_from_room (user: string, roomid: string) {
        this.user_info.delete(user)
        
        let index = this.public_rooms.get(roomid)?.indexOf(user);

        if (index != undefined && index > -1) {
            this.public_rooms.get(roomid)?.splice(index, 1);
            if (this.public_rooms.get(roomid)?.length == 0) {
                this.delete_room(roomid);
            }

            return;
        }

        index = this.private_rooms.get(roomid)?.indexOf(user);

        if (index && index > -1) {
            this.private_rooms.get(roomid)?.splice(index, 1);
            if (this.private_rooms.get(roomid)?.length == 0) {
                this.delete_room(roomid);
            }
        }
    }

    get_room () {
        for (let [room, users] of Array.from(this.public_rooms.entries())) {
            if (!this.race_info.get(room) && users.length < this.max_users) {
                return room;
            }
        }

        return this.create_room(true);
    }

    create_room (is_public: boolean) {
        let room_id = v4();

        while (this.public_rooms.has(room_id) || this.private_rooms.has(room_id)) {
            room_id = v4();
        }

        this.race_info.set (room_id, false);

        if (is_public) {
            this.public_rooms.set (room_id, []);
        }
        else {
            this.private_rooms.set (room_id, []);
        }
        
        return room_id;
    }

    delete_room (roomid: string) {
        this.race_info.delete(roomid);
        this.public_rooms.delete(roomid);
        this.private_rooms.delete(roomid);
    }
}

export default WsHandler;