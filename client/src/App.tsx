import React, { useState } from 'react';

import Router from '@components/Router';
import axios from '@config/axios';
import Navigation from '@components/Navigation';
import { ModalsProvider } from '@mantine/modals';
import { Button, Group } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';

const App: React.FC = () => {
  const [randomServerNumber, setRandomServerNumber] = useState(null);

  const sendRequest = async () => {
    const res = await axios.get('/random');
    setRandomServerNumber(res.data);
  };

  return (
    <NotificationsProvider>
      <ModalsProvider>
        <Navigation />
        <Group direction="column" align="center" mt={16}>
          <Router />
          <Button mt={16} onClick={sendRequest}>
            Click Me to Ping the API
          </Button>
          {randomServerNumber && (
            <div>{randomServerNumber}</div>
          )}
        </Group>
      </ModalsProvider>
    </NotificationsProvider>
  );
};

export default App;
