import { StatusCodes } from 'http-status-codes';
import APIError from './apiError';

/**
   * Utility to create 404 Not Found Errors.
   */
export class NotFoundError extends APIError {
  constructor(entity: string) {
    super(`${entity} not found`, StatusCodes.NOT_FOUND);
  }
}
