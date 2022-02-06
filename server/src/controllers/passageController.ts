import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { createPassage } from '../models/passage';

export const handleCreatePassage = async (req: Request, res: Response) => {
  const { body } = req;

  const { passage, error } = await createPassage(body);

  res.status(error?.httpStatus ?? StatusCodes.CREATED).json({ data: passage, error });
};