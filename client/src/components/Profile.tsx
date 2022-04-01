import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Group, Pagination, Table, useMantineTheme,
} from '@mantine/core';
import {
  LineChart, Line, CartesianGrid, YAxis, Label, XAxis, Tooltip,
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

const PER_PAGE = 10;

const Profile: React.FC = () => {
  const { fontFamily } = useMantineTheme();

  const [results, setResults] = useState<Result[]>([]);
  const [activePage, setActivePage] = useState(1);
  const navigate = useNavigate();

  // TODO: Computationally heavy
  // If this component starts to render slowly, this is likely it
  //
  // Computes a moving average over the last 10 races
  const wpmResults = results.map(
    (_, i) => ({
      wpm: Math.round(
        10 * results
          .slice(Math.max(0, i - 9), i + 1)
          .reduce((avg, { wpm }, j) => ((avg * j) + wpm) / (j + 1), 0),
      ) / 10,
      raceNumber: i + 1,
    }),
  );

  const user = useUser();

  useEffect(() => {
    axios.get(`/results/user/${user.id}`).then((res) => {
      const { data } = res.data;
      setResults(data);
    });
  }, [activePage]);

  const rows = results
    .slice((activePage - 1) * PER_PAGE, (activePage - 1) * PER_PAGE + PER_PAGE)
    .map((result) => (
      <tr key={result.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`race/${result.raceId}`)}>
        <td>{(new Date(result.Race.createdAt)).toLocaleDateString()}</td>
        <td style={{
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '400px',
        }}
        >
          {result.Race.Passage.text}
        </td>
        <td>{result.rank}</td>
        <td>{result.wpm}</td>
      </tr>
    ));

  return (
    <Group align="center" direction="column">
      {results && results.length !== 0 && (
      <LineChart
        width={800}
        height={400}
        data={wpmResults}
      >
        <Line
          type="monotone"
          stroke={useMantineTheme().colors.blue[6]}
          dataKey="wpm"
          dot={false}
          strokeWidth={2}
        />
        <CartesianGrid stroke={useMantineTheme().colors.gray[4]} />
        <YAxis fontFamily={fontFamily} fontSize={14} domain={['auto', 'auto']}>
          <Label angle={-90} position="insideLeft" fontFamily={fontFamily}>WPM</Label>
        </YAxis>
        <Tooltip />
        <XAxis
          fontFamily={fontFamily}
          minTickGap={50} // width / 10
          fontVariant={fontFamily}
          tickSize={4}
          fontSize={14}
          dataKey="raceNumber"
        >
          <Label position="bottom" fontFamily={fontFamily} offset={-7}>Race number</Label>
        </XAxis>
      </LineChart>
      )}
      <Table highlightOnHover>
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
      <Pagination
        page={activePage}
        onChange={setActivePage}
        total={Math.ceil(results.length / PER_PAGE)}
      />
    </Group>
  );
};

export default Profile;
