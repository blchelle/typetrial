import path from 'path';
import { randomInt } from 'crypto';

import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import WebSocket from 'ws';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

import { v4 as uuid } from 'uuid';
import environment from './config/environment';

// Has to be done in a 'require' because there are no type declarations
const xss = require('xss-clean');

const { app } = expressWs(express());

interface UserInfo {
  username: string;
  room: string;
}

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

  app.use(helmet());
  app.use(hpp());
  app.use(xss());
};

initMiddleware();

app.get('/api/random', (req: Request, res: Response) => {
  console.log(req.query);
  res.json(randomInt(100).toString());
});

app.ws('/api/connect/:user', (ws, req: Request) => {
  console.log('Connected');

  const room = getRoom();
  rooms.get(room)?.push(req.params.user);
  users.set(req.params.user, ws);

  const userInfo: UserInfo = { username: req.params.user, room };

  ws.on('message', (msg) => {
    const roomUsers = rooms.get(userInfo.room);
    const dest = roomUsers?.filter((word) => word.toString() !== userInfo.username.toString());

    sendMessage(userInfo.username, msg.toString(), dest);
  });

  ws.on('close', () => {
    console.log('WebSocket was closed');
    users.delete(userInfo.username);
    const remaining = rooms.get(userInfo.room)?.filter((user) => user !== userInfo.username);

    if (remaining?.length === 0) {
      rooms.delete(userInfo.room);
    } else {
      rooms.set(userInfo.room, remaining);
    }
  });
});

app.post('/api/echo', (req: Request, res: Response) => {
  console.log(req.body);
  res.json(req.body);
});

app.use(express.static(path.join(__dirname, '../..', 'client', 'dist')));
app.use((_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../..', 'client', 'dist', 'index.html'));
});

// Start server on port 8080
app.listen(8080, () => {
  console.log('Server started on port 8080');
});
