import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import app from '../../server';
import { getRace } from "../../models/race";
import APIError from '../../errors/apiError';

jest.mock('../../models/race');

const mockGetRace = getRace as jest.MockedFunction<typeof getRace>;

describe('raceController', () => {
  beforeEach(() => {
   mockGetRace.mockReset();
  });

  describe('handleGetRace', () => {
    it('responds with error when body is invalid', async () => {
      const mockError = new APIError('not found', StatusCodes.NOT_FOUND);
      const mockResError = { message: 'not found', fieldErrors: [] };
      mockGetRace.mockRejectedValue(mockError);
      const res = await request(app).get('/api/races/get/1');

      expect(res.status).to.equal(StatusCodes.NOT_FOUND);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockGetRace).to.have.lengthOf(0);
    });

    it('responds with error when signup fails', async () => {
      const mockError = new PrismaClientValidationError();
      const mockResError = { message: 'invalid request', fieldErrors: [] };
      mockGetRace.mockRejectedValue(mockError);

      const res = await request(app).get('/api/races/get/1');

      expect(res.status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockGetRace.mock.calls).to.have.lengthOf(1);
    });

    it('responds race', async () => { 
      const date = new Date()
      const mockRace = {
        id: 1,
        passageId: 1,
        createdAt: date,
        Passage: {
            text: "",
        },
        Results : [{
          wpm: 0,
          rank: 0,
          userId: 0,
          User: {
              username: "string"
          } 
        }]
      }

      mockGetRace.mockResolvedValue(mockRace);
      const res = await request(app).get('/api/races/get/1');
      expect(res.status).to.equal(StatusCodes.OK);
      const { data, errors } = res.body;
      expect (errors).to.deep.equal([]);
      expect(data.id).to.deep.equal(mockRace.id);
      expect(mockGetRace.mock.calls).to.have.lengthOf(1);
    });
  });
});
