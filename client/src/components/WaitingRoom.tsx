import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { List, ListItem } from '@mantine/core';

interface Response {
    type: string;
    msg: string;
}

const NEWUSER = 'new_user';
const USERS = 'users';
const REMUSER = 'remove_user';

const WaitingRoom: React.FC = () => {
  const [userList, setUserList] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [websocket, setWebsocket] = useState<WebSocket>();
  const [lastMessage, setLastMessage] = useState<Response>({ type: '', msg: '' });

  const proccessMessage = (resp: Response) => {
    if (resp.type === NEWUSER) {
      const users = [...userList, resp.msg];
      setUserList(users);
    } else if (resp.type === USERS) {
      const users = JSON.parse(resp.msg);
      setUserList([username, ...users]);
    } else if (resp.type === REMUSER) {
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
    const lsUser = localStorage.getItem('user');
    const user = lsUser ? JSON.parse(lsUser) : null;
    const name = user?.username ?? uuid();

    createSocket(name);
    setUsername(name);
    setUserList([name]);
  }, []);

  useEffect(() => {
    if (lastMessage.msg !== '') {
      proccessMessage(lastMessage);
    }
  }, [lastMessage]);

  return (
    <List>
      {userList.map((user) => <ListItem key={user}>{user}</ListItem>)}
    </List>
  );
};

export default WaitingRoom;
