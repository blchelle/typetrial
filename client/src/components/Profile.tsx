import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Table, useMantineTheme,
} from '@mantine/core';
import {
  LineChart, Line, CartesianGrid, YAxis, Label,
} from 'recharts';

import useUser from '@hooks/useUser';
import axios from '@config/axios';

interface Result {
  id: number,
  userId: number,
  raceId: number,
  wpm: number,
  rank: number,
  Race: {
    Passage: {
        text: string;
    };
    createdAt: Date;
  };
}

const Profile: React.FC = () => {
  const { fontFamily } = useMantineTheme();

  const [results, setResults] = useState<Result[]>([]);
  const navigate = useNavigate();

  const user = useUser();

  useEffect(() => {
    axios.get(`/results/user/${user.id}`).then((res) => {
      setResults(res.data.data);
    });
  }, []);

  const rows = results.map((result) => (
    <tr key={result.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`race/${result.raceId}`)}>
      <td>{(new Date(result.Race.createdAt)).toLocaleDateString()}</td>
      <td style={{
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '200px',
      }}
      >
        {result.Race.Passage.text}
      </td>
      <td>{result.rank}</td>
      <td>{result.wpm}</td>
    </tr>

  ));
  return (
    <Container>
      {results && results.length !== 0 && (
      <LineChart width={600} height={300} data={results}>
        <Line type="monotone" dataKey="wpm" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" />
        <YAxis fontFamily={fontFamily}>
          <Label angle={-90} position="insideLeft" fontFamily={fontFamily}>WPM</Label>
        </YAxis>
      </LineChart>
      )}
      <Table
        highlightOnHover
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>Passage Typed</th>
            <th>Your Rank</th>
            <th>Your WPM</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    </Container>
  );
};

export default Profile;
