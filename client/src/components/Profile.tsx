import {
  Container, Table,
} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';

interface Result {
  id: number,
  userId: number,
  raceId: number,
  wpm: number,
  rank: number,
  createdAt: Date,
  passage: string
}

const Profile: React.FC = () => {
  const [elements, setElements] = useState<Result[]>([]);
  const navigate = useNavigate();

  const lsUser = localStorage.getItem('user');
  const user = lsUser ? JSON.parse(lsUser) : null;

  useEffect(() => {
    axios.get(`/results/user/${user.id}`).then((res) => {
      setElements(res.data.results);
    });
  }, []);

  const rows = elements.map((element) => (
    <tr key={element.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`race/${element.raceId}`)}>
      <td>{(new Date(element.createdAt)).toLocaleDateString()}</td>
      <td style={{
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '200px',
      }}
      >
        {element.passage}
      </td>
      <td>{element.rank}</td>
      <td>{element.wpm}</td>
    </tr>

  ));
  return (
    <Container>
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
