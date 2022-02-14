import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import expressWs from 'express-ws';
import path from 'path';
import hpp from 'hpp';
import { WebSocket } from 'ws';
import { v4 as uuid } from 'uuid';

import environment from './config/environment';
import apiRoutes from './routes/apiRoutes';
import { openLogFiles, writeLog } from './utils/log';
import db from './prismaClient';
import errorMiddleware from './middlewares/errorMiddleware';

// Has to be done in a 'require' because there are no type declarations
const xss = require('xss-clean');

interface UserInfo {
  username: string;
  room: string;
}

const { app } = expressWs(express());

const rooms = new Map<string, string[]| undefined>();
const users = new Map<string, WebSocket | undefined>();

const sendMessage = (sender: string, message: string, dest: string[] | undefined) => {
  dest?.forEach((user) => {
    users.get(user.toString())?.send(JSON.stringify({ sender, data: message }));
  });
};

const getRoom = () => {
  if (rooms.size === 0) {
    rooms.set(uuid(), <string[]>[]);
  }

  return rooms.keys().next().value;
};

const initMiddleware = () => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  environment.rateLimits.forEach((rateLimitConfig) => {
    const limit = rateLimit({
      max: rateLimitConfig.maxRequests,
      windowMs: rateLimitConfig.timeWindow,
      message: 'Too many requests, try again later',
    });
    app.use('/api', limit);
  });

  environment.clientUrls.forEach((url) => {
    app.use(cors({ credentials: true, origin: url }));
  });

  // TODO: Enable HTTPS on EC2 so that helmet can be enabled
  // app.use(helmet());

  app.use(hpp());
  app.use(xss());
};

const main = async () => {
  initMiddleware();
  app.use('/api', apiRoutes);
  await openLogFiles();

  app.ws('/api/connect/:user', (ws, req: Request) => {
    writeLog({ event: 'user connected to websocket', user: req.params.user }, 'info');

    const room = getRoom();
    rooms.get(room)?.push(req.params.user);
    users.set(req.params.user, ws);

    const userInfo: UserInfo = { username: req.params.user, room };

    ws.on('message', (msg) => {
      const roomUsers = rooms.get(userInfo.room);
      const dest = roomUsers?.filter((word) => word.toString() !== userInfo.username.toString());

      writeLog({ event: 'user sent message', user: userInfo.username, message: msg }, 'info');
      sendMessage(userInfo.username, msg.toString(), dest);
    });

    ws.on('close', () => {
      writeLog({ event: 'websocket closed', user: userInfo.username }, 'info');
      users.delete(userInfo.username);
      const remaining = rooms.get(userInfo.room)?.filter((user) => user !== userInfo.username);

      if (remaining?.length === 0) {
        rooms.delete(userInfo.room);
      } else {
        rooms.set(userInfo.room, remaining);
      }
    });
  });

  app.use(express.static(path.join(__dirname, '../..', 'client', 'dist')));
  app.use((_: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../..', 'client', 'dist', 'index.html'));
  });

  app.use(errorMiddleware);

  app.listen(8080, () => {
    writeLog({ event: 'server started on port 8080', user: 'server' }, 'info');
  });
};

main().finally(async () => { await db.$disconnect(); });

export default app;
