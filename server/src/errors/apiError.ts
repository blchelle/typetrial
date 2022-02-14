import { StatusCodes } from 'http-status-codes';

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

  constructor(message: string, statusCode: StatusCodes) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;

    // Prevents APIError objects from being implicitly casted to Error
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default APIError;
