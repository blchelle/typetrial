import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import expressWs from 'express-ws';
import path from 'path';
import hpp from 'hpp';
import xss from 'xss-clean';

import WsHandler from './websocketHandler';
import environment, { NodeEnv } from './config/environment';
import apiRoutes from './routes/apiRoutes';
import { openLogFiles, writeLog } from './utils/log';
import db from './prismaClient';
import errorMiddleware from './middlewares/errorMiddleware';

interface UserInfo {
  username: string;
  room: string;
}

const { app } = expressWs(express());

const wsHandler = new WsHandler(3);

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

app.ws('/api/connect/:user', (ws, req: Request) => {
  writeLog({ event: 'user connected to websocket', user: req.params.user }, 'info');

  const room = wsHandler.connect_user_to_room(req.params.user, ws);
  const userInfo: UserInfo = { username: req.params.user, room };

  ws.on('message', () => {
  });

  ws.on('close', () => {
    writeLog({ event: 'websocket closed', user: userInfo.username }, 'info');
    wsHandler.disconnect_user_from_room(userInfo.username, userInfo.room);
  });
});

const main = async () => {
  initMiddleware();
  app.use('/api', apiRoutes);
  await openLogFiles();

  app.use(express.static(path.join(__dirname, '../..', 'client', 'dist')));
  app.use((_: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../..', 'client', 'dist', 'index.html'));
  });

  app.use(errorMiddleware);

  if (process.env.NODE_ENV as NodeEnv !== 'test') {
    app.listen(8080, () => {
      writeLog({ event: 'server started on port 8080', user: 'server' }, 'info');
    });
  }
};

main().finally(async () => { await db.$disconnect(); });

export default app;
