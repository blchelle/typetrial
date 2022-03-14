import {
  Container, Table, Card, useMantineTheme, Text,
} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useUser from '@hooks/useUser';
import axios from '@config/axios';

  interface Result {
    wpm: number,
    rank: number,
    userId: number,
    username: string
  }

  interface Race {
    id: number,
    passageId: number,
    passage: string,
    createdAt: Date,
    results: Result[]
  }

const RaceInfo: React.FC = () => {
  const [race, setRace] = useState<Race>();

  const user = useUser();
  const { raceId } = useParams();

  const { colors } = useMantineTheme();
  const whiteBg = { backgroundColor: colors.gray[0] };

  useEffect(() => {
    axios.get(`/races/get/${raceId}`).then((res) => {
      setRace(res.data.data);
    });
  }, []);

  const date = race ? `Date: ${(new Date(race.createdAt)).toLocaleDateString()} ${(new Date(race.createdAt)).toLocaleTimeString()}` : '';
  const passage = race ? `Passage: ${race.passage}` : '';

  const rows = race ? race.results.map((result) => (
    <tr key={result.rank} style={{ background: user.id === result.userId ? 'goldenrod' : undefined }}>
      <td>{result.rank}</td>
      <td>{result.username}</td>
      <td>{result.wpm}</td>
    </tr>

  )) : <tr />;
  return (
    <Container>
      <Card style={whiteBg}>

        <Table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>WPM</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
        <Text>{date}</Text>
        <Text>{passage}</Text>

      </Card>
    </Container>
  );
};

export default RaceInfo;
