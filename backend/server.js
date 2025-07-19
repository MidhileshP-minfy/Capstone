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

// In-memory storage per document
const documentComments = {};
const documentSuggestions = {};
const documentHighlights = {};

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

  socket.on('resolve-comment', ({ docId, commentId }) => {
    if (documentComments[docId]) {
      const comment = documentComments[docId].find(c => c.id === commentId);
      if (comment) {
        comment.resolved = true;
        io.to(docId).emit('comment-resolved', { commentId, comment });
      }
    }
  });

  // Handle suggestions
  socket.on('add-suggestion', ({ docId, suggestion }) => {
    if (!documentSuggestions[docId]) documentSuggestions[docId] = [];
    documentSuggestions[docId].push(suggestion);
    io.to(docId).emit('new-suggestion', suggestion);
  });

  socket.on('accept-suggestion', ({ docId, suggestionId }) => {
    if (documentSuggestions[docId]) {
      const suggestion = documentSuggestions[docId].find(s => s.id === suggestionId);
      if (suggestion) {
        suggestion.status = 'accepted';
        io.to(docId).emit('suggestion-accepted', { suggestionId, suggestion });
      }
    }
  });

  socket.on('reject-suggestion', ({ docId, suggestionId }) => {
    if (documentSuggestions[docId]) {
      const suggestion = documentSuggestions[docId].find(s => s.id === suggestionId);
      if (suggestion) {
        suggestion.status = 'rejected';
        io.to(docId).emit('suggestion-rejected', { suggestionId, suggestion });
      }
    }
  });

  // Handle highlights
  socket.on('add-highlight', ({ docId, highlight }) => {
    if (!documentHighlights[docId]) documentHighlights[docId] = [];
    documentHighlights[docId].push(highlight);
    io.to(docId).emit('new-highlight', highlight);
  });

  // Send existing data to users when they join
  socket.on('get-comments', (docId, callback) => {
    callback(documentComments[docId] || []);
  });

  socket.on('get-suggestions', (docId, callback) => {
    callback(documentSuggestions[docId] || []);
  });

  socket.on('get-highlights', (docId, callback) => {
    callback(documentHighlights[docId] || []);
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