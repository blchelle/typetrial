import { Modal, Title, Table } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { RaceData } from '@utils/types';
import useUser from '@hooks/useUser';
import { useNavigate } from 'react-router';
import { finishSortFunction } from '@utils/helpers';

interface FinishModalProps {
    raceInfo: RaceData,
    opened: boolean,
  }

const FinishModal: React.FC<FinishModalProps> = ({ raceInfo, opened }) => {
  const { username } = useUser();
  const navigate = useNavigate();

  const [rows, setRows] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const racers = Object.entries(raceInfo.userInfo).sort(finishSortFunction);

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
