import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import APIError from '../errors/apiError';

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
  let status;
  let message;

  // Handle the error based on what kind of error is received
  if (err instanceof APIError) {
    status = err.statusCode;
    message = err.message;
  } else if (err instanceof JsonWebTokenError) {
    status = StatusCodes.UNAUTHORIZED;
    message = err.message;
  } else {
    status = StatusCodes.INTERNAL_SERVER_ERROR;
    message = 'unknown error';
  }

  res.status(status).send({ data: null, errors: [message] });
  next();
}

export default handleError;
