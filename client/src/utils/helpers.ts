import { MILLISECONDS_PER_MINUTE } from './constants';
import { User } from './types';

export const getUtcTime = () => {
  const now = new Date();
  const nowUtc = new Date(now.getTime() + (now.getTimezoneOffset() * MILLISECONDS_PER_MINUTE));
  return nowUtc;
};

export const finishSortFunction = ([_, user]: [string, User], [_2, user2]:[string, User]) => {
  const finishtime1 = (user.finished && user.finishTime)
    ? (new Date(user.finishTime).getTime() || Infinity) : Infinity;
  const finishtime2 = (user2.finished && user2.finishTime)
    ? (new Date(user2.finishTime).getTime() || Infinity) : Infinity;
  if (finishtime2 === finishtime1) {
    return user2.charsTyped - user.charsTyped;
  }
  return (finishtime1 - finishtime2);
};
