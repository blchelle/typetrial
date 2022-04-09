import React from 'react';
import {
  Button, Group, Header, Text, Badge,
} from '@mantine/core';
import { Link } from 'react-router-dom';

import { useModals } from '@mantine/modals';
import { AuthModals, AuthType } from '@components/AuthForm';
import { IoStatsChart } from 'react-icons/io5';
import axios from 'axios';
import useUser from '@hooks/useUser';
import typeTrialLogo from '../assets/typeTrialLogoSmall.png';

// Important for whole game, links to all rooms,
// especially relevant to login, signup, and displaying user data: FR1, FR2

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

  const user = useUser();

  return (
    <Header height={50}>
      <Group position="apart" spacing="xs">
        <Link to="/"><img src={typeTrialLogo} alt="Type Trial Logo" height={40} /></Link>
        { user.id ? (
          <Group spacing="sm">
            <Group spacing={8}>
              <Group direction="column" spacing={0} align="center">
                <Text size="sm" weight="bold">{user.username}</Text>
                <Group spacing={2}>
                  <Badge size="xs">
                    WPM:
                    { user.Results?.wpm ?? 0 }
                  </Badge>
                  <Badge size="xs">
                    Races:
                    { user.Results?.count ?? 0 }
                  </Badge>
                </Group>
              </Group>
              <Link to="/profile"><Button size="md" color="blue" variant="light"><IoStatsChart /></Button></Link>
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
