import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import env from '../config/environment';
import APIError from '../errors/apiError';
import { getUserById } from '../models/user';

export const createJWT = (userId: number, res: Response) => {
  const { secret, expiryTime, secure } = env.jwt;

  const token = jwt.sign({ id: userId }, secret, { expiresIn: expiryTime });
  const cookieOptions = {
    expires: new Date(Date.now() + 1000 * expiryTime),
    httpOnly: true,
    secure,
  };

  res.cookie('Bearer', token, cookieOptions);
};

const validateJWT = (authHeader?: string) => {
  if (!authHeader) return { token: null, error: new JsonWebTokenError('no token provided') };

  // Verify that the authorization header used a Bearer token
  // Splitting the header on a space will give us an array like this -> [TokenType, Token]
  const [tokenType, token] = authHeader.split(' ');
  if (tokenType !== 'Bearer') {
    return { token: null, error: new JsonWebTokenError('invalid token type') };
  }

// Verify that the token is valid (no tampering) and that the decoded token has an id property
type DecodedToken = { id: number; iat: number; exp: number };
const decodedToken = jwt.verify(token, env.jwt.secret) as DecodedToken;
if (typeof decodedToken !== 'object' || !decodedToken.id || !decodedToken.iat) {
  return { token: null, error: new JsonWebTokenError('invalid token') };
}

return { token: decodedToken, error: null };
};

const checkPermissions = (userRole: Role, requiredRole: Role) => {
  if (userRole === Role.ADMIN) return true;
  if (userRole === Role.USER) return requiredRole === Role.USER;

  return false;
};

export const protectRoute = (minRole: Role) => async (req: Request, _: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  try {
    const { token, error } = validateJWT(authorization);
    if (error) return next(error);
    if (!token?.id) return next(new JsonWebTokenError('no user id on token'));

    const user = await getUserById(token.id);
    if (!user) return next(new JsonWebTokenError('user in token does not exist'));

    if (user.passwordChangedAt && user.passwordChangedAt.getTime() > token.iat) {
      return next(new JsonWebTokenError('token expired'));
    }

    if (!checkPermissions(user.role, minRole)) {
      return next(new APIError('unauthorized to perform this action', StatusCodes.FORBIDDEN));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
