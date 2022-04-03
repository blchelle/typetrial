import { PrismaClientValidationError } from '@prisma/client/runtime';
import { expect } from 'chai';
import { getPassage, createPassage } from '../../models/passage';
import dbMock from '../prismaMock';
import { expectThrowsAsync } from '../specUtils';

describe('race', () => {
  const mockPassage = {
    id: 0,
    text: 'passage',
    source: null,
  };

  describe(getPassage, () => {
    it('throws on db error', async () => {
      dbMock.passage.findMany.mockRejectedValue(new PrismaClientValidationError());

      await expectThrowsAsync(
        () => getPassage(),
        new PrismaClientValidationError(),
      );

      expect(dbMock.passage.findMany.mock.calls).to.have.lengthOf(1);
    });

    it('returns passage', async () => {
      dbMock.passage.findMany.mockResolvedValue([mockPassage]);

      const passage = await getPassage();

      expect(passage).to.deep.equal(passage);
      expect(dbMock.passage.findMany.mock.calls).to.have.lengthOf(1);
    });
  });
  describe(createPassage, () => {
    it('throws on db error', async () => {
      dbMock.passage.create.mockRejectedValue(new PrismaClientValidationError());

      await expectThrowsAsync(
        () => createPassage(mockPassage),
        new PrismaClientValidationError(),
      );

      expect(dbMock.passage.create.mock.calls).to.have.lengthOf(1);
    });

    it('creates passage', async () => {
      dbMock.passage.create.mockResolvedValue(mockPassage);

      await createPassage(mockPassage);

      expect(dbMock.passage.create.mock.calls).to.have.lengthOf(1);
    });
  });
});
