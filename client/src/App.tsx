import React, { useEffect, useState } from 'react';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';

import Router from '@components/Router';
import axios from '@config/axios';
import useUser from '@hooks/useUser';
import { LoadingOverlay } from '@mantine/core';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/users/me');
      const { data: user } = res.data;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      // Clear the user only if they're supposedly authenticated
      const user = useUser();
      if (user.id) localStorage.removeItem('user');
    }

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchUser();
    })();
  }, []);

  return (
    <NotificationsProvider>
      <ModalsProvider>
        { loading ? <LoadingOverlay visible /> : <Router /> }

      </ModalsProvider>
    </NotificationsProvider>
  );
};

export default App;
