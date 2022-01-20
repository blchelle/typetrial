import React, { useState } from 'react';

import Router from '@components/Router';
import axios from '@config/axios';

const App: React.FC = () => {
  const [randomServerNumber, setRandomServerNumber] = useState(null);

  // message and timestamp
  const [data, setData] = useState();
  // send function
  const [websocket, setWebsocket] = useState<WebSocket>();

  const [connected, setConnected] = useState(false);

  const sendRequest = async () => {
    const res = await axios.get('/api/random');
    setRandomServerNumber(res.data);
  };

  const createSocket = async () => {
    const ws = new WebSocket('ws://localhost:8080/api/random');

    ws.onopen = () => {
      setConnected(true);

      // receive messages
      ws.onmessage = (res) => {
        setData(res.data);
      };
    };

    setWebsocket(ws);
  };

  const closeSocekt = () => {
    websocket?.close();
    setConnected(false);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100 flex-col">
      <Router />
      <button className="bg-primary text-white p-4 rounded-lg mt-10" onClick={sendRequest}>
        Click Me to Ping the API
      </button>
      {randomServerNumber && (
      <div>
        The API responded with
        {' '}
        {randomServerNumber}
      </div>
      )}
      {!connected
        && (
        <button className="bg-primary text-white p-4 rounded-lg mt-10" onClick={createSocket}>
          Click Me to open websocket
        </button>
        )}
      {connected
        && (
        <button className="bg-primary text-white p-4 rounded-lg mt-10" onClick={closeSocekt}>
          Click Me to close websocket
        </button>
        )}
      {connected && data && (
      <div>
        Websocket sent
        {' '}
        {data}
      </div>
      )}

    </div>
  );
};

export default App;
