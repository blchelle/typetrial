import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { List, ListItem, Button } from '@mantine/core';
import useUser from '@hooks/useUser';
import { MILLISECONDS_PER_MINUTE } from '@utils/constants';
import {
  Message, RaceDataMessage, RaceData, StartMessage,
} from '../utils/types';
import TypingZone from './TypingZone';

const WaitingRoom: React.FC = () => {
  const [raceInfo, setRaceInfo] = useState<RaceData>({
    roomId: '',
    hasStarted: false,
    isPublic: false,
    start: new Date(),
    passage: '',
    users: [],
    userInfo: {},
  });

  const [websocket, setWebsocket] = useState<WebSocket>();
  const [countDown, setCountDown] = useState(0);

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
        }
      };

      const connectMessage = JSON.stringify({
        type: 'connect_public',
        public: true,
      });
      ws.send(connectMessage);
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

  return (
    <div>
      {raceInfo.hasStarted
        ? <TypingZone websocket={websocket} raceInfo={raceInfo} />
        : (
          <div>
            {`Race Starting in: ${countDown}`}
            <List>
              {raceInfo.users.map((user) => <ListItem key={user}>{user}</ListItem>)}
            </List>
            {!raceInfo.isPublic && <Button color="cyan" onClick={startRace}>Race your friends</Button>}
          </div>
        )}

    </div>
  );
};

export default WaitingRoom;
