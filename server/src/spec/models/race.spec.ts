import { PrismaClientValidationError } from '@prisma/client/runtime';
import { expect } from 'chai';
import { NotFoundError } from '../../errors/notFoundError';
import { getRace } from '../../models/race';
import dbMock from '../prismaMock';
import { expectThrowsAsync } from '../specUtils';

describe('race', () => {
  const mockRace = {
    id: 0,
    passageId: 0,
    createdAt: new Date(),
    Passage: { text: 'test passage' },
    Results: {
      wpm: 50,
      rank: 1,
      userId: 0,
      User: { username: 'testuser' },
    },
  };

  describe(getRace, () => {
    it('throws on db error', async () => {
      dbMock.race.findUnique.mockRejectedValue(new PrismaClientValidationError());

      await expectThrowsAsync(
        () => getRace(mockRace.id),
        new PrismaClientValidationError(),
      );

      expect(dbMock.race.findUnique.mock.calls).to.have.lengthOf(1);
    });

    it('throws when user not found', async () => {
      dbMock.race.findUnique.mockResolvedValue(null);

      await expectThrowsAsync(
        () => getRace(mockRace.id),
        new NotFoundError('race'),
      );

      expect(dbMock.race.findUnique.mock.calls).to.have.lengthOf(1);
    });

    it('returns race if found', async () => {
      dbMock.race.findUnique.mockResolvedValue(mockRace);

      const race = await getRace(mockRace.id);

      expect(race).to.deep.equal(race);
      expect(dbMock.race.findUnique.mock.calls).to.have.lengthOf(1);
    });
  });
});
