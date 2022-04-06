import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import app from '../../server';
import APIError from '../../errors/apiError';
import { getResult, getUserResults } from '../../models/result';

jest.mock('../../models/result');

const mockGetUserResults = getUserResults as jest.MockedFunction<typeof getUserResults>;
const mockGetResult = getResult as jest.MockedFunction<typeof getResult>;

describe('resultController', () => {
  beforeEach(() => {
   mockGetResult.mockReset();
  });

  describe('handleGetResult', () => {
    it('responds with error when body is invalid', async () => {
      const mockError = new APIError('not found', StatusCodes.NOT_FOUND);
      const mockResError = { message: 'not found', fieldErrors: [] };
      mockGetResult.mockRejectedValue(mockError);
      const res = await request(app).get('/api/results/get/1');

      expect(res.status).to.equal(StatusCodes.NOT_FOUND);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockGetResult).to.have.lengthOf(0);
    });

    it('responds with error when signup fails', async () => {
      const mockError = new PrismaClientValidationError();
      const mockResError = { message: 'invalid request', fieldErrors: [] };
      mockGetResult.mockRejectedValue(mockError);

      const res = await request(app).get('/api/results/get/1');

      expect(res.status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockGetResult.mock.calls).to.have.lengthOf(1);
    });

    it('responds with the result', async () => {  
      const mockResult = {
        id: 1,
        userId: 1,
        raceId: 1,
        wpm: 1,
        rank: 1,
      }

      mockGetResult.mockResolvedValue(mockResult);
      const res = await request(app).get('/api/results/get/1');
      expect(res.status).to.equal(StatusCodes.OK);
      expect(res.body).to.deep.equal({ data: mockResult, errors: []});
      expect(mockGetResult.mock.calls).to.have.lengthOf(1);
    });
  });

  beforeEach(() => {
    mockGetUserResults.mockReset();
   });

  describe('handleGetResult', () => {
    it('responds with error when body is invalid', async () => {
      const mockError = new APIError('not found', StatusCodes.NOT_FOUND);
      const mockResError = { message: 'not found', fieldErrors: [] };
      mockGetUserResults.mockRejectedValue(mockError);
      const res = await request(app).get('/api/results/user/1');

      expect(res.status).to.equal(StatusCodes.NOT_FOUND);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockGetUserResults).to.have.lengthOf(0);
    });

    it('responds with error when signup fails', async () => {
      const mockError = new PrismaClientValidationError();
      const mockResError = { message: 'invalid request', fieldErrors: [] };
      mockGetUserResults.mockRejectedValue(mockError);

      const res = await request(app).get('/api/results/user/1');

      expect(res.status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockGetUserResults.mock.calls).to.have.lengthOf(1);
    });

    it('responds with the result', async () => {  
        const now = new Date();
        const mockResult = [{
            id: 1,
            userId: 1,
            raceId: 1,
            wpm: 1,
            rank: 1,
            Race: {
                createdAt: now,
                Passage: {
                    text: "text",
                }
            }
        }]

      mockGetUserResults.mockResolvedValue(mockResult);
      const res = await request(app).get('/api/results/user/1');
      expect(res.status).to.equal(StatusCodes.OK);
      const { data, errors } = res.body;
      expect (errors).to.deep.equal([]);
      expect(data[0].id).to.deep.equal(mockResult[0].id);
      expect(mockGetUserResults.mock.calls).to.have.lengthOf(1);
    });
  });
});
