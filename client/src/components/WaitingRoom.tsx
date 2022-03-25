import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import {
  Modal, List, ListItem, Button,
} from '@mantine/core';
import useUser from '@hooks/useUser';
import { MILLISECONDS_PER_MINUTE } from '@utils/constants';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Message, RaceDataMessage, RaceData, StartMessage, ErrorMessage,
} from '../utils/types';
import TypingZone from './TypingZone';

interface WaitingRoomProps {
  isPublic: boolean;
  isCreator: boolean;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ isPublic, isCreator }) => {
  const [raceInfo, setRaceInfo] = useState<RaceData>({
    roomId: '',
    hasStarted: false,
    isPublic: false,
    start: new Date(),
    passage: '',
    users: [],
    userInfo: {},
    owner: '',
  });

  const [websocket, setWebsocket] = useState<WebSocket>();
  const [countDown, setCountDown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const roomId = !isPublic && !isCreator ? useParams().roomId : '';
  const navigate = useNavigate();
  const serverUrl = process.env.NODE_ENV === 'development' ? 'localhost:3000' : window.location.host;

  const createSocket = async (name: string) => {
    const url = process.env.NODE_ENV === 'development' ? 'localhost:8080' : window.location.host;
    const ws = new WebSocket(`ws://${url}/api/connect/${name}`);

    ws.onopen = () => {
      setWebsocket(ws);

      // receive messages
      ws.onmessage = (res) => {
        const response: Message = JSON.parse(res.data);
        if (response.type === 'raceData') {
          const updateResponse = response as RaceDataMessage;
          setRaceInfo(updateResponse.raceInfo);
          console.log(updateResponse);
        } else if (response.type === 'error') {
          const errorResponse = response as ErrorMessage;
          setErrorMessage(errorResponse.message);
          setIsError(true);
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
    const user = useUser();
    const name = user?.username ?? uuid();
    createSocket(name);
  }, []);

  useEffect(() => {
    if (raceInfo.isPublic) {
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
  };

  return (
    <div>
      <Modal
        opened={isError}
        onClose={() => handleError()}
        title={errorMessage}
      >
        Closing this will navigate you back to the home screen
      </Modal>
      {!isError
      && raceInfo.hasStarted
        ? <TypingZone websocket={websocket} raceInfo={raceInfo} />
        : (
          <div>
            {isPublic ? (`Race Starting in: ${countDown}`) : (`http://${serverUrl}/room/private/${raceInfo.roomId}`)}
            <List>
              {raceInfo.users.map((user) => <ListItem key={user}>{user}</ListItem>)}
            </List>
            {!raceInfo.isPublic && raceInfo.owner === useUser().username && <Button color="cyan" onClick={startRace}>Race your friends</Button>}
          </div>
        )}
    </div>
  );
};

export default WaitingRoom;
