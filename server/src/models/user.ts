import { User } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import APIError from '../errors/apiError';
import FieldError from '../errors/fieldError';
import db from '../prismaClient';

interface SignupInput {
  email: string
  username: string
  password: string
}

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const USERNAME_REGEX = /^[a-z0-9_-]{0,16}$/;
const PASSWORD_REGEX = /^.*(?=.{8,32})(?=.*[a-zA-Z])(?=.*\d).*$/;

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
    errors.push(new FieldError('email/username', identifier, 'must be present'));
  } else if (typeof identifier !== 'string') {
    errors.push(new FieldError('email/username', identifier, 'must be a string'));
  }

  if (errors.length > 0) throw new APIError('invalid input', StatusCodes.UNPROCESSABLE_ENTITY, errors);

  // Determine whether the identifier is an email, username, or neither
  let identifierField: 'email' | 'username' | null = null;
  if (EMAIL_REGEX.test(identifier)) identifierField = 'email';
  else if (USERNAME_REGEX.test(identifier)) identifierField = 'username';

  if (!identifierField) {
    const error = [new FieldError('email/username', identifier, 'must be a valid identifier')];
    throw new APIError('invalid input', StatusCodes.UNPROCESSABLE_ENTITY, error);
  }

  const existingUser = await db.user.findUnique({ where: { [identifierField]: identifier } });
  if (!existingUser) {
    const error = new FieldError(identifierField, identifier, 'is not associated with an account');
    throw new APIError('invalid input', StatusCodes.NOT_FOUND, [error]);
  }

  return existingUser;
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

// Removes fields that should not be included in an HTTP response
// Password is removed because we don't want to expose passwords to the user (even hashed)
// Role is removed because 99.9% our users will be USER, the ADMINS know who they are
export const sanitizeUserOutput = (user: User) => {
  const {
    id, email, username, createdAt, updatedAt,
  } = user;

  return {
    id, email, username, createdAt, updatedAt,
  };
};

export const signupUser = async (inputUser: SignupInput) => db.user.create({ data: { ...inputUser } });

export const getUserById = async (id: number) => db.user.findUnique({ where: { id } });
