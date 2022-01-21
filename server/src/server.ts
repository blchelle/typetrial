import path from 'path';
import { randomInt } from 'crypto';

import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

import environment from './config/environment';

// Has to be done in a 'require' because there are no type declarations
const xss = require('xss-clean');

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

  app.use(helmet());
  app.use(hpp());
  app.use(xss());
};

initMiddleware();

app.get('/api/random', (req: Request, res: Response) => {
  console.log(req.query);
  res.json(randomInt(100).toString());
});

app.ws('/api/random', (ws) => {
  setInterval(() => {
    ws.send(randomInt(100).toString());
  }, 2000);

  ws.on('close', () => {
    console.log('WebSocket was closed');
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
