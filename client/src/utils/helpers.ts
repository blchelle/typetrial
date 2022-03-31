import { MILLISECONDS_PER_MINUTE } from './constants';

export const getUtcTime = () => {
  const now = new Date();
  const nowUtc = new Date(now.getTime() + (now.getTimezoneOffset() * MILLISECONDS_PER_MINUTE));
  return nowUtc;
};
