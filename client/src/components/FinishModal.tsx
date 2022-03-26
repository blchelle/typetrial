import { Modal, Title, Table } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { RaceData } from '@utils/types';
import useUser from '@hooks/useUser';
import { useNavigate } from 'react-router';

interface FinishModalProps {
    raceInfo: RaceData,
    opened: boolean,
  }

const FinishModal: React.FC<FinishModalProps> = ({ raceInfo, opened }) => {
  const { username } = useUser();
  const navigate = useNavigate();

  const [rows, setRows] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const racers = Object.entries(raceInfo.userInfo)

      .sort(([_, user], [_2, user2]) => {
        const finishtime1 = (user.finished && user.finishTime)
          ? (new Date(user.finishTime).getTime() || Infinity) : Infinity;
        const finishtime2 = (user2.finished && user2.finishTime)
          ? (new Date(user2.finishTime).getTime() || Infinity) : Infinity;
        if (finishtime2 === finishtime1) {
          return user2.charsTyped - user.charsTyped;
        }
        return (finishtime1 - finishtime2);
      });

    setRows(racers.map(([racerUsername, user], i) => {
      const rank = user.finished ? i + 1 : '?';
      return (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={racerUsername} style={{ background: username === racerUsername ? 'goldenrod' : undefined }}>
          <td>{rank}</td>
          <td>{racerUsername}</td>
          <td>{Math.floor(user.wpm)}</td>
        </tr>
      );
    }));
  }, [raceInfo]);

  return (
    <Modal
      opened={opened}
      onClose={() => { navigate('/'); }}
      title="Finished!"
    >
      <Title order={5}>Stats</Title>
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
      Closing this will navigate you back to the home screen
    </Modal>
  );
};

export default FinishModal;
