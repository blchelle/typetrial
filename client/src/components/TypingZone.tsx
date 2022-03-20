import React, { useState } from 'react';
import {
  Container,
  Paper, Text, TextInput, useMantineTheme,
} from '@mantine/core';
import { MILLISECONDS_PER_MINUTE } from '@utils/constants';
import { RaceData, TypeMessage, User } from '@utils/types';
import useUser from '@hooks/useUser';

const passage = "We can now get these kids to buy just about anything. We can have them chasing a new trend every week. And that is good for the economy. And what's good for the economy is good for the country.";
const blurb = passage.split(' ');

interface TypingZoneProps {
  websocket: any,
  raceInfo: RaceData,
}

let timer: NodeJS.Timer;
const TypingZone: React.FC<TypingZoneProps> = ({ websocket, raceInfo }) => {
  const theme = useMantineTheme();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWordInput, setCurrentWordInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [error, setError] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (!startTime) {
      setStartTime(new Date().getTime());
    }

    const typedChars = [...blurb.slice(0, currentWordIndex), '']
      .join(' ').length + lastMatchingCharIndex(event.target.value, `${blurb[currentWordIndex]} `);
    setCurrentCharIndex(typedChars);

    if (
      value === `${blurb[currentWordIndex]} `
      || (value === blurb[currentWordIndex] && currentWordIndex === blurb.length - 1)
    ) {
      setError(false);
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentWordInput('');
      setEndTime(new Date().getTime());
      sendTypingUpdate(typedChars);
    } else if (value !== blurb[currentWordIndex].substring(0, value.length)) {
      setError(true);
      setCurrentWordInput(event.target.value);
    } else {
      setError(false);
      setCurrentWordInput(event.target.value);
      sendTypingUpdate(typedChars);
    }
  };

  const lastMatchingCharIndex = (s1:string, s2:string):number => {
    let i;
    for (i = 0; i < Math.min(s1.length, s2.length); i += 1) {
      if (s1[i] !== s2[i]) { break; }
    }
    return i;
  };

  const sendTypingUpdate = (charsTyped: number) => {
    const typeMessage: TypeMessage = {
      type: 'type',
      charsTyped,
    };
    websocket?.send(JSON.stringify(typeMessage));
  };

  const convertTimeToWPM = (): number => {
    if (!startTime || !endTime) {
      return 0;
    }

    const charsTyped = blurb.slice(0, currentWordIndex).reduce((acc, curr) => acc + curr.length, 0);
    const wpm = ((charsTyped / 5) * MILLISECONDS_PER_MINUTE) / (endTime - startTime);

    return Math.round(wpm);
  };

  const renderCursor = (charIndex: number, renderRaceInfo: RaceData): JSX.Element | null => {
    const { username } = useUser();
    const localUser = {
      ...renderRaceInfo.userInfo[username],
      charsTyped: currentCharIndex,
    };
    const lUserInfo: {[key: string]: User; } = {
      ...renderRaceInfo.userInfo,
      [username]: localUser,
    };
    const cursor = Object.values(lUserInfo)
      .filter((user) => user.charsTyped === charIndex)
      .map((user) => (
        <span
          style={{
            width: '2px',
            top: 0,
            backgroundColor: user.color,
            left: 0,
            display: 'inline-block',
            height: '1rem',
            position: 'absolute',
          }}
        />
      ))[0] || null;

    return cursor;
  };

  clearTimeout(timer);
  timer = setInterval(() => {
    if (currentWordIndex < blurb.length && startTime) {
      setEndTime(new Date().getTime());
    }
  }, 3000);

  return (
    <Container size="sm">
      <Paper padding="xl" style={{ backgroundColor: theme.colors.blue[1] }}>
        <div className="relative w-full h-8 mb-8">
          <div
            className="h-full w-8 top-0 bg-primary absolute"
            style={{ left: `${(100 * currentWordIndex) / blurb.length}%` }}
          />
        </div>
        <div className="rounded-lg bg-gray-200 p-8">
          <div className="mb-5">

            {blurb.join(' ').split('').map((letter, charindex) => {
              const charColor = (charindex < currentCharIndex) ? theme.colors.green[8] : '';

              return (
                <Text style={{ display: 'inline', position: 'relative', color: charColor }}>
                  {renderCursor(charindex, raceInfo)}
                  {letter}
                </Text>

              );
            })}
          </div>
          <TextInput
            styles={{ defaultVariant: { backgroundColor: error ? theme.colors.red[5] : 'auto' } }}
            onChange={handleInputChange}
            value={currentWordInput}
            disabled={currentWordIndex === blurb.length}
          />
          {currentWordIndex === blurb.length && <p>You Win!</p>}
          {startTime && endTime && <p>{`${convertTimeToWPM()} WPM`}</p>}
        </div>
      </Paper>
    </Container>
  );
};

export default TypingZone;
