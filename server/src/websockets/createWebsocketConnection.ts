import expressWs from 'express-ws';
import WebSocket from 'ws';
import { Request } from 'express';
import { writeLog } from '../utils/log';
import WsHandler from '../websockets/websocketHandler';
import {
  UserInfo, ConnectPrivateMessage, CreatePrivateMessage, InMessage, TypeMessage, UsePowerupMessage,
} from '../utils/types';

export const sendError = (ws: WebSocket, message: string) => {
  ws.send(JSON.stringify({ type: 'error', message }));
};

export const safeCast = <T extends InMessage> (message: InMessage) => {
  try {
    return <T>message;
  } catch {
    return undefined;
  }
};

export const handleMessage = (wsHandler: WsHandler, userInfo: UserInfo, ws: WebSocket, event: string) => {
  let message: InMessage | undefined;
  try {
    message = JSON.parse(event);
  } catch {
    message = undefined;
  }
  if (!message) {
    sendError(ws, 'Wrong message type');
    return userInfo;
  }

  switch (message.type) {
    case ('connect_public'): {
      const raceInfo = wsHandler.connect_user_to_public_room(userInfo.user, ws);
      if (raceInfo) {
        userInfo = { user: userInfo.user, raceInfo };
      } else {
        userInfo.user = '';
        sendError(ws, 'Could not connect to room, please reload');
      }
      break;
    }
    case ('connect_private'): {
      const privateMessage = safeCast<ConnectPrivateMessage>(message);
      if (!privateMessage) {
        sendError(ws, 'INVALID MESSAGE');
      }
      if (privateMessage) {
        const { roomId } = privateMessage;
        const raceInfo = wsHandler.connect_user_to_room(userInfo.user, ws, roomId);

        if (raceInfo) {
          userInfo = { user: userInfo.user, raceInfo };
        } else {
          userInfo.user = '';
          sendError(ws, 'Could not connect to room, please reload');
        }
      }
      break;
    }
    case ('create_private'): {
      const createPrivateMessage = safeCast<CreatePrivateMessage>(message);
      if (!createPrivateMessage) {
        sendError(ws, 'INVALID MESSAGE');
        return userInfo;
      }

      const roomId = wsHandler.create_room(false, createPrivateMessage.solo, userInfo.user);
      const raceInfo = wsHandler.connect_user_to_room(userInfo.user, ws, roomId);

      if (raceInfo) {
        userInfo = { user: userInfo.user, raceInfo };
      } else {
        userInfo.user = '';
        sendError(ws, 'Could not create room, please reload');
      }
      break;
    }
    case ('start'): {
      wsHandler.start_race(userInfo.user, userInfo.raceInfo);
      break;
    }
    case ('type'): {
      const typeMessage = safeCast<TypeMessage>(message);
      if (typeMessage) {
        const { charsTyped } = typeMessage;

        wsHandler.type_char(charsTyped, userInfo.user, userInfo.raceInfo);
      } else {
        sendError(ws, 'Could not update room');
      }
      break;
    }
    case ('powerup'): {
      const typeMessage = safeCast<UsePowerupMessage>(message);
      if (typeMessage) {
        const { powerup } = typeMessage;
        wsHandler.use_powerup(powerup, userInfo.user, userInfo.raceInfo);
      } else {
        sendError(ws, 'Could not update room');
      }
      break;
    }
    default: {
      sendError(ws, 'Wrong message type');
      break;
    }
  }

  return userInfo;
};
export const createHandler = (user: string, ws: WebSocket, wsHandler: WsHandler, isTest: boolean = false) => {
  const now = new Date().getTime();

  let userInfo: UserInfo = {
    user,
    // TODO: we could just make this optional
    raceInfo: {
      roomId: '',
      hasStarted: false,
      isPublic: false,
      isSolo: false,
      countdownStart: now,
      raceStart: now + 10000,
      passage: '',
      users: [],
      userInfo: {},
      owner: '',
      activeEffects: [],
    },
  };

  if (!isTest) {
    ws.on('message', (event) => {
      userInfo = handleMessage(wsHandler, userInfo, ws, event.toString());
    });
  }

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
