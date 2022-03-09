import React from 'react';
import {
  Button, Group, Header, Title, Text, Badge,
} from '@mantine/core';

import { useModals } from '@mantine/modals';
import { AuthModals, AuthType } from '@components/AuthForm';
import { IoSettings, IoStatsChart } from 'react-icons/io5';
import axios from 'axios';

const Navigation: React.FC = () => {
  const modals = useModals();

  const openAuthModal = (type: AuthType) => {
    modals.openModal(AuthModals[type]);
  };

  const logoutUser = async () => {
    try {
      await axios.get('/users/logout');
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (err) {
      // TODO
    }
  };

  const lsUser = localStorage.getItem('user');
  const user = lsUser ? JSON.parse(lsUser) : null;

  return (
    <Header height={50}>
      <Group position="apart" spacing="xs">
        <Title order={2}>TypeTrial</Title>
        { user ? (
          <Group spacing="sm">
            <Group spacing={8}>
              <Group direction="column" spacing={0} align="center">
                <Text size="sm" weight="bold">{user.username}</Text>
                <Group spacing={2}>
                  <Badge size="xs">WPM: 0</Badge>
                  <Badge size="xs">Races: 0</Badge>
                </Group>
              </Group>
              <Button size="md" color="blue" variant="light"><IoStatsChart /></Button>
              <Button size="md" color="gray" variant="light"><IoSettings /></Button>
            </Group>
            <Button color="gray" variant="light" size="md" onClick={logoutUser}>Logout</Button>
          </Group>
        ) : (
          <Group>
            <Button size="md" variant="light" onClick={() => openAuthModal('login')}>Login</Button>
            <Button size="md" onClick={() => openAuthModal('signup')}>Sign Up</Button>
          </Group>
        )}
      </Group>
    </Header>
  );
};

export default Navigation;
