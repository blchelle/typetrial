import { StatusCodes } from 'http-status-codes';
import APIError from './apiError';

/**
   * Utility to create 403 Forbidden Errors.
   */
export class ForbiddenError extends APIError {
  constructor() {
    super('unauthorized', StatusCodes.FORBIDDEN);
  }
}
