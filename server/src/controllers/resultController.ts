import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getResult, getUserResults } from '../models/result';

export const handleGetResult = async (req: Request, res: Response) => {
  const { resultId } = req.params;
  const result = await getResult(resultId);

  res.status(StatusCodes.OK).json({ data: result, errors: [] });
};

export const handleGetUserResults = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { start, count } = req.query;

  const startInt = +(start ?? 0);
  const countInt = +(count ?? Number.MAX_SAFE_INTEGER);

  const results = await getUserResults(userId, startInt, countInt);

  res.status(StatusCodes.OK).json({ data: results, errors: [] });
};
