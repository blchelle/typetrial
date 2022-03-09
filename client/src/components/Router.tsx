import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import TypingZone from '@components/TypingZone';
import Chat from '@components/Chat';
import ResetPassword from '@components/ResetPassword';

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TypingZone />} />
      <Route path="/hello" element={<Chat />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
