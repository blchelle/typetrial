import { User } from '@prisma/client';
import { db } from '../server';
import { classifyPrismaError, FieldError } from '../utils/errors';

interface SignupInput {
  email: string
  username: string
  password: string
}

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const USERNAME_REGEX = /^[a-z0-9_-]{0,16}$/;
const PASSWORD_REGEX = /^.*(?=.{8,32})(?=.*[a-zA-Z])(?=.*\d).*$/;

const validateEmailForSignup = async (email: any) => {
  const errors: FieldError[] = [];

  if (!email) {
    errors.push({ field: 'email', input: email, message: 'must be present' });
  } else if (typeof email !== 'string') {
    errors.push({ field: 'email', input: email, message: 'must be a string' });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', input: email, message: 'must be a valid email address' });
  }

  if (errors.length > 0) return errors;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) errors.push({ field: 'email', input: email, message: 'is already taken' });

  return errors;
};

const validateUsernameForSignup = async (username: any) => {
  const errors: FieldError[] = [];

  if (!username) {
    errors.push({ field: 'username', input: username, message: 'must be present' });
  } else if (typeof username !== 'string') {
    errors.push({ field: 'username', input: username, message: 'must be a string' });
  } else if (!USERNAME_REGEX.test(username)) {
    errors.push({ field: 'username', input: username, message: 'must be a valid username' });
  }

  if (errors.length > 0) return errors;

  const existingUser = await db.user.findUnique({ where: { username } });
  if (existingUser) errors.push({ field: 'username', input: username, message: 'is already taken' });

  return errors;
};

const validatePassword = (password: any) => {
  const errors: FieldError[] = [];

  if (!password) {
    errors.push({ field: 'password', input: password, message: 'must be present' });
  } else if (typeof password !== 'string') {
    errors.push({ field: 'password', input: password, message: 'must be a string' });
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.push({ field: 'password', input: password, message: 'must be a valid password' });
  }

  return errors;
};

const validateIdentifierForLogin = async (identifier: any) => {
  let errors: FieldError[] = [];

  if (!identifier) {
    errors.push({ field: 'email/username', input: identifier, message: 'must be present' });
  } else if (typeof identifier !== 'string') {
    errors.push({ field: 'email/username', input: identifier, message: 'must be a string' });
  }

  if (errors.length > 0) return { data: null, errors };

  // Determine whether the identifier is an email, username, or neither
  let identifierField: 'email' | 'username' | null = null;
  if (EMAIL_REGEX.test(identifier)) identifierField = 'email';
  else if (USERNAME_REGEX.test(identifier)) identifierField = 'username';

  if (!identifierField) {
    errors = [{ field: 'email/username', input: identifier, message: 'must be a valid identifier' }];
    return { data: null, errors };
  }

  if (errors.length > 0) return { data: null, errors };

  const existingUser = await db.user.findUnique({ where: { [identifierField]: identifier } });
  if (!existingUser) errors.push({ field: identifierField, input: identifier, message: 'is not associated with an account' });

  return { data: existingUser, errors };
};

export const validateSignupInput = async (data: any) => {
  const { email, username, password } = data;

  let errors: FieldError[] = [];
  errors = [...errors, ...(await validateEmailForSignup(email))];
  errors = [...errors, ...(await validateUsernameForSignup(username))];
  errors = [...errors, ...validatePassword(password)];

  return errors;
};

export const validateLoginInput = async (input: any) => {
  const { identifier, password } = input;

  let errors: FieldError[] = [];
  const { data, errors: idErrors } = await validateIdentifierForLogin(identifier);

  errors = [...errors, ...idErrors];
  errors = [...errors, ...validatePassword(password)];

  return { data, errors };
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

export const signupUser = async (inputUser: SignupInput) => {
  try {
    const newUser = await db.user.create({ data: { ...inputUser } });
    return { data: newUser, error: null };
  } catch (e) {
    return { data: null, error: classifyPrismaError(e) };
  }
};
