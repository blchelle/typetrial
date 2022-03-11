import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import expressWs from 'express-ws';
import path from 'path';
import hpp from 'hpp';
import WsHandler from './websocketHandler';
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

const ws_handler = new WsHandler(2);

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

  const room = ws_handler.connect_user_to_room(req.params.user, ws);
  const userInfo: UserInfo = { username: req.params.user, room };

  ws.on('message', (msg) => {
    ws_handler.broadcast_message(userInfo.room, userInfo.room, msg.toString(), true)
  });

  ws.on('close', () => {
    writeLog({ event: 'websocket closed', user: userInfo.username }, 'info');
    ws_handler.disconnect_user_from_room(userInfo.username, userInfo.room);
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

  app.listen(8080, () => {
    writeLog({ event: 'server started on port 8080', user: 'server' }, 'info');
  });
};

main().finally(async () => { await db.$disconnect(); });

export default app;
