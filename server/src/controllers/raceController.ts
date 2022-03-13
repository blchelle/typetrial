import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getRace } from '../models/race';

export const handleGetRace = async (req: Request, res: Response) => {
  const { raceId } = req.params;
  const race = await getRace(raceId);

  res.status(StatusCodes.OK).json({ race, errors: [] });
};
