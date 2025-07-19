import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (serverUrl = 'http://localhost:5000') => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [serverUrl]);

  return socketRef.current;
};