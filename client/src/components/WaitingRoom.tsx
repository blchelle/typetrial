import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { List, ListItem, Button } from '@mantine/core';
import useUser from '@hooks/useUser';
// import { MILLISECONDS_PER_MINUTE } from '@utils/constants';
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
  });
  // const [username, setUsername] = useState('');
  const [websocket, setWebsocket] = useState<WebSocket>();
  // const [countDown, setCountDown] = useState(0);

  // const processMessage = (resp: Response) => {
  // if (resp.type === NEW_USER) {
  //   const users = [...userList, resp.msg];
  //   setUserList(users);
  // } else if (resp.type === USERS) {
  //   const roomConnection: RoomConnection = JSON.parse(resp.msg);
  //   setUserList([username, ...roomConnection.users]);

  //   const start = new Date(roomConnection.start);

  //   const intervalId = setInterval(() => {
  //     const now = new Date();
  //     const rem = Math.round((start.getTime() - (new Date(now.getTime()
  //     + (now.getTimezoneOffset() * MINCON)).getTime())) / 1000);
  //     if (rem < 0) clearInterval(intervalId);
  //     else {
  //       setCountDown(rem);
  //     }
  //   }, 1000);
  // } else if (resp.type === REMOVE_USER) {
  //   const users = JSON.parse(resp.msg);
  //   const index = users.indexOf(username);
  //   users.splice(index, 1);
  //   setUserList([username, ...users]);
  // }
  // };

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
    // setUsername(name);
  }, []);

  const startRace = () => {
    const startMessage: StartMessage = {
      type: 'start',
    };
    websocket?.send(JSON.stringify(startMessage));
  };

  return (
    <div>
      {/* {countDown} */}
      {raceInfo.hasStarted
        ? <TypingZone />
        : (
          <>
            <List>
              {raceInfo.users.map((user) => <ListItem key={user}>{user}</ListItem>)}
            </List>
            <Button color="cyan" onClick={startRace}>Race your friends</Button>
          </>
        )}

    </div>
  );
};

export default WaitingRoom;
