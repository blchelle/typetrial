import argon2 from 'argon2';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { createJWT } from '../middlewares/authMiddleware';
import {
  validateSignupInput,
  signupUser,
  validateLoginInput,
  sanitizeUserOutput,
} from '../models/user';
import { writeLog } from '../utils/log';

export const handleSignupUser = async (req: Request, res: Response) => {
  const { body } = req;
  const { errors, status } = await validateSignupInput(body);
  if (errors.length > 0) {
    res.status(status).json({ data: null, errors });
    return;
  }

  const { email, username, password } = body;
  const hashedPassword = await argon2.hash(password);
  const inputUser = { email, username, password: hashedPassword };

  const { data: user, error } = await signupUser(inputUser);
  if (error) {
    res.status(error.httpStatus).json({ data: null, errors: [error] });
    return;
  } if (!user) {
    writeLog({ event: 'null user after signup without error' }, 'anomaly');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ data: null, errors: [] });
    return;
  }

  createJWT(user.id, res);
  res.status(StatusCodes.CREATED).json({ data: sanitizeUserOutput(user), errors: [] });
};

export const handleLoginUser = async (req: Request, res: Response) => {
  const { body } = req;

  const { data: user, errors, status } = await validateLoginInput(body);
  if (errors.length > 0) {
    res.status(status).json({ data: null, errors });
    return;
  } if (!user) {
    writeLog({ event: 'null user after login without error' }, 'anomaly');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ data: null, errors: [] });
    return;
  }

  const { password } = body;
  const passwordMatches = await argon2.verify(user.password, password);
  if (!passwordMatches) {
    const error = { field: 'password', input: password, message: 'does not match for user' };
    res.status(StatusCodes.UNAUTHORIZED).json({ data: null, errors: [error] });
  }

  createJWT(user.id, res);
  res.status(StatusCodes.OK).json(
    { data: sanitizeUserOutput(user), errors: [] },
  );
};
