import expressWs from 'express-ws';
import WebSocket from 'ws';
import { Request } from 'express';
import { writeLog } from '../utils/log';
import WsHandler from '../websockets/websocketHandler';

interface UserInfo {
    username: string;
    room: string;
}

export const createHandler = (user: string, ws: WebSocket, wsHandler: WsHandler) => {
  const room = wsHandler.connect_user_to_room(user, ws);
  if (room === 'FULL') {
    return;
  }
  const userInfo: UserInfo = { username: user, room };

  ws.onclose = () => {
    writeLog({ event: 'websocket closed', user: userInfo.username }, 'info');
    wsHandler.disconnect_user_from_room(userInfo.username, userInfo.room);
  };
};

const createConnection = (app: expressWs.Application, wsHandler: WsHandler) => {
  app.ws('/api/connect/:user', (ws, req: Request) => {
    createHandler(req.params.user, ws, wsHandler);
  });
};

export default createConnection;
