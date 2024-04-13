import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import queryString from 'query-string';
import io from 'socket.io-client';
import './Chat.css';
import InfoBar from './InfoBar';
import Input from './Input';
import Messages from './Messages';

let socket;

const Chat = () => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const ENDPOINT = 'https://real-time-chat-application-c47d032322e7.herokuapp.com/'; // Your backend endpoint

  const location = useLocation();

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    if (name && room) {
      socket = io(ENDPOINT);
      setName(name);
      setRoom(room); 

      socket.emit('join', { name, room }, () => {});
    }

    return () => {
      if (socket) {
        socket.emit('disconnect');
        socket.off();
      }
    };
  }, [ENDPOINT,location.search]);

  useEffect(() => {
    if (socket) {
      socket.on('message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    if (socket && message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
  };

  console.log(message, messages);

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default Chat;
    