import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime';
import APIError from '../errors/apiError';
import FieldError from '../errors/fieldError';
import { writeLog } from '../utils/log';

/**
 * Catches errors in the express middleware and sends details about them as a response,
 * All 4 parameters are required since that is how express differentiates between normal
 * middleware and error handling middleware
 * @param err The http exception
 * @param _req Incoming request, UNUSED
 * @param res Outgoing Response
 * @param next Calls the next middleware, UNUSED
 */
function handleError(err: Error, _: Request, res: Response, next: NextFunction) {
  let status = StatusCodes.INTERNAL_SERVER_ERROR;
  let message;
  let fieldErrors: FieldError[] = [];

  // Handle the error based on what kind of error is received
  // Branches are ordered from most common to least common
  if (err instanceof APIError) {
    status = err.statusCode;
    message = err.message;
    fieldErrors = err.fieldErrors;
  } else if (err instanceof JsonWebTokenError) {
    status = StatusCodes.UNAUTHORIZED;
    message = err.message;
  } else if (err instanceof PrismaClientValidationError) {
    message = 'invalid request';
    status = StatusCodes.UNPROCESSABLE_ENTITY;
  } else if (err instanceof PrismaClientKnownRequestError) {
    // TODO: Parse e.code to get a better error message
    message = 'invalid request';
    status = StatusCodes.UNPROCESSABLE_ENTITY;
  } else if (err instanceof PrismaClientUnknownRequestError) {
    message = 'unknown request error';
  } else if (err instanceof PrismaClientInitializationError) {
    writeLog({ event: 'prisma client failed to initialize' }, 'anomaly');
    message = 'service unavailable';
  } else if (err instanceof PrismaClientRustPanicError) {
    writeLog({ event: 'prisma engine has crashed and has to be restarted' }, 'anomaly');
    message = 'prisma engine has crashed and has to be restarted';
  } else {
    status = StatusCodes.INTERNAL_SERVER_ERROR;
    message = 'unknown error';
  }

  res.status(status).send({ data: null, error: { message, fieldErrors } });
  next();
}

export default handleError;
