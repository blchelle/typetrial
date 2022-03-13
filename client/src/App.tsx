import React from 'react';

import Router from '@components/Router';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';

const App: React.FC = () => (
  <NotificationsProvider>
    <ModalsProvider>
      <Router />
    </ModalsProvider>
  </NotificationsProvider>
);

export default App;
