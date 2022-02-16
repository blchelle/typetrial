import { StatusCodes } from 'http-status-codes';
import FieldError from './fieldError';

/**
 * Used for creating API Errors.
 * These errors can be caused by a malformed request, an internal server error, a failed database
 * operation, the client trying to access a resource which they do not have the authorization for,
 * the client trying to access a resource which does not exist, etc...
 */
class APIError extends Error {
  /**
   * The HTTP status code that will be sent in the response
   */
  statusCode: StatusCodes;

  /**
   * Specific errors related to the users input.
   * i.e. Weak password, using an email that already exists, missing a required field, etc...
   */
  fieldErrors: FieldError[];

  constructor(message: string, statusCode: StatusCodes, fieldErrors: FieldError[] = []) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.fieldErrors = fieldErrors;

    // Prevents APIError objects from being implicitly casted to Error
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default APIError;
