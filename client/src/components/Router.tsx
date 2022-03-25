import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Group } from '@mantine/core';

import Navigation from '@components/Navigation';
import WaitingRoom from '@components/WaitingRoom';
import Home from '@components/Home';
import Profile from '@components/Profile';
import ResetPassword from '@components/ResetPassword';
import RaceInfo from './RaceInfo';

const Router: React.FC = () => (
  <BrowserRouter>
    <Navigation />
    <Group direction="column" align="center" mt={16}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<WaitingRoom isPublic isCreator={false} />} />
        <Route path="/room/private" element={<WaitingRoom isPublic={false} isCreator />} />
        <Route path="/room/private/:roomId" element={<WaitingRoom isPublic={false} isCreator={false} />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/race/:raceId" element={<RaceInfo />} />
      </Routes>
    </Group>
  </BrowserRouter>
);

export default Router;
