import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime';
import { StatusCodes } from 'http-status-codes';

import { writeLog } from './log';

interface PrismaError {
    message: string
    httpStatus: number
}

export const classifyPrismaError = (e: unknown): PrismaError => {
  if (e instanceof PrismaClientKnownRequestError) {
    // TODO: Parse e.code to get a better error message
    return { message: 'invalid request', httpStatus: StatusCodes.UNPROCESSABLE_ENTITY };
  } if (e instanceof PrismaClientUnknownRequestError) {
    return { message: 'unknown request error', httpStatus: StatusCodes.INTERNAL_SERVER_ERROR };
  } if (e instanceof PrismaClientRustPanicError) {
    writeLog({ event: 'prisma engine has crashed and has to be restarted' }, 'anomaly');
    return { message: 'service unavailable', httpStatus: StatusCodes.INTERNAL_SERVER_ERROR };
  } if (e instanceof PrismaClientInitializationError) {
    writeLog({ event: 'prisma client failed to initialize' }, 'anomaly');
    return { message: 'service unavailable', httpStatus: StatusCodes.INTERNAL_SERVER_ERROR };
  } if (e instanceof PrismaClientValidationError) {
    return { message: 'invalid request', httpStatus: StatusCodes.UNPROCESSABLE_ENTITY };
  }

  writeLog({ event: 'unclassifiable prisma error' }, 'anomaly');
  return { message: 'unknown error', httpStatus: StatusCodes.INTERNAL_SERVER_ERROR };
};
