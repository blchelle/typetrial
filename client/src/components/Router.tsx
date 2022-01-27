import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import TypingZone from '@components/TypingZone';
import Chat from '@components/Chat';
import ButtonsShowcase from './ButtonsShowcase';
import TextInputShowcase from './TextInputShowcase';

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TypingZone />} />
      <Route path="/hello" element={<Chat />} />
      <Route path="/components/buttons" element={<ButtonsShowcase />} />
      <Route path="/components/input" element={<TextInputShowcase />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
