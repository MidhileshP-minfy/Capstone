import app from './app.js';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // Adjust as needed for production
    methods: ['GET', 'POST']
  }
});

// Track users in rooms
const documentUsers = {};

// In-memory comment storage per document
const documentComments = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-document', (docId) => {
    socket.join(docId);
    socket.docId = docId;
    if (!documentUsers[docId]) documentUsers[docId] = {};
  });

  socket.on('user-join', ({ docId, user }) => {
    if (!documentUsers[docId]) documentUsers[docId] = {};
    documentUsers[docId][socket.id] = { ...user, cursor: null };
    io.to(docId).emit('presence-update', Object.values(documentUsers[docId]));
  });

  socket.on('cursor-move', ({ docId, cursor }) => {
    if (documentUsers[docId] && documentUsers[docId][socket.id]) {
      documentUsers[docId][socket.id].cursor = cursor;
      io.to(docId).emit('presence-update', Object.values(documentUsers[docId]));
    }
  });

  socket.on('send-changes', ({ docId, changes }) => {
    socket.to(docId).emit('receive-changes', changes);
  });

  // Handle adding a comment
  socket.on('add-comment', ({ docId, comment }) => {
    if (!documentComments[docId]) documentComments[docId] = [];
    documentComments[docId].push(comment);
    io.to(docId).emit('new-comment', comment);
  });

  // Optionally, send all comments to a user when they join
  socket.on('get-comments', (docId, callback) => {
    callback(documentComments[docId] || []);
  });

  socket.on('disconnect', () => {
    const docId = socket.docId;
    if (docId && documentUsers[docId]) {
      delete documentUsers[docId][socket.id];
      io.to(docId).emit('presence-update', Object.values(documentUsers[docId]));
    }
    console.log('A user disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});