import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { List, ListItem } from '@mantine/core';
import useUser from '@hooks/useUser';

interface Response {
    type: string;
    msg: string;
}

const NEW_USER = 'new_user';
const USERS = 'users';
const REMOVE_USER = 'remove_user';

const WaitingRoom: React.FC = () => {
  const [userList, setUserList] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [websocket, setWebsocket] = useState<WebSocket>();
  const [lastMessage, setLastMessage] = useState<Response>({ type: '', msg: '' });

  const processMessage = (resp: Response) => {
    if (resp.type === NEW_USER) {
      const users = [...userList, resp.msg];
      setUserList(users);
    } else if (resp.type === USERS) {
      const users = JSON.parse(resp.msg);
      setUserList([username, ...users]);
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
    <List>
      {userList.map((user) => <ListItem key={user}>{user}</ListItem>)}
    </List>
  );
};

export default WaitingRoom;