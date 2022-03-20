import expressWs from 'express-ws';
import WebSocket from 'ws';
import { Request } from 'express';
import { writeLog } from '../utils/log';
import WsHandler from '../websockets/websocketHandler';
import {
  RaceData, ConnectPrivateMessage, InMessage, TypeMessage,
} from '../utils/types';

interface UserInfo {
    user: string;
    raceInfo: RaceData;
}

export const createHandler = (user: string, ws: WebSocket, wsHandler: WsHandler) => {
  let userInfo: UserInfo;
  ws.on('message', (event) => {
    // TODO idk error handle and make sure message meets these requirements
    const message: InMessage = JSON.parse(event.toString());
    if (message.type === 'connect_public') {
      const raceInfo = wsHandler.connect_user_to_public_room(user, ws);
      if (raceInfo) {
        userInfo = { user, raceInfo };
      } else {
        // TODO handle something going terribly wrong
      }
    } else if (message.type === 'connect_private') {
      // TODO idk error handle and make sure message meets these requirements
      const privateMessage = <ConnectPrivateMessage> message;
      const { roomId } = privateMessage;
      const raceInfo = wsHandler.connect_user_to_room(user, ws, roomId);
      if (raceInfo) {
        userInfo = { user, raceInfo };
      } else {
        // TODO handle something going terribly wrong
      }
    } else if (message.type === 'create_private') {
      const roomId = wsHandler.create_room(false);
      const raceInfo = wsHandler.connect_user_to_room(user, ws, roomId);
      if (raceInfo) {
        userInfo = { user, raceInfo };
      } else {
        // TODO handle something going terribly wrong
      }
    } else if (message.type === 'start') {
      wsHandler.start_race(user, userInfo.raceInfo);
    } else if (message.type === 'type') {
      const typeMessage = <TypeMessage> message;
      const { charsTyped } = typeMessage;

      wsHandler.type_char(charsTyped, user, userInfo.raceInfo);
    }
  });

  ws.onclose = () => {
    writeLog({ event: 'websocket closed', user: userInfo.user }, 'info');
    wsHandler.disconnect_user_from_room(userInfo.user, userInfo.raceInfo);
  };
};

const createConnection = (app: expressWs.Application, wsHandler: WsHandler) => {
  app.ws('/api/connect/:user', (ws, req: Request) => {
    createHandler(req.params.user, ws, wsHandler);
  });
};

export default createConnection;
