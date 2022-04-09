import { User, PasswordResetToken } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import argon2 from 'argon2';

import APIError from '../errors/apiError';
import FieldError from '../errors/fieldError';
import { ForbiddenError } from '../errors/forbiddenError';
import db from '../prismaClient';
import { UserWithResults } from '../utils/types';

// Handles requests for user data and management : FR1, FR2, FR3

interface SignupInput {
  email: string
  username: string
  password: string
}

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{0,16}$/;
const PASSWORD_REGEX = /^[a-zA-Z0-9%+'!#$^?:,~_-]{8,32}$/;
const UUID_REGEX = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/;

const validateEmailForSignup = async (email: any) => {
  const errors = [];
  let status = StatusCodes.CREATED;

  if (!email) {
    errors.push(new FieldError('email', email, 'must be present'));
  } else if (typeof email !== 'string') {
    errors.push(new FieldError('email', email, 'must be a string'));
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push(new FieldError('email', email, 'must be a valid email address'));
  }

  if (errors.length > 0) return { errors, status: StatusCodes.UNPROCESSABLE_ENTITY };

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    errors.push(new FieldError('email', email, 'is already taken'));
    status = StatusCodes.CONFLICT;
  }

  return { errors, status };
};

const validateUsernameForSignup = async (username: any) => {
  const errors = [];
  let status = StatusCodes.CREATED;

  if (!username) {
    errors.push(new FieldError('username', username, 'must be present'));
  } else if (typeof username !== 'string') {
    errors.push(new FieldError('username', username, 'must be a string'));
  } else if (!USERNAME_REGEX.test(username)) {
    errors.push(new FieldError('username', username, 'must be a valid username'));
  }

  if (errors.length > 0) return { errors, status: StatusCodes.UNPROCESSABLE_ENTITY };

  const existingUser = await db.user.findUnique({ where: { username } });
  if (existingUser) {
    errors.push(new FieldError('username', username, 'is already taken'));
    status = StatusCodes.CONFLICT;
  }

  return { errors, status };
};

const validatePassword = (password: any) => {
  const errors = [];

  if (!password) {
    errors.push(new FieldError('password', password, 'must be present'));
  } else if (typeof password !== 'string') {
    errors.push(new FieldError('password', password, 'must be a string'));
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.push(new FieldError('password', password, 'must be a valid password'));
  }

  return { errors, status: errors.length > 0 ? StatusCodes.UNPROCESSABLE_ENTITY : StatusCodes.OK };
};

const validateIdentifierForLogin = async (identifier: any) => {
  const errors = [];
  if (!identifier) {
    errors.push(new FieldError('identifier', identifier, 'must be present'));
  } else if (typeof identifier !== 'string') {
    errors.push(new FieldError('identifier', identifier, 'must be a string'));
  }

  if (errors.length > 0) throw new APIError('invalid input', StatusCodes.UNPROCESSABLE_ENTITY, errors);

  // Determine whether the identifier is an email, username, or neither
  let identifierField: 'email' | 'username' | null = null;
  if (EMAIL_REGEX.test(identifier)) identifierField = 'email';
  else if (USERNAME_REGEX.test(identifier)) identifierField = 'username';

  if (!identifierField) {
    const error = [new FieldError('identifier', identifier, 'must be a valid identifier')];
    throw new APIError('invalid input', StatusCodes.UNPROCESSABLE_ENTITY, error);
  }

  const existingUser = await db.user.findUnique({
    where: { [identifierField]: identifier },
    include: { Results: { select: { wpm: true }, orderBy: { Race: { createdAt: 'asc' } } } },
  });

  if (!existingUser) {
    const error = new FieldError(identifierField, identifier, 'is not associated with an account');
    throw new APIError('invalid input', StatusCodes.NOT_FOUND, [error]);
  }

  const recentResults = existingUser.Results.slice(0, 10);
  let wpm;
  if (recentResults.length === 0) {
    wpm = 0;
  } else {
    wpm = recentResults.reduce((avg, res) => avg + res.wpm, 0) / recentResults.length;
  }

  return { ...existingUser, Results: { wpm, count: existingUser.Results.length } };
};

