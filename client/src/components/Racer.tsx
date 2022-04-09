import useUser from '@hooks/useUser';
import {
  Text, Group,
} from '@mantine/core';
import React, { useRef } from 'react';
import RacerJoe from './RacerJoe';

// Icon that moves as each player types: FR10

interface RacerProps {
    name: string
    color: string
    wpm: number
    progress: number
}

const Racer: React.FC<RacerProps> = ({
  name, color, progress, wpm,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackWidth = (trackRef.current?.offsetWidth ?? 140) - 140;
  const { username } = useUser();

  return (
    <Group direction="column" spacing={0} align="stretch" ref={trackRef}>
      <Text size="sm">{`${name}${username === name ? ' (you)' : ''}`}</Text>
      <Group position="apart">
        <RacerJoe color={color} progress={progress * trackWidth} />
        <Text style={{ width: '80px', borderLeft: '2px solid #000' }} align="right">
          {wpm}
          {' '}
          WPM
        </Text>
      </Group>
      <div style={{ width: '100%', height: '2px', backgroundColor: '#000' }} />
    </Group>
  );
};

export default Racer;
