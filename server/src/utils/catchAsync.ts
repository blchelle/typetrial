import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';

/**
 * A wrapper to be used around asynchronous functions that can throw errors,
 * this removes the need to embed any asynchronous code in a try-catch block
 * @param fn The function to wrap
 */
const catchAsync = (fn: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Your editor might warn you that the await below is unnecessary
    // It is very much necessary, if it is omitted no errors will be caught
    await fn(req, res, next);
  } catch (error) {
    // Forwards the error to the custom error handling middleware in errorMiddleware.ts
    next(error);
  }
};

export default catchAsync;
