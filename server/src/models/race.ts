import { StatusCodes } from 'http-status-codes';
import db from '../prismaClient';

import FieldError from '../errors/fieldError';
import APIError from '../errors/apiError';

export const getRace = async (raceId: any) => {
  const intRaceId = parseInt(raceId, 10);
  const race = await db.race.findUnique({
    where: { id: intRaceId },
    include: {
      Results: {
        select: {
          wpm: true, rank: true, userId: true, User: { select: { username: true } },
        },
        orderBy: { rank: 'asc' },
      },
      Passage: {
        select: {
          text: true,
        },
      },
    },
  });

  if (!race) {
    const error = new FieldError('raceId', intRaceId, 'is not associated with a race');
    throw new APIError('invalid input', StatusCodes.NOT_FOUND, [error]);
  }

  const mappedRace = {
    id: race.id,
    passageId: race.passageId,
    createdAt: race.createdAt,
    passage: race.Passage.text,
    results: race.Results.map(
      (result) => ({
        wpm: result.wpm,
        rank: result.rank,
        userId: result.userId,
        username: result.User.username,
      }),
    ),
  };

  return mappedRace;
};
