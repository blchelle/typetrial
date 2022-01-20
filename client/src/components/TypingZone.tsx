import React, { useState } from 'react';

const blurb = "We can now get these kids to buy just about anything. We can have them chasing a new trend every week. And that is good for the economy. And what's good for the economy is good for the country.".split(
  ' ',
);

const MILLISECONDS_PER_MINUTE = 60000;

let timer: NodeJS.Timer;
const TypingZone: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWordInput, setCurrentWordInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [charactersTyped, setCharactersTyped] = useState<number>(0);
  const [error, setError] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (!startTime) {
      setStartTime(new Date().getTime());
    }

    setCharactersTyped(charactersTyped);

    if (
      value === `${blurb[currentWordIndex]} `
      || (value === blurb[currentWordIndex] && currentWordIndex === blurb.length - 1)
    ) {
      setError(false);
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentWordInput('');
      setEndTime(new Date().getTime());
    } else if (value !== blurb[currentWordIndex].substring(0, value.length)) {
      setError(true);
      setCurrentWordInput(event.target.value);
    } else {
      setError(false);
      setCurrentWordInput(event.target.value);
    }
  };

  const convertTimeToWPM = (): number => {
    if (!startTime || !endTime) {
      return 0;
    }

    const charsTyped = blurb.slice(0, currentWordIndex).reduce((acc, curr) => acc + curr.length, 0);
    const wpm = ((charsTyped / 5) * MILLISECONDS_PER_MINUTE) / (endTime - startTime);

    return Math.round(wpm);
  };

  const lastMatchingCharIndex = (word: string): number => {
    let i = 0;
    while (i < blurb[currentWordIndex].length && word[i] === blurb[currentWordIndex][i]) {
      i += 1;
    }

    return i;
  };

  const renderCursor = (wordIndex: number, letterIndex: number): JSX.Element | null => {
    if (currentWordIndex === wordIndex && letterIndex === lastMatchingCharIndex(currentWordInput)) {
      return (
        <span className="animate-blink absolute top-0 left-0 bg-gray-700 h-5 inline-block" style={{ width: '1px' }} />
      );
    }

    return null;
  };

  clearTimeout(timer);
  timer = setInterval(() => {
    if (currentWordIndex < blurb.length && startTime) {
      setEndTime(new Date().getTime());
    }
  }, 3000);

  return (
    <div className="flex flex-col w-11/12 md:w-[40rem]">
      <div className="relative w-full h-8 mb-8">
        <div
          className="h-full w-8 top-0 bg-primary absolute"
          style={{ left: `${(100 * currentWordIndex) / blurb.length}%` }}
        />
      </div>
      <div className="rounded-lg bg-gray-200 p-8">
        <div className="mb-5">
          {blurb.map((word, index) => [...word, ' '].map((letter, letterIndex) => {
            const charColor = index < currentWordIndex || (index === currentWordIndex && letterIndex < lastMatchingCharIndex(currentWordInput)) ? 'text-green-600' : '';

            return (
              <span className={`inline relative ${charColor}`}>
                {renderCursor(index, letterIndex)}
                {letter}
              </span>

            );
          }))}
        </div>
        <input
          type="text"
          className={`border border-gray-400 p-2 w-full ${error ? 'bg-red-500' : ''}`}
          onChange={handleInputChange}
          value={currentWordInput}
          disabled={currentWordIndex === blurb.length}
        />
        {currentWordIndex === blurb.length && <p>You Win!</p>}
        {startTime && endTime && <p>{`${convertTimeToWPM()} WPM`}</p>}
      </div>
    </div>
  );
};

export default TypingZone;
