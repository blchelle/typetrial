import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import WaitingRoom from '@components/WaitingRoom';
import Home from '@components/Home';
import ResetPassword from '@components/ResetPassword';

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room" element={<WaitingRoom />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
