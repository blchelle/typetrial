import expressWs from 'express-ws';
import WebSocket from 'ws';
import { Request } from 'express';
import { writeLog } from '../utils/log';
import WsHandler from '../websockets/websocketHandler';
import {
  UserInfo, ConnectPrivateMessage, InMessage, TypeMessage,
} from '../utils/types';

export const sendError = (ws: WebSocket, message: string) => {
  ws.send(JSON.stringify({type: "error", message}));
}

const safeCast = <T extends InMessage> (message: InMessage) => {
  try {
    return <T>message;
  }
  catch {
    return undefined;
  }
}

export const handleMessage = (wsHandler: WsHandler, userInfo: UserInfo, ws: WebSocket, event: any) => {
  let message: InMessage | undefined
    try {
      message = JSON.parse(event.toString());
    } 
    catch {
      message = undefined;
    }

    if (message && message.type === 'connect_public') {
      const raceInfo = wsHandler.connect_user_to_public_room(userInfo.user, ws);
      if (raceInfo) {
        userInfo = { user: userInfo.user, raceInfo };
      } else {
        sendError(ws, "Could not connect to room, please reload")
      }
    } else if (message && message.type === 'connect_private') {
      const privateMessage = safeCast<ConnectPrivateMessage>(message);
      if (!privateMessage) {
        sendError(ws, "INVALID MESSAGE");
      }
      if (privateMessage) {
        const { roomId } = privateMessage;
        const raceInfo = wsHandler.connect_user_to_room(userInfo.user, ws, roomId);

        if (raceInfo) {
          userInfo = { user: userInfo.user, raceInfo };
        }
        else {
          sendError(ws, "Could not connect to room, please reload");
        }
      } 
    } else if (message && message.type === 'create_private') {
      const roomId = wsHandler.create_room(false);
      const raceInfo = wsHandler.connect_user_to_room(userInfo.user, ws, roomId);
      if (raceInfo) {
        userInfo = { user: userInfo.user, raceInfo };
      } else {
        sendError(ws, "Could not create room, please reload")
      }
    } else if (message && message.type === 'start') {
      wsHandler.start_race(userInfo.user, userInfo.raceInfo);
    } else if (message && message.type === 'type') {
      const typeMessage = safeCast<TypeMessage>(message);
      if (typeMessage) {
        const { charsTyped } = typeMessage;

        wsHandler.type_char(charsTyped, userInfo.user, userInfo.raceInfo);
      }
      else {
        sendError(ws, "Could not update room")
      }
    }
    else {
      sendError(ws, "Wrong message type");
    }
}
export const createHandler = (user: string, ws: WebSocket, wsHandler: WsHandler, isTest: boolean = false) => {
  let userInfo: UserInfo = {user, raceInfo: {
    roomId: '',
    hasStarted: false,
    isPublic: false,
    start: new Date(),
    passage: '',
    users: [],
    userInfo: {},
  }};

  if (!isTest) {
    ws.on('message', (event) => {
      handleMessage(wsHandler, userInfo, ws, event)
    });
  }

  ws.onclose = () => {
    writeLog({ event: 'websocket closed', user: userInfo.user }, 'info');
    wsHandler.disconnect_user_from_room(userInfo.user, userInfo.raceInfo);
  };
}

const createConnection = (app: expressWs.Application, wsHandler: WsHandler) => {
  app.ws('/api/connect/:user', (ws, req: Request) => {
    createHandler(req.params.user, ws, wsHandler);
  });
};

export default createConnection;
