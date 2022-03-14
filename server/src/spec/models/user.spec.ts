import { Role } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import APIError from '../../errors/apiError';

import {
  getUserById,
  sanitizeUserOutput,
  signupUser,
  validateLoginInput,
  validateSignupInput,
} from '../../models/user';

import dbMock from '../prismaMock';
import { expectThrowsAsync } from '../specUtils';

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
    Results: [],
  };

  describe('validateSignupInput', () => {
    const validInput = { email: 'test@test.com', username: 'testuser', password: 'abc123ABC' };

    it('returns no errors for valid input', async () => {
      dbMock.user.findUnique.mockResolvedValue(null);

      expect(async () => validateSignupInput({ ...validInput })).to.not.throw();
    });

    it('returns an error for taken identifier', async () => {
      dbMock.user.findUnique.mockResolvedValue(mockUser);

      await expectThrowsAsync(
        () => validateSignupInput({ ...validInput }),
        new APIError(
          'invalid input',
          StatusCodes.CONFLICT,
          [
            { field: 'email', input: validInput.email, message: 'is already taken' },
            { field: 'username', input: validInput.username, message: 'is already taken' },
          ],
        ),
      );
    });

    it('returns an error for no email', async () => {
      await expectThrowsAsync(
        () => validateSignupInput({ ...validInput, email: '' }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'email', input: '', message: 'must be present' }],
        ),
      );
    });

    it('returns an error for non-string email', async () => {
      await expectThrowsAsync(
        () => validateSignupInput({ ...validInput, email: true }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'email', input: true, message: 'must be a string' }],
        ),
      );
    });

    it('returns an error for malformed email', async () => {
      await expectThrowsAsync(
        () => validateSignupInput({ ...validInput, email: 'a@a.c' }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'email', input: 'a@a.c', message: 'must be a valid email address' }],
        ),
      );
    });

    it('returns an error for no username', async () => {
      await expectThrowsAsync(
        () => validateSignupInput({ ...validInput, username: '' }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'username', input: '', message: 'must be present' }],
        ),
      );
    });

    it('returns an error for non-string username', async () => {
      await expectThrowsAsync(
        () => validateSignupInput({ ...validInput, username: 5 }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'username', input: 5, message: 'must be a string' }],
        ),
      );
    });

    it('returns an error for malformed username', async () => {
      await expectThrowsAsync(
        () => validateSignupInput({ ...validInput, username: 'with spaces' }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'username', input: 'with spaces', message: 'must be a valid username' }],
        ),
      );
    });

    it('returns an error for no password', async () => {
      await expectThrowsAsync(
        () => validateSignupInput({ ...validInput, password: '' }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'password', input: '', message: 'must be present' }],
        ),
      );
    });

    it('returns an error for non-string password', async () => {
      await expectThrowsAsync(
        () => validateSignupInput({ ...validInput, password: {} }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'password', input: {}, message: 'must be a string' }],
        ),
      );
    });

    it('returns an error for weak password', async () => {
      await expectThrowsAsync(
        () => validateSignupInput({ ...validInput, password: 'weak' }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'password', input: 'weak', message: 'must be a valid password' }],
        ),
      );
    });
  });

  describe('validateLoginInput', () => {
    const validInput = { identifier: 'testuser', password: 'abc123ABC' };

    it('returns the user by email identifier', async () => {
      dbMock.user.findUnique.mockResolvedValue({ ...mockUser });
      const user = await validateLoginInput({ ...validInput });

      expect(user).to.deep.equal({ ...mockUser, Results: { wpm: 0, count: 0 } });
    });

    it('returns an error for no identifier', async () => {
      await expectThrowsAsync(
        () => validateLoginInput({ ...validInput, identifier: '' }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'identifier', input: '', message: 'must be present' }],
        ),
      );
    });

    it('returns an error for non-string identifier', async () => {
      await expectThrowsAsync(
        () => validateLoginInput({ ...validInput, identifier: true }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'identifier', input: true, message: 'must be a string' }],
        ),
      );
    });

    it('returns an error for non-email, non-username identifier', async () => {
      await expectThrowsAsync(
        () => validateLoginInput({ ...validInput, identifier: 'has spaces' }),
        new APIError(
          'invalid input',
          StatusCodes.UNPROCESSABLE_ENTITY,
          [{ field: 'identifier', input: 'has spaces', message: 'must be a valid identifier' }],
        ),
      );
    });

    it('returns an error for non existent user', async () => {
      dbMock.user.findUnique.mockResolvedValue(null);

      await expectThrowsAsync(
        () => validateLoginInput({ ...validInput }),
        new APIError(
          'invalid input',
          StatusCodes.NOT_FOUND,
          [{ field: 'username', input: validInput.identifier, message: 'is not associated with an account' }],
        ),
      );
    });
  });

  describe('sanitizeUserOutput', () => {
    it('removes password and role from user', () => {
      const sanitized = sanitizeUserOutput({ ...mockUser, Results: { wpm: 0, count: 0 } });

      const expected: any = { ...mockUser, Results: { wpm: 0, count: 0 } };
      delete expected.password;
      delete expected.role;
      delete expected.passwordChangedAt;
      delete expected.createdAt;
      delete expected.updatedAt;

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

      const newUser = await signupUser(input);
      expect(newUser).to.deep.equal(mockUser);
    });

    it('returns error on failure', async () => {
      dbMock.user.create.mockRejectedValue(new PrismaClientValidationError('test error'));

      await expectThrowsAsync(
        () => signupUser(input),
        new PrismaClientValidationError('test error'),
      );
    });
  });

  describe('getUserById', () => {
    const id = 1;

    it('returns the user on success', async () => {
      dbMock.user.findUnique.mockResolvedValue(mockUser);

      const user = await getUserById(id);
      expect(user).to.deep.equal(mockUser);
    });

    it('returns error on failure', async () => {
      dbMock.user.findUnique.mockRejectedValue(new PrismaClientValidationError('test error'));

      await expectThrowsAsync(
        () => getUserById(id),
        new PrismaClientValidationError('test error'),
      );
    });
  });
});
