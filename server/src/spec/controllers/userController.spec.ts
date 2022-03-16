import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Role } from '@prisma/client';
import { hash, verify } from 'argon2';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import app from '../../server';

import {
  createResetPasswordToken,
  resetPassword,
  sanitizeUserOutput,
  signupUser,
  validateSignupInput,
  validateLoginInput,
  validateSendResetPasswordInput,
  validateResetPasswordInput,
} from '../../models/user';
import APIError from '../../errors/apiError';
import FieldError from '../../errors/fieldError';
import { NotFoundError } from '../../errors/notFoundError';
import sendResetPasswordEmail from '../../utils/mailer';

jest.mock('../../models/user');
jest.mock('../../utils/mailer');
jest.mock('argon2');

const mockValidateSignupInput = validateSignupInput as jest.MockedFunction<typeof validateSignupInput>;
const mockValidateLoginInput = validateLoginInput as jest.MockedFunction<typeof validateLoginInput>;
const mockValidateSendResetPasswordInput = validateSendResetPasswordInput as jest.MockedFunction<typeof validateSendResetPasswordInput>;
const mockValidateResetPasswordInput = validateResetPasswordInput as jest.MockedFunction<typeof validateResetPasswordInput>;
const mockResetPassword = resetPassword as jest.MockedFunction<typeof resetPassword>;
const mockSignupUser = signupUser as jest.MockedFunction<typeof signupUser>;
const mockCreateResetPasswordToken = createResetPasswordToken as jest.MockedFunction<typeof createResetPasswordToken>;
const mockSanitizeUserOutput = sanitizeUserOutput as jest.MockedFunction<typeof sanitizeUserOutput>;

const mockSendResetPasswordEmail = sendResetPasswordEmail as jest.MockedFunction<typeof sendResetPasswordEmail>;

const mockHash = hash as jest.MockedFunction<typeof hash>;
const mockVerify = verify as jest.MockedFunction<typeof verify>;

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@test.com',
  password: 'secret',
  role: Role.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
  passwordChangedAt: new Date(),
};

const extMockUser = { ...mockUser, Results: { wpm: 0, count: 0 } };
const mockToken = { id: 'test', userId: 1, expiresAt: new Date() };

const mockResUser = {
  id: 1,
  username: 'testuser',
  email: 'test@test.com',
  Results: { wpm: 0, count: 0 },
};

