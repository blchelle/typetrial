import React, { useState } from 'react';

import Router from '@components/Router';
import axios from '@config/axios';
import Navigation from '@components/Navigation';

const App: React.FC = () => {
  const [randomServerNumber, setRandomServerNumber] = useState(null);

  const sendRequest = async () => {
    const res = await axios.get('/api/random');
    setRandomServerNumber(res.data);
  };

  return (
    <div className="h-screen">
      <Navigation />
      <div className="w-screen h-full pt-14 flex justify-center items-center bg-gray-100 flex-col">
        <Router />
        <button className="bg-primary text-white p-4 rounded-lg mt-10" onClick={sendRequest}>
          Click Me to Ping the API
        </button>
        {randomServerNumber && (
        <div>{randomServerNumber}</div>
        )}
      </div>
    </div>
  );
};

export default App;
