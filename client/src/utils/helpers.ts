import { WsUser } from './types';

export const finishSortFunction = ([_, user]: [string, WsUser], [_2, user2]:[string, WsUser]) => {
  const finishtime1 = (user.finished && user.finishTime)
    ? (new Date(user.finishTime).getTime() || Infinity) : Infinity;
  const finishtime2 = (user2.finished && user2.finishTime)
    ? (new Date(user2.finishTime).getTime() || Infinity) : Infinity;
  if (finishtime2 === finishtime1) {
    return user2.charsTyped - user.charsTyped;
  }
  return (finishtime1 - finishtime2);
};
