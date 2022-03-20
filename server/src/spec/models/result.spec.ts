import { PrismaClientValidationError } from '@prisma/client/runtime';
import { expect } from 'chai';

import { NotFoundError } from '../../errors/notFoundError';
import { getResult, getUserResults } from '../../models/result';
import dbMock from '../prismaMock';
import { expectThrowsAsync } from '../specUtils';

describe('result', () => {
  const mockResult = {
    id: 0,
    userId: 0,
    raceId: 0,
    wpm: 50,
    rank: 1,
  };

  describe(getResult, () => {
    it('throws when result is not found', async () => {
      dbMock.result.findUnique.mockResolvedValue(null);

      await expectThrowsAsync(
        () => getResult(mockResult.id),
        new NotFoundError('result'),
      );

      expect(dbMock.result.findUnique.mock.calls).to.have.lengthOf(1);
    });

    it('return result when found', async () => {
      dbMock.result.findUnique.mockResolvedValue(mockResult);

      const result = await getResult(mockResult.id);

      expect(result).to.deep.equal(mockResult);
      expect(dbMock.result.findUnique.mock.calls).to.have.lengthOf(1);
    });
  });

  describe(getUserResults, () => {
    it('throws on db error', async () => {
      dbMock.result.findMany.mockRejectedValue(new PrismaClientValidationError());

      await expectThrowsAsync(
        () => getUserResults(0, 0, 10),
        new PrismaClientValidationError(),
      );

      expect(dbMock.result.findMany.mock.calls).to.have.lengthOf(1);
    });

    it('returns empty array if user has no results', async () => {
      dbMock.result.findMany.mockResolvedValue([]);

      const results = await getUserResults(0, 0, 10);

      expect(results).to.have.lengthOf(0);
      expect(dbMock.result.findMany.mock.calls).to.have.lengthOf(1);
    });

    it('returns full array of results', async () => {
      dbMock.result.findMany.mockResolvedValue([mockResult]);

      const results = await getUserResults(0, 0, 10);

      expect(results).to.deep.equal([mockResult]);
      expect(dbMock.result.findMany.mock.calls).to.have.lengthOf(1);
    });
  });
});
