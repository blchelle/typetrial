import React, { useState, useEffect } from 'react';
import { Button, Text, Group } from '@mantine/core';
import { useModals } from '@mantine/modals';
import useUser from '@hooks/useUser';
import { useParams, useNavigate } from 'react-router-dom';
import { getUtcTime } from '@utils/helpers';
import {
  Message, RaceDataMessage, RaceData, StartMessage, ErrorMessage,
} from '../utils/types';
import TypingZone from './TypingZone';
import env from '../config/environment';
import Racer from './Racer';
import Copy from './Copy';
import Countdown from './Countdown';

interface RoomProps {
  isPublic?: boolean;
  isCreator?: boolean;
  isSolo?: boolean;
}

const Room: React.FC<RoomProps> = (
  { isPublic = false, isCreator = false, isSolo = false },
) => {
  const [raceInfo, setRaceInfo] = useState<RaceData>({
    roomId: '',
    hasStarted: false,
    isPublic: false,
    isSolo,
    passage: '',
    users: [],
    userInfo: {},
    owner: '',
  });

  const [websocket, setWebsocket] = useState<WebSocket>();
  const [errorMessage, setErrorMessage] = useState('');
  const roomId = !isPublic && !isCreator ? useParams().roomId : '';

  const modals = useModals();
  const navigate = useNavigate();
  const { username: myUsername } = useUser();

  const openModal = () => {
    modals.openModal(
      {
        title: errorMessage,
        size: 400,
        onClose: () => handleError(),
        children: (
          <>
            <Text>
              Closing this will navigate you back to the home screen.
            </Text>
            <Button onClick={() => handleError()}>
              Close
            </Button>
          </>
        ),
      },
    );
  };

  const createSocket = async (name: string) => {
    const ws = new WebSocket(`${env.baseSocketUrl}/api/connect/${name}`);

    ws.onopen = () => {
      setWebsocket(ws);

      // receive messages
      ws.onmessage = (res) => {
        const response: Message = JSON.parse(res.data);
        if (response.type === 'raceData') {
          const updateResponse = response as RaceDataMessage;
          setRaceInfo(updateResponse.raceInfo);
        } else if (response.type === 'error') {
          const errorResponse = response as ErrorMessage;
          setErrorMessage(errorResponse.message);
        }
      };

      if (!isPublic && !isCreator) {
        const connectMessage = JSON.stringify({
          type: 'connect_private',
          public: false,
          roomId,
        });
        ws.send(connectMessage);
      } else if (!isPublic) {
        const connectMessage = JSON.stringify({
          type: 'create_private',
          public: false,
          solo: isSolo,
        });
        ws.send(connectMessage);
      } else {
        const connectMessage = JSON.stringify({
          type: 'connect_public',
          public: true,
        });
        ws.send(connectMessage);
      }
    };
  };

  useEffect(() => {
    createSocket(myUsername);
  }, []);

  useEffect(() => {
    if (errorMessage !== '') {
      openModal();
    }
  }, [errorMessage]);

  const startRace = () => {
    const startMessage: StartMessage = {
      type: 'start',
    };
    websocket?.send(JSON.stringify(startMessage));
  };

  const handleError = () => {
    websocket?.close();
    navigate('/');
    modals.closeAll();
  };

  const timeToStart = () => {
    if (!raceInfo.countdownStart || !raceInfo.raceStart) return [null, null];

    const { countdownStart, raceStart } = raceInfo;
    return [
      Math.ceil((raceStart - getUtcTime().getTime()) / 1000),
      Math.ceil((raceStart - countdownStart) / 1000),
    ];
  };

  const [secondsToStart, timeout] = timeToStart();

  return (
    <div>
      <div>
        { !isCreator && !isPublic && !raceInfo.hasStarted && (
          <Text>Waiting for the host to start the race...</Text>
        )}
        { isCreator && !isSolo && (
          <>
            <Text>Invite your friends with this link</Text>
            <Copy text={`${env.baseClientUrl}/room/private/${raceInfo.roomId}`} withIcon />
          </>
        )}
        { (isPublic || isSolo) && secondsToStart !== null && timeout !== null && (
          <Countdown maxSeconds={timeout} startSeconds={secondsToStart} />
        ) }
        <Group direction="column" align="stretch" mb="lg" mt="lg">
          {Object.entries(raceInfo.userInfo).map(
            ([username, { color, wpm, charsTyped }]) => (
              <Racer
                key={username}
                name={username}
                color={color}
                wpm={wpm}
                progress={charsTyped / (raceInfo.passage?.length ?? 1)}
              />
            ),
          )}
        </Group>
        {!raceInfo.isPublic && !raceInfo.isSolo && raceInfo.owner === myUsername && !raceInfo.hasStarted && <Button color="cyan" onClick={startRace} mb="lg">Start the Race</Button>}
      </div>
      { raceInfo.passage && <TypingZone websocket={websocket} raceInfo={raceInfo} /> }
    </div>
  );
};

export default Room;