const validateResetToken = async (tokenId: any) => {
  if (!tokenId || typeof tokenId !== 'string' || !UUID_REGEX.test(tokenId)) throw new ForbiddenError();

  // Search for the token, it must not be expired
  const token = await db.passwordResetToken.findFirst({ where: { id: tokenId, expiresAt: { gt: new Date() } } });
  if (!token) throw new ForbiddenError();

  return token;
};

/**
 * Validates that the email, username, password are all valid.
 * Throws a detailed error if any are invalid
 * @param data The request body containing the signup input
 */
export const validateSignupInput = async (data: any) => {
  const { email, username, password } = data;

  let errors: FieldError[] = [];
  const { errors: emailErrors, status: emailStatus } = await validateEmailForSignup(email);
  const { errors: usernameErrors, status: usernameStatus } = await validateUsernameForSignup(username);
  const { errors: passwordErrors, status: passwordStatus } = validatePassword(password);

  errors = [...errors, ...emailErrors, ...usernameErrors, ...passwordErrors];

  if (errors.length > 0) {
    throw new APIError('invalid input', Math.max(emailStatus, usernameStatus, passwordStatus), errors);
  }
};

export const validateLoginInput = async (input: any) => {
  const { identifier } = input;

  return validateIdentifierForLogin(identifier);
};

export const validateSendResetPasswordInput = async (input: any) => {
  const { identifier } = input;

  return validateIdentifierForLogin(identifier);
};

export const validateResetPasswordInput = async (input: any) => {
  if (typeof input !== 'object') throw new APIError('missing request body', StatusCodes.UNPROCESSABLE_ENTITY);

  const { password, token } = input;
  const resetToken = await validateResetToken(token);

  const { errors: passwordErrors, status: passwordStatus } = validatePassword(password);
  if (passwordErrors.length > 0) throw new APIError('invalid password', passwordStatus, passwordErrors);

  return resetToken;
};

// Removes fields that should not be included in an HTTP response
// Password is removed because we don't want to expose passwords to the user (even hashed)
// Role is removed because 99.9% our users will be USER, the ADMINS know who they are
export const sanitizeUserOutput = (user: User & { Results: { wpm: number, count: number} }) => {
  const {
    id, email, username, Results,
  } = user;

  return {
    id, email, username, Results,
  };
};

export const signupUser = async (inputUser: SignupInput) => db.user.create({ data: { ...inputUser } });

export const getUserByField = async (field: 'id' | 'email' | 'username', value: number | string) => {
  const user = await db.user.findUnique({
    where: { [field]: value },
    include: { Results: { select: { wpm: true }, orderBy: { Race: { createdAt: 'desc' } } } },
  });

  if (!user) {
    return null;
  }

  const recentResults = user.Results.slice(0, 10);
  const wpm = Math.round(recentResults.reduce((avg, res) => avg + res.wpm, 0) / (recentResults.length || 1));

  const result: UserWithResults = { ...user, Results: { wpm, count: user.Results.length } };
  return result;
};

export const createResetPasswordToken = async (user: User) => {
  const now = new Date();
  const expiryTime = 1000 * 60 * 15; // 15 Minutes
  const expiresAt = new Date(now.getTime() + expiryTime);

  // Prevent a users from creating simultaneous tokens for resetting
  const existingToken = await db.passwordResetToken.findFirst({
    where: { expiresAt: { gt: now, lte: expiresAt }, userId: user.id },
  });
  if (existingToken) return existingToken;

  // Otherwise we are safe to create a new token for them
  return db.passwordResetToken.create({ data: { expiresAt, userId: user.id } });
};

export const resetPassword = async (token: PasswordResetToken, password: string) => {
  const hashedPassword = await argon2.hash(password);

  await db.user.update({
    where: { id: token.userId },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
      PasswordResetToken: { delete: { id: token.id } },
    },
  });
};
