import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { List, ListItem } from '@mantine/core';
import useUser from '@hooks/useUser';

interface Response {
    type: string;
    msg: string;
}

interface RoomConnection {
  users: string[];
  start: Date;
}

const NEW_USER = 'new_user';
const USERS = 'users';
const REMOVE_USER = 'remove_user';
const MINCON = 60000;

const WaitingRoom: React.FC = () => {
  const [userList, setUserList] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [websocket, setWebsocket] = useState<WebSocket>();
  const [lastMessage, setLastMessage] = useState<Response>({ type: '', msg: '' });
  const [countDown, setCountDown] = useState(0);

  const processMessage = (resp: Response) => {
    if (resp.type === NEW_USER) {
      const users = [...userList, resp.msg];
      setUserList(users);
    } else if (resp.type === USERS) {
      const roomConnection: RoomConnection = JSON.parse(resp.msg);
      setUserList([username, ...roomConnection.users]);

      const start = new Date(roomConnection.start);

      const intervalId = setInterval(() => {
        const now = new Date();
        const rem = Math.round((start.getTime() - (new Date(now.getTime()
        + (now.getTimezoneOffset() * MINCON)).getTime())) / 1000);
        if (rem < 0) clearInterval(intervalId);
        else {
          setCountDown(rem);
        }
      }, 1000);
    } else if (resp.type === REMOVE_USER) {
      const users = JSON.parse(resp.msg);
      const index = users.indexOf(username);
      users.splice(index, 1);
      setUserList([username, ...users]);
    }
  };

  const createSocket = async (name: string) => {
    const url = process.env.NODE_ENV === 'development' ? 'localhost:8080' : window.location.host;
    const ws = new WebSocket(`ws://${url}/api/connect/${name}`);

    ws.onopen = () => {
      setWebsocket(ws);

      // receive messages
      ws.onmessage = (res) => {
        const response: Response = JSON.parse(res.data);
        setLastMessage(response);
      };
    };

    setWebsocket(ws);
  };

  useEffect(() => {
    const user = useUser();
    const name = user?.username ?? uuid();

    createSocket(name);
    setUsername(name);
    setUserList([name]);
  }, []);

  useEffect(() => {
    if (lastMessage.msg !== '') {
      processMessage(lastMessage);
    }
  }, [lastMessage]);

  return (
    <div>
      {countDown}
      <List>
        {userList.map((user) => <ListItem key={user}>{user}</ListItem>)}
      </List>
    </div>
  );
};

export default WaitingRoom;
