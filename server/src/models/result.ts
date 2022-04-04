import db from '../prismaClient';

import { NotFoundError } from '../errors/notFoundError';

export const getResult = async (resultId: any) => {
  const intResultId = parseInt(resultId, 10);

  const result = await db.result.findUnique({
    where: { id: intResultId },
  });

  if (!result) {
    throw new NotFoundError('result');
  }

  return result;
};

export const getUserResults = async (userId: any, start: number, count: number) => {
  const intUserId = parseInt(userId, 10);

  return db.result.findMany({
    where: { userId: intUserId },
    include: { Race: { select: { createdAt: true, Passage: { select: { text: true } } } } },
    orderBy: { Race: { createdAt: 'asc' } },
    skip: start,
    take: count,
  });
};

export const createResult = async (userId: number | undefined, raceId: number, wpm: number, rank: number) => {
  const result = await db.result.create({
    data: {
      userId, raceId, wpm, rank,
    },
  });
  return result;
};
