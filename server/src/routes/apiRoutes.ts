import { randomInt } from 'crypto';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import APIError from '../errors/apiError';
import { writeLog } from '../utils/log';

import passageRoutes from './passageRoutes';
import userRoutes from './userRoutes';
import resultRoutes from './resultRoutes';
import raceRoutes from './raceRoutes';

const router = express.Router({ mergeParams: true });

router.get('/random', (req: Request, res: Response) => {
  writeLog({ event: 'logging request query', data: req.query }, 'info');
  res.json(randomInt(100).toString());
});

router.use('/passages', passageRoutes);
router.use('/users', userRoutes);
router.use('/results', resultRoutes);
router.use('/races', raceRoutes);

// Funnel all routes that don't exist to a 404 NOT FOUND
router.all('*', (req, _res, next) => next(
  new APIError(
    `${req.originalUrl} does not exist on this server`,
    StatusCodes.NOT_FOUND,
  ),
));

export default router;
