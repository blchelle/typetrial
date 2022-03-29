import { Progress } from '@mantine/core';
import React, { useState } from 'react';

interface CountdownProps {
    secondsLeft: number
}

const Countdown: React.FC<CountdownProps> = ({ secondsLeft }) => {
  const [timeLeft, setTimeLeft] = useState(secondsLeft);

  setTimeout(() => {
    if (timeLeft <= 0) return;
    setTimeLeft(timeLeft - 1);
  }, 1000);

  return (
    <Progress
      value={timeLeft > 0 ? 100 * (timeLeft / secondsLeft) : 100}
      label={timeLeft > 0 ? timeLeft.toString() : 'GO!'}
      size="xl"
      style={{ height: '2rem' }}
      styles={{ label: { fontSize: '1rem' } }}
      color={timeLeft > 0 ? 'blue' : 'green'}
    />
  );
};

export default Countdown;
