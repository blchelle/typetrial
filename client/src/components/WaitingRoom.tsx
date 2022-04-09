import React, { useState, useEffect } from 'react';
import { Button, Text, Group } from '@mantine/core';
import { useModals } from '@mantine/modals';
import useUser from '@hooks/useUser';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '@mantine/notifications';
import {
  Message, RaceDataMessage, RaceData, StartMessage, ErrorMessage,
} from '../utils/types';
import TypingZone from './TypingZone';
import env from '../config/environment';
import Racer from './Racer';
import Copy from './Copy';
import Countdown from './Countdown';

// FR4, FR5, FR6, FR7, FR14
// Handles all forms of waiting room, and establishes initial websocket connection
// FRs listed below

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
    activeEffects: [],
    owner: '',
  });

  const [websocket, setWebsocket] = useState<WebSocket>();
  const [errorMessage, setErrorMessage] = useState('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();
  const roomId = !isPublic && !isCreator ? useParams().roomId : '';
  const notifications = useNotifications();

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

  const createSocket = (name: string) => {
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
      // Gets roomID from URL and uses it to request join a specific private room: FR5
      if (!isPublic && !isCreator) {
        const connectMessage = JSON.stringify({
          type: 'connect_private',
          public: false,
          roomId,
        });
        ws.send(connectMessage);
      // Requests a new private room, with a new unique URL: FR4
      } else if (!isPublic) {
        const connectMessage = JSON.stringify({
          type: 'create_private',
          public: false,
          solo: isSolo,
        });
        ws.send(connectMessage);
      // Attempt join public queue, FR7
      } else {
        const connectMessage = JSON.stringify({
          type: 'connect_public',
          public: true,
        });
        ws.send(connectMessage);
      }
    };
    return ws;
  };

  useEffect(() => {
    const ws = createSocket(myUsername);
    return function cleanup() {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (errorMessage !== '') {
      openModal();
    }
  }, [errorMessage]);

  useEffect(() => {
    // Start the race in a public queue when enough players are ready: FR6
    if (raceInfo.users.length < 2 && !timeoutId && isPublic) {
      setTimeoutId(setTimeout(() => {
        notifications.showNotification({
          title: 'Warning',
          color: 'yellow',
          message: 'There are no other users looking for public matches.',
        });
      }, 180000));
    } else if (raceInfo.users.length > 1 && timeoutId && isPublic) {
      clearTimeout(timeoutId);
    }
  }, [raceInfo.users]);
  // Create start race button. It sends message to the server when ready: FR6
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
    const { countdownStart, raceStart, userInfo } = raceInfo;
    const joinedTime = userInfo[myUsername]?.joinedTime;

    if (!countdownStart || !raceStart || !joinedTime) return [null, null];

    return [
      Math.ceil((raceStart - joinedTime) / 1000),
      Math.ceil((raceStart - countdownStart) / 1000),
    ];
  };

  const [secondsToStart, timeout] = timeToStart();

  return (
    <div>
      <div>
        { !isCreator && !isPublic && !raceInfo.countdownStart && (
          <Text>Waiting for the host to start the race...</Text>
        )}
        { isPublic && !raceInfo.countdownStart && (
          <Text>Waiting for other users to join the race...</Text>
        )}
        { isCreator && !isSolo && (
          <>
            <Text>Invite your friends with this link</Text>
            <Copy text={`${env.baseClientUrl}/room/private/${raceInfo.roomId}`} />
          </>
        )}
        { secondsToStart !== null && timeout !== null && (
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
        {!raceInfo.isPublic && !raceInfo.isSolo && raceInfo.owner === myUsername && !raceInfo.countdownStart && <Button color="cyan" onClick={startRace} mb="lg">Start the Race</Button>}
      </div>
      { raceInfo.passage && <TypingZone websocket={websocket} raceInfo={raceInfo} /> }
    </div>
  );
};

export default Room;
