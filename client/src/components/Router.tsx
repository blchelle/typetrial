import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import TypingZone from '@components/TypingZone';
import Chat from '@components/Chat';

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TypingZone />} />
      <Route path="/hello" element={<Chat />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
