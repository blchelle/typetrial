import { Role } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';

import {
  sanitizeUserOutput,
  signupUser,
  validateLoginInput,
  validateSignupInput,
} from '../../models/user';

import dbMock from '../../prismaMock';

describe('user', () => {
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

  describe('validateSignupInput', () => {
    const validInput = { email: 'test@test.com', username: 'testuser', password: 'abc123ABC' };

    it('returns no errors for valid input', async () => {
      dbMock.user.findUnique.mockResolvedValue(null);
      const { errors, status } = await validateSignupInput({ ...validInput });

      expect(errors).to.have.lengthOf(0);
      expect(status).to.equal(StatusCodes.CREATED);
    });

    it('returns an error for taken email/username', async () => {
      dbMock.user.findUnique.mockResolvedValue(mockUser);
      const { errors, status } = await validateSignupInput({ ...validInput });

      expect(errors).to.have.lengthOf(2);
      expect(errors[0]).to.deep.equal({ field: 'email', input: validInput.email, message: 'is already taken' });
      expect(errors[1]).to.deep.equal({ field: 'username', input: validInput.username, message: 'is already taken' });
      expect(status).to.equal(StatusCodes.CONFLICT);
    });

    it('returns an error for no email', async () => {
      const { errors, status } = await validateSignupInput({ ...validInput, email: '' });

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'email', input: '', message: 'must be present' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for non-string email', async () => {
      const { errors, status } = await validateSignupInput({ ...validInput, email: true });

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'email', input: true, message: 'must be a string' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for malformed email', async () => {
      const { errors, status } = await validateSignupInput({ ...validInput, email: 'a@a.c' });

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'email', input: 'a@a.c', message: 'must be a valid email address' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for no username', async () => {
      const { errors, status } = await validateSignupInput({ ...validInput, username: '' });

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'username', input: '', message: 'must be present' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for non-string username', async () => {
      const { errors, status } = await validateSignupInput({ ...validInput, username: true });

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'username', input: true, message: 'must be a string' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for malformed username', async () => {
      const { errors, status } = await validateSignupInput({ ...validInput, username: 'with spaces' });

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'username', input: 'with spaces', message: 'must be a valid username' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for no password', async () => {
      const { errors, status } = await validateSignupInput({ ...validInput, password: '' });

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'password', input: '', message: 'must be present' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for non-string password', async () => {
      const { errors, status } = await validateSignupInput({ ...validInput, password: true });

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'password', input: true, message: 'must be a string' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for weak password', async () => {
      const { errors, status } = await validateSignupInput({ ...validInput, password: 'password' });

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'password', input: 'password', message: 'must be a valid password' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });
  });

  describe('validateLoginInput', () => {
    const validInput = { identifier: 'testuser', password: 'abc123ABC' };

    it('returns the user by email identifier', async () => {
      dbMock.user.findUnique.mockResolvedValue(mockUser);
      const { data, errors, status } = await validateLoginInput({ ...validInput });

      expect(data).to.deep.equal(mockUser);
      expect(errors).to.have.lengthOf(0);
      expect(status).to.equal(StatusCodes.OK);
    });

    it('returns an error for no identifier', async () => {
      const { data, errors, status } = await validateLoginInput({ ...validInput, identifier: '' });

      expect(data).to.be.null;
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'email/username', input: '', message: 'must be present' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for non-string identifier', async () => {
      const { data, errors, status } = await validateLoginInput({ ...validInput, identifier: true });

      expect(data).to.be.null;
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'email/username', input: true, message: 'must be a string' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for non-email, non-username identifier', async () => {
      const { data, errors, status } = await validateLoginInput({ ...validInput, identifier: 'has some spaces' });

      expect(data).to.be.null;
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({ field: 'email/username', input: 'has some spaces', message: 'must be a valid identifier' });
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns an error for non existent user', async () => {
      dbMock.user.findUnique.mockResolvedValue(null);
      const { data, errors, status } = await validateLoginInput({ ...validInput });

      expect(data).to.be.null;
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        field: 'username',
        input: validInput.identifier,
        message: 'is not associated with an account',
      });
      expect(status).to.equal(StatusCodes.NOT_FOUND);
    });
  });

  describe('sanitizeUserOutput', () => {
    it('removes password and role from user', () => {
      const sanitized = sanitizeUserOutput(mockUser);

      const expected: any = { ...mockUser };
      delete expected.password;
      delete expected.role;
      delete expected.passwordChangedAt;

      expect(sanitized).to.deep.equal(expected);
    });
  });

  describe('signupUser', () => {
    const input = {
      username: 'testuser',
      email: 'test@test.com',
      password: 'secret',
    };

    it('returns the user on success', async () => {
      dbMock.user.create.mockResolvedValue(mockUser);
      const { data, error } = await signupUser(input);

      expect(data).to.deep.equal(mockUser);
      expect(error).to.be.null;
    });

    it('returns error on failure', async () => {
      dbMock.user.create.mockRejectedValue(new PrismaClientValidationError('test error'));
      const { data, error } = await signupUser(input);

      expect(data).to.be.null;
      expect(error).to.deep.equal({ message: 'invalid request', httpStatus: StatusCodes.UNPROCESSABLE_ENTITY });
    });
  });
});