describe('userController', () => {
  beforeEach(() => {
    // Argon Mocks
    mockHash.mockResolvedValue('argon2hash');
    mockVerify.mockReset();

    // User Mocks
    mockValidateSignupInput.mockReset();
    mockValidateLoginInput.mockReset();
    mockValidateSendResetPasswordInput.mockReset();
    mockValidateResetPasswordInput.mockReset();
    mockResetPassword.mockReset();
    mockSignupUser.mockReset();
    mockCreateResetPasswordToken.mockReset();
    mockSanitizeUserOutput.mockReset();

    // Mailer Mocks
    mockSendResetPasswordEmail.mockReset();
  });

  describe('handleSignupUser', () => {
    const body = {
      email: 'test@test.com',
      username: 'testuser',
      password: 'abc123ABC',
    };

    it('responds with error when body is invalid', async () => {
      const mockError = new APIError('not found', StatusCodes.NOT_FOUND);
      const mockResError = { message: 'not found', fieldErrors: [] };
      mockValidateSignupInput.mockRejectedValue(mockError);

      const res = await request(app).post('/api/users/signup').send(body);

      expect(res.status).to.equal(StatusCodes.NOT_FOUND);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockValidateSignupInput.mock.calls).to.have.lengthOf(1);
      expect(mockSignupUser.mock.calls).to.have.lengthOf(0);
    });

    it('responds with error when signup fails', async () => {
      const mockError = new PrismaClientValidationError();
      const mockResError = { message: 'invalid request', fieldErrors: [] };
      mockSignupUser.mockRejectedValue(mockError);

      const res = await request(app).post('/api/users/signup').send(body);

      expect(res.status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockValidateSignupInput.mock.calls).to.have.lengthOf(1);
      expect(mockSignupUser.mock.calls).to.have.lengthOf(1);
    });

    it('responds with data, jwt when signup succeeds', async () => {
      mockSignupUser.mockResolvedValue(mockUser);
      mockSanitizeUserOutput.mockReturnValue(mockResUser);
      const res = await request(app).post('/api/users/signup').send(body);

      expect(res.status).to.equal(StatusCodes.CREATED);
      expect(res.body).to.deep.equal({ data: mockResUser, error: null });
      expect(res.headers['set-cookie']).to.exist;
      expect(mockValidateSignupInput.mock.calls).to.have.lengthOf(1);
      expect(mockSignupUser.mock.calls).to.have.lengthOf(1);
    });
  });

  describe('handleLoginUser', () => {
    const path = '/api/users/login';
    const body = {
      identifier: 'test@test.com',
      password: 'abc123ABC',
    };

    it('responds with error when validation throws', async () => {
      const mockError = new APIError('not found', StatusCodes.NOT_FOUND);
      const mockResError = { message: 'not found', fieldErrors: [] };
      mockValidateLoginInput.mockRejectedValue(mockError);

      const res = await request(app).post(path).send(body);

      expect(res.status).to.equal(StatusCodes.NOT_FOUND);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockValidateLoginInput.mock.calls).to.have.lengthOf(1);
      expect(mockVerify.mock.calls).to.have.lengthOf(0);
    });

    it('responds with error when passwords do not match', async () => {
      const passwordError = new FieldError('password', 'abc123ABC', 'does not match for user');
      const resError = { message: 'unauthorized', fieldErrors: [passwordError] };

      // Gets the user but the password is wrong
      mockValidateLoginInput.mockResolvedValue(extMockUser);
      mockVerify.mockResolvedValue(false);

      const res = await request(app).post(path).send(body);

      expect(res.status).to.equal(StatusCodes.UNAUTHORIZED);
      expect(res.body).to.deep.equal({ data: null, error: resError });
      expect(mockValidateLoginInput.mock.calls).to.have.lengthOf(1);
      expect(mockVerify.mock.calls).to.have.lengthOf(1);
    });

    it('responds with user, jwt when user exists and passwords match', async () => {
      // Gets the user and the password is right
      mockValidateLoginInput.mockResolvedValue(extMockUser);
      mockVerify.mockResolvedValue(true);
      mockSanitizeUserOutput.mockReturnValue(mockResUser);

      const res = await request(app).post(path).send(body);

      expect(res.status).to.equal(StatusCodes.OK);
      expect(res.body).to.deep.equal({ data: mockResUser, error: null });
      expect(mockValidateLoginInput.mock.calls).to.have.lengthOf(1);
      expect(mockVerify.mock.calls).to.have.lengthOf(1);
    });
  });

  describe('handleLogoutUser', () => {
    const path = '/api/users/logout';

    it('responds with a dummy cookie', async () => {
      const res = await request(app).get(path);

      expect(res.status).to.equal(StatusCodes.OK);

      const cookieFields = (res.headers['set-cookie'][0] as string).split('; ');
      expect(cookieFields[0]).to.equal('Bearer=logged_out');
      expect(cookieFields[1]).to.equal('Max-Age=10');
      expect(cookieFields[4]).to.equal('HttpOnly');
    });
  });

  describe('handleResetPasswordEmail', () => {
    const path = '/api/users/password-reset-email';
    const body = { identifier: 'test@teset.com' };

    it('responds with error on failed validation', async () => {
      const mockError = new NotFoundError('user');
      const mockResError = { message: 'user not found', fieldErrors: [] };
      mockValidateSendResetPasswordInput.mockRejectedValue(mockError);

      const res = await request(app).post(path).send(body);

      expect(res.status).to.equal(StatusCodes.NOT_FOUND);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockValidateSendResetPasswordInput.mock.calls).to.have.lengthOf(1);
      expect(mockCreateResetPasswordToken.mock.calls).to.have.lengthOf(0);
      expect(mockSendResetPasswordEmail.mock.calls).to.have.lengthOf(0);
    });

    it('responds with error on failed token creation', async () => {
      const mockError = new PrismaClientValidationError();
      const mockResError = { message: 'invalid request', fieldErrors: [] };
      mockValidateSendResetPasswordInput.mockResolvedValue(extMockUser);
      mockCreateResetPasswordToken.mockRejectedValue(mockError);

      const res = await request(app).post(path).send(body);

      expect(res.status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockValidateSendResetPasswordInput.mock.calls).to.have.lengthOf(1);
      expect(mockCreateResetPasswordToken.mock.calls).to.have.lengthOf(1);
      expect(mockSendResetPasswordEmail.mock.calls).to.have.lengthOf(0);
    });

    it('responds with error on failed email send', async () => {
      const mockError = new APIError('test error', StatusCodes.INTERNAL_SERVER_ERROR);
      const mockResError = { message: 'test error', fieldErrors: [] };
      mockValidateSendResetPasswordInput.mockResolvedValue(extMockUser);
      mockCreateResetPasswordToken.mockResolvedValue(mockToken);
      mockSendResetPasswordEmail.mockRejectedValue(mockError);

      const res = await request(app).post(path).send(body);

      expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockValidateSendResetPasswordInput.mock.calls).to.have.lengthOf(1);
      expect(mockCreateResetPasswordToken.mock.calls).to.have.lengthOf(1);
      expect(mockSendResetPasswordEmail.mock.calls).to.have.lengthOf(1);
    });

    it('responds with 200 ok on success', async () => {
      mockValidateSendResetPasswordInput.mockResolvedValue(extMockUser);
      mockCreateResetPasswordToken.mockResolvedValue(mockToken);

      const res = await request(app).post(path).send(body);

      expect(res.status).to.equal(StatusCodes.OK);
      expect(res.body).to.be.empty;
      expect(mockValidateSendResetPasswordInput.mock.calls).to.have.lengthOf(1);
      expect(mockCreateResetPasswordToken.mock.calls).to.have.lengthOf(1);
      expect(mockSendResetPasswordEmail.mock.calls).to.have.lengthOf(1);
    });
  });

  describe('handleResetPassword', () => {
    const path = '/api/users/password-reset';
    const body = { token: mockToken.id, password: 'abc123ABC2' };

    it('responds with error on failed validation', async () => {
      const mockError = new NotFoundError('user');
      const mockResError = { message: 'user not found', fieldErrors: [] };
      mockValidateResetPasswordInput.mockRejectedValue(mockError);

      const res = await request(app).post(path).send(body);

      expect(res.status).to.equal(StatusCodes.NOT_FOUND);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockValidateResetPasswordInput.mock.calls).to.have.lengthOf(1);
      expect(mockResetPassword.mock.calls).to.have.lengthOf(0);
    });

    it('responds with error on failed db update', async () => {
      const mockError = new PrismaClientValidationError();
      const mockResError = { message: 'invalid request', fieldErrors: [] };
      mockValidateResetPasswordInput.mockResolvedValue(mockToken);
      mockResetPassword.mockRejectedValue(mockError);

      const res = await request(app).post(path).send(body);

      expect(res.status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(res.body).to.deep.equal({ data: null, error: mockResError });
      expect(mockValidateResetPasswordInput.mock.calls).to.have.lengthOf(1);
      expect(mockResetPassword.mock.calls).to.have.lengthOf(1);
    });

    it('responds with status ACCEPTED on success', async () => {
      mockValidateResetPasswordInput.mockResolvedValue(mockToken);

      const res = await request(app).post(path).send(body);

      expect(res.status).to.equal(StatusCodes.ACCEPTED);
      expect(res.body).to.be.empty;
      expect(mockValidateResetPasswordInput.mock.calls).to.have.lengthOf(1);
      expect(mockResetPassword.mock.calls).to.have.lengthOf(1);
    });
  });
});
