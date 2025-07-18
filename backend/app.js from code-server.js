import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active Y.js documents
const docs = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle Y.js document synchronization
  socket.on('join-document', ({ documentId, userId, userName }) => {
    console.log(`User ${userName} (${userId}) joined document ${documentId}`);
    
    // Join the document room
    socket.join(documentId);
    
    // Store user info on socket
    socket.userId = userId;
    socket.userName = userName;
    socket.documentId = documentId;
    
    // Broadcast user joined to others in the room
    socket.to(documentId).emit('user-joined', {
      userId,
      userName,
      socketId: socket.id
    });
    
    // Send existing users to the new user
    const socketsInRoom = Array.from(io.sockets.adapter.rooms.get(documentId) || []);
    const existingUsers = socketsInRoom
      .map(socketId => io.sockets.sockets.get(socketId))
      .filter(s => s && s.userId && s.userId !== userId)
      .map(s => ({
        userId: s.userId,
        userName: s.userName,
        socketId: s.id
      }));
    
    socket.emit('existing-users', existingUsers);
  });

  // Handle Y.js document updates
  socket.on('document-update', ({ documentId, update }) => {
    // Broadcast update to all other users in the document room
    socket.to(documentId).emit('document-update', {
      update,
      userId: socket.userId
    });
  });

  // Handle cursor/awareness updates
  socket.on('awareness-update', ({ documentId, awareness }) => {
    socket.to(documentId).emit('awareness-update', {
      awareness,
      userId: socket.userId,
      userName: socket.userName
    });
  });

  // Handle comments
  socket.on('comment-added', ({ documentId, comment }) => {
    socket.to(documentId).emit('comment-added', comment);
  });

  socket.on('comment-updated', ({ documentId, comment }) => {
    socket.to(documentId).emit('comment-updated', comment);
  });

  socket.on('comment-deleted', ({ documentId, commentId }) => {
    socket.to(documentId).emit('comment-deleted', { commentId });
  });

  // Handle highlights
  socket.on('highlight-added', ({ documentId, highlight }) => {
    socket.to(documentId).emit('highlight-added', highlight);
  });

  socket.on('highlight-removed', ({ documentId, highlightId }) => {
    socket.to(documentId).emit('highlight-removed', { highlightId });
  });

  // Handle suggestions
  socket.on('suggestion-added', ({ documentId, suggestion }) => {
    socket.to(documentId).emit('suggestion-added', suggestion);
  });

  socket.on('suggestion-resolved', ({ documentId, suggestionId, action }) => {
    socket.to(documentId).emit('suggestion-resolved', { suggestionId, action });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.documentId) {
      socket.to(socket.documentId).emit('user-left', {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };