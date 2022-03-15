import expressWs from 'express-ws';
import { writeLog } from '../utils/log';
import WsHandler from '../websockets/websocketHandler';
import WebSocket from 'ws';
import { Request } from 'express';

interface UserInfo {
    username: string;
    room: string;
}

const create_connection = (app: expressWs.Application, wsHandler: WsHandler) => {
    app.ws('/api/connect/:user', (ws, req: Request) => {
        create_handler(req.params.user, ws, wsHandler);
      });
}

export const create_handler = (user: string, ws: WebSocket, wsHandler: WsHandler) => {
  const room = wsHandler.connect_user_to_room(user, ws);
  const userInfo: UserInfo = { username: user, room };

  ws.onmessage = () => {

  };

  ws.onclose = () => {
    writeLog({ event: 'websocket closed', user: userInfo.username }, 'info');
    wsHandler.disconnect_user_from_room(userInfo.username, userInfo.room);
  };
}

export default create_connection;