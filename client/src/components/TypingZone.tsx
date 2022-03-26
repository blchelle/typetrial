import React, { useState } from 'react';
import {
  Chip,
  Chips,
  Container,
  Paper, Text, TextInput, useMantineTheme,
} from '@mantine/core';
import { RaceData, TypeMessage, User } from '@utils/types';
import useUser from '@hooks/useUser';

import '../styles/powerups.css';
import FinishModal from './FinishModal';

interface TypingZoneProps {
  raceInfo: RaceData,
  websocket?: any
}

const TypingZone: React.FC<TypingZoneProps> = ({ websocket, raceInfo }) => {
  const { colors } = useMantineTheme();
  const { username } = useUser();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWordInput, setCurrentWordInput] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [error, setError] = useState(false);

  const [powerups, setPowerups] = useState<string[]>([]);

  let passage;
  if (!raceInfo.passage) {
    console.error('Passage could not be loaded');
    passage = 'waiting for passage...';
  } else if (powerups.includes('doubletap')) {
    passage = raceInfo.passage.split(' ').map((word, i) => (i === currentWordIndex ? word + word : word)).join(' ');
  } else {
    passage = raceInfo.passage;
  }

  const blurb = passage.split(' ');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (powerups.includes('knockout')) return;

    const { value } = event.target;

    const targetWord = blurb[currentWordIndex];
    const typedChars = [...blurb.slice(0, currentWordIndex), ''].join(' ').length + lastMatchingCharIndex(event.target.value, `${targetWord} `);
    setCurrentCharIndex(typedChars);

    if (
      value === `${targetWord} `
      || (value === targetWord && currentWordIndex === blurb.length - 1)
    ) {
      setError(false);
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentWordInput('');

      if (powerups.includes('doubletap')) {
        setCurrentCharIndex(currentCharIndex - Math.ceil(targetWord.length / 2) + 1);
      }

      sendTypingUpdate(typedChars);
    } else if (value !== targetWord.substring(0, value.length)) {
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

  const renderCursor = (charIndex: number, renderRaceInfo: RaceData): JSX.Element | null => {
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

  return (
    <Container size="sm">
      <FinishModal
        raceInfo={raceInfo}
        opened={currentWordIndex === blurb.length}

      />
      <Paper padding="xl" style={{ backgroundColor: colors.blue[1], position: 'relative' }}>
        <div className="relative w-full h-8 mb-8">
          <div
            className="h-full w-8 top-0 bg-primary absolute"
            style={{ left: `${(100 * currentWordIndex) / blurb.length}%` }}
          />
        </div>
        <div className="rounded-lg bg-gray-200 p-8">
          <div className={powerups.includes('rumble') ? 'rumble' : ''}>
            {passage.split('').map((letter, charIndex) => {
              const charColor = (charIndex < currentCharIndex) ? colors.green[8] : colors.gray[9];

              const baseOpacity = powerups.includes('whiteout') ? 0.07 : 1;
              const opacity = (charIndex < currentCharIndex) ? 1 : baseOpacity;

              return (
                <Text style={{
                  display: 'inline', position: 'relative', color: charColor,
                }}
                >
                  {renderCursor(charIndex, raceInfo)}
                  <span style={{ opacity }}>{letter}</span>
                </Text>
              );
            })}
          </div>
          {
            powerups.includes('rumble') && (
            <div style={{ opacity: 0 }}>
              <Text>{passage}</Text>
            </div>
            )
          }
          <TextInput
            styles={{ defaultVariant: { backgroundColor: error ? colors.red[5] : 'auto' } }}
            onChange={handleInputChange}
            value={currentWordInput}
            disabled={currentWordIndex === blurb.length || powerups.includes('knockout')}
            mt="lg"
          />
          {currentWordIndex === blurb.length && <p>You Win!</p>}
          <p>{`${raceInfo.userInfo[username].wpm} WPM`}</p>
        </div>
      </Paper>
      <Chips mt={8} value={powerups} onChange={setPowerups} multiple>
        <Chip value="rumble">Rumble</Chip>
        <Chip value="whiteout">Whiteout</Chip>
        <Chip value="doubletap">Doubletap</Chip>
        <Chip value="knockout">Knockout</Chip>
      </Chips>
    </Container>
  );
};

export default TypingZone;
