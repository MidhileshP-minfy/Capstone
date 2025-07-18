import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import * as Y from 'yjs';

export const useCollaboration = (documentId, userId, userName) => {
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [yDoc, setYDoc] = useState(null);
  const [awareness, setAwareness] = useState(null);
  const connectionRef = useRef(false);

  useEffect(() => {
    if (!documentId || !userId || connectionRef.current) return;

    // Create Y.js document
    const doc = new Y.Doc();
    setYDoc(doc);

    // Create awareness instance for cursors
    const awarenessInstance = new Y.UndoManager(doc.getMap('awareness'));
    setAwareness(awarenessInstance);

    // Connect to Socket.io server
    const socketConnection = io('http://localhost:8001', {
      transports: ['websocket'],
      forceNew: true
    });

    socketConnection.on('connect', () => {
      console.log('Connected to collaboration server');
      socketConnection.emit('join-document', {
        documentId,
        userId,
        userName
      });
    });

    socketConnection.on('user-joined', (user) => {
      console.log('User joined:', user);
      setConnectedUsers(prev => [...prev, user]);
    });

    socketConnection.on('user-left', (user) => {
      console.log('User left:', user);
      setConnectedUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    socketConnection.on('existing-users', (users) => {
      console.log('Existing users:', users);
      setConnectedUsers(users);
    });

    socketConnection.on('document-update', ({ update, userId: senderUserId }) => {
      if (senderUserId !== userId) {
        Y.applyUpdate(doc, new Uint8Array(update));
      }
    });

    socketConnection.on('awareness-update', ({ awareness: awarenessUpdate, userId: senderUserId }) => {
      if (senderUserId !== userId) {
        // Handle cursor updates
        console.log('Awareness update from:', senderUserId, awarenessUpdate);
      }
    });

    // Handle Y.js document updates
    const handleUpdate = (update) => {
      socketConnection.emit('document-update', {
        documentId,
        update: Array.from(update)
      });
    };

    doc.on('update', handleUpdate);

    setSocket(socketConnection);
    connectionRef.current = true;

    return () => {
      doc.off('update', handleUpdate);
      socketConnection.disconnect();
      doc.destroy();
      connectionRef.current = false;
      setSocket(null);
      setConnectedUsers([]);
    };
  }, [documentId, userId, userName]);

  const sendAwarenessUpdate = (awarenessData) => {
    if (socket && socket.connected) {
      socket.emit('awareness-update', {
        documentId,
        awareness: awarenessData
      });
    }
  };

  return {
    socket,
    connectedUsers,
    yDoc,
    awareness,
    sendAwarenessUpdate
  };
};