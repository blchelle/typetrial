import React, { useState, useEffect } from 'react';
import {
  List, ListItem, Button, Text,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import useUser from '@hooks/useUser';
import { MILLISECONDS_PER_MINUTE } from '@utils/constants';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Message, RaceDataMessage, RaceData, StartMessage, ErrorMessage,
} from '../utils/types';
import TypingZone from './TypingZone';
import env from '../config/environment';

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
    start: new Date(),
    passage: '',
    users: [],
    userInfo: {},
    owner: '',
  });

  const [websocket, setWebsocket] = useState<WebSocket>();
  const [countDown, setCountDown] = useState(isPublic ? 10 : 3);
  const [errorMessage, setErrorMessage] = useState('');
  const roomId = !isPublic && !isCreator ? useParams().roomId : '';

  const modals = useModals();
  const navigate = useNavigate();
  const { username } = useUser();

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
    createSocket(username);
  }, []);

  useEffect(() => {
    if (errorMessage !== '') {
      openModal();
    }
  }, [errorMessage]);

  useEffect(() => {
    if (raceInfo.isPublic || raceInfo.isSolo) {
      const intervalId = setInterval(() => {
        const now = new Date();
        const nowUtc = new Date(now.getTime()
            + (now.getTimezoneOffset() * MILLISECONDS_PER_MINUTE));
        const rem = Math.round((new Date(raceInfo.start).getTime() - nowUtc.getTime()) / 1000);
        if (rem < 0) clearInterval(intervalId);
        else {
          setCountDown(rem);
        }
      }, 1000);
    }
  }, [raceInfo.start]);

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

  return (
    <div>
      {raceInfo.hasStarted
        ? <TypingZone websocket={websocket} raceInfo={raceInfo} />
        : (
          <div>
            {isPublic || isSolo ? (`Race Starting in: ${countDown}`) : (raceInfo.roomId && `${env.baseClientUrl}/room/private/${raceInfo.roomId}`)}
            <List>
              {raceInfo.users.map((user) => <ListItem key={user}>{user}</ListItem>)}
            </List>
            {!raceInfo.isPublic && !raceInfo.isSolo && raceInfo.owner === username && <Button color="cyan" onClick={startRace}>Race your friends</Button>}
          </div>
        )}
    </div>
  );
};

export default Room;
