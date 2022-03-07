import React from 'react';
import {
  Button, Group, Header, Title,
} from '@mantine/core';

import { useModals } from '@mantine/modals';
import { AuthModals, AuthType } from '@components/AuthForm';

const Navigation: React.FC = () => {
  const modals = useModals();

  const openAuthModal = (type: AuthType) => {
    modals.openModal(AuthModals[type]);
  };

  return (
    <Header height={50}>
      <Group position="apart" spacing="xs">
        <Title order={2}>TypeTrial</Title>
        <Group>
          <Button size="md" variant="light" onClick={() => openAuthModal('login')}>Login</Button>
          <Button size="md" onClick={() => openAuthModal('signup')}>Sign Up</Button>
        </Group>
      </Group>
    </Header>
  );
};

export default Navigation;
