import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import TypingZone from '@components/TypingZone';

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TypingZone />} />
      <Route path="/hello" element={<div>Hello</div>} />
    </Routes>
  </BrowserRouter>
);

export default Router;
