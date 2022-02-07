import argon2 from 'argon2';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import {
  validateSignupInput, signupUser, validateLoginInput, sanitizeUserOutput,
} from '../models/user';
import environment from '../config/environment';
import { writeLog } from '../utils/log';

const createJWT = (userId: number, res: Response) => {
  const { secret, expiryTime, secure } = environment.jwt;

  const token = jwt.sign({ id: userId }, secret, { expiresIn: expiryTime });
  const cookieOptions = {
    expires: new Date(Date.now() + 1000 * expiryTime),
    httpOnly: true,
    secure,
  };

  res.cookie('jwt', token, cookieOptions);
};

export const handleSignupUser = async (req: Request, res: Response) => {
  const { body } = req;
  const errors = await validateSignupInput(body);
  if (errors.length > 0) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ data: null, errors });
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

  const { data: user, errors } = await validateLoginInput(body);
  if (errors.length > 0) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ data: null, errors });
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
  res.status(StatusCodes.CREATED).json(
    { data: sanitizeUserOutput(user), errors: [] },
  );
};
