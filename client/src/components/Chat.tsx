import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';

interface Message {
    sender: string;
    msg: string;
}

const Chat: React.FC = () => {
  const [username, setUsername] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [websocket, setWebsocket] = useState<WebSocket>();
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [lastMessage, setLastMessage] = useState<Message>({ sender: '', msg: '' });

  const createSocket = async (name: string) => {
    const url = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : window.location.host;
    const ws = new WebSocket(`ws://${url}/api/connect/${name}`);

    ws.onopen = () => {
      setWebsocket(ws);

      // receive messages
      ws.onmessage = (res) => {
        const response = JSON.parse(res.data);
        const message = { sender: response.sender, msg: response.data };
        setLastMessage(message);
      };
    };

    setWebsocket(ws);
  };
  useEffect(() => {
    const name = uuid();
    createSocket(name);
    setUsername(name);
  }, []);

  useEffect(() => {
    if (lastMessage.msg !== '') {
      const history = [...chatHistory, lastMessage];
      setChatHistory(history);
    }
  }, [lastMessage]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setCurrentText(value);
  };

  const sendMsg = () => {
    const data = currentText;
    websocket?.send(data);
    const message = { sender: username, msg: data };
    setLastMessage(message);
    setCurrentText('');
  };

  return (
    <div className="flex flex-col w-11/12 md:w-[40rem]">
      <div className="chat-window">
        <div className="box">
          <div className="inner">
            {chatHistory.map((msg) => (
              <p className="message">
                {`${msg.sender}: ${msg.msg}`}
              </p>
            ))}
          </div>
        </div>
      </div>
      <input
        className="form-control"
        placeholder="Type & hit enter"
        onChange={handleInputChange}
        value={currentText}
      />
      <button className="bg-primary text-white p-4 rounded-lg mt-10" onClick={sendMsg}>
        Send
      </button>
    </div>
  );
};

export default Chat;
