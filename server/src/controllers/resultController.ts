import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getResult, getUserResults } from '../models/result';

const RESULT_PAGE_SIZE = 10;

export const handleGetResult = async (req: Request, res: Response) => {
  const { resultId } = req.params;
  const result = await getResult(resultId);

  res.status(StatusCodes.OK).json({ result, errors: [] });
};

export const handleGetUserResults = async (req: Request, res: Response) => {
  const { userId, start, count } = req.params;
  const startInt = start ? parseInt(start, 10) : 0;

  const countInt = count ? parseInt(count, 10) : RESULT_PAGE_SIZE;
  const results = await getUserResults(userId, startInt, countInt);

  res.status(StatusCodes.OK).json({ results, errors: [] });
};
