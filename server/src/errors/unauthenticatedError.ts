import { StatusCodes } from 'http-status-codes';
import APIError from './apiError';

/**
 * Utility to create 401 Unauthenticated Errors.
 */
export class UnauthenticatedError extends APIError {
  constructor() {
    super('unauthenticated', StatusCodes.UNAUTHORIZED);
  }
}
