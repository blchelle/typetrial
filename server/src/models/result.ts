import { StatusCodes } from 'http-status-codes';
import db from '../prismaClient';

import FieldError from '../errors/fieldError';
import APIError from '../errors/apiError';

export const getResult = async (resultId: any) => {
  const intResultId = parseInt(resultId, 10);

  const result = await db.result.findUnique({
    where: { id: intResultId },
  });

  if (!result) {
    const error = new FieldError('resultId', intResultId, 'is not associated with a result');
    throw new APIError('invalid input', StatusCodes.NOT_FOUND, [error]);
  }

  return result;
};

export const getUserResults = async (userId: any, start: number, count: number) => {
  const intUserId = parseInt(userId, 10);

  const results = await db.result.findMany({
    where: { userId: intUserId },
    include: { Race: { select: { createdAt: true, Passage: { select: { text: true } } } } },
    orderBy: { Race: { createdAt: 'asc' } },
    skip: start,
    take: count,
  });

  if (!results || results.length === 0) {
    const error = new FieldError('userId', intUserId, 'is not associated with a user');
    throw new APIError('invalid input', StatusCodes.NOT_FOUND, [error]);
  }

  const mappedResults = results.map((result) => ({
    id: result.id,
    userId: result.userId,
    raceId: result.raceId,
    wpm: result.wpm,
    rank: result.rank,
    createdAt: result.Race.createdAt,
    passage: result.Race.Passage.text,

  }));

  return mappedResults;
};
