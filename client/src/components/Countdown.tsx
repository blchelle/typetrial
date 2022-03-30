import { Progress } from '@mantine/core';
import React, { useState } from 'react';

interface CountdownProps {
    startSeconds: number
    maxSeconds: number
}

const Countdown: React.FC<CountdownProps> = ({ startSeconds, maxSeconds }) => {
  const [isSynced, setIsSynced] = useState(false);
  const [timeLeft, setTimeLeft] = useState(startSeconds);

  const msToNextSecond = 1000 - new Date().getMilliseconds();

  setTimeout(() => {
    if (timeLeft <= 0) return;
    setTimeLeft(timeLeft - 1);

    if (!isSynced) setIsSynced(true);
  }, isSynced ? 1000 : msToNextSecond);

  return (
    <Progress
      value={timeLeft > 0 ? 100 * (timeLeft / maxSeconds) : 100}
      label={timeLeft > 0 ? timeLeft.toString() : 'GO!'}
      size="xl"
      style={{ height: '2rem' }}
      styles={{ label: { fontSize: '1rem' } }}
      color={timeLeft > 0 ? 'blue' : 'green'}
    />
  );
};

export default Countdown;
