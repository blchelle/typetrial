import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import expressWs from 'express-ws';
import path from 'path';
import hpp from 'hpp';
import xss from 'xss-clean';
import WsHandler from './websockets/websocketHandler';
import environment, { NodeEnv } from './config/environment';
import apiRoutes from './routes/apiRoutes';
import { openLogFiles, writeLog } from './utils/log';
import db from './prismaClient';
import errorMiddleware from './middlewares/errorMiddleware';
import createWebsocket from './websockets/createWebsocketConnection';

const { app } = expressWs(express());

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

createWebsocket(app, new WsHandler(5));

const main = async () => {
  initMiddleware();
  app.use('/api', apiRoutes);
  await openLogFiles();

  app.use(express.static(path.join(__dirname, '../../..', 'client', 'dist')));
  app.use((_: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../..', 'client', 'dist', 'index.html'));
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
