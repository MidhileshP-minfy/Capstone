import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo
let documents = {
  '1': {
    id: '1',
    title: 'Welcome to CollabDocs',
    content: [
      {
        type: 'paragraph',
        content: 'Welcome to the future of collaborative writing! This is a demo document to showcase our real-time collaboration features.'
      },
      {
        type: 'paragraph',
        content: 'Try opening this document in multiple tabs or share it with colleagues to see real-time collaboration in action.'
      }
    ],
    roles: {},
    members: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

let comments = {};
let highlights = {};
let suggestions = {};

// Document routes
app.get('/api/docs', (req, res) => {
  const docList = Object.values(documents).map(doc => ({
    id: doc.id,
    title: doc.title,
    updatedAt: doc.updatedAt,
    roles: { 'demo-user': 'admin' }
  }));
  res.json(docList);
});

app.get('/api/docs/:id', (req, res) => {
  const doc = documents[req.params.id];
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json({
    ...doc,
    roles: { 'demo-user': 'admin' }
  });
});

app.post('/api/docs', (req, res) => {
  const id = Date.now().toString();
  const newDoc = {
    id,
    title: req.body.title || 'Untitled Document',
    content: req.body.content || [],
    roles: { 'demo-user': 'admin' },
    members: ['demo-user'],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  documents[id] = newDoc;
  res.status(201).json(newDoc);
});

app.put('/api/docs/:id', (req, res) => {
  const doc = documents[req.params.id];
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  if (req.body.title !== undefined) doc.title = req.body.title;
  if (req.body.content !== undefined) doc.content = req.body.content;
  doc.updatedAt = new Date();
  
  res.json({ message: 'Document updated successfully' });
});

app.delete('/api/docs/:id', (req, res) => {
  if (documents[req.params.id]) {
    delete documents[req.params.id];
    res.json({ message: 'Document deleted successfully' });
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

// Comment routes
app.get('/api/comments/:documentId', (req, res) => {
  const docComments = comments[req.params.documentId] || [];
  res.json(docComments);
});

app.post('/api/comments', (req, res) => {
  const { documentId, content, position, selection } = req.body;
  const comment = {
    id: Date.now().toString(),
    documentId,
    content,
    position,
    selection,
    authorId: 'demo-user',
    authorName: 'Demo User',
    createdAt: new Date(),
    resolved: false,
    replies: []
  };
  
  if (!comments[documentId]) comments[documentId] = [];
  comments[documentId].push(comment);
  
  res.status(201).json(comment);
});

// Highlight routes
app.get('/api/highlights/:documentId', (req, res) => {
  const docHighlights = highlights[req.params.documentId] || [];
  res.json(docHighlights);
});

app.post('/api/highlights', (req, res) => {
  const { documentId, selection, color, tags, note } = req.body;
  const highlight = {
    id: Date.now().toString(),
    documentId,
    selection,
    color: color || '#D8C9AE',
    tags: tags || [],
    note: note || '',
    authorId: 'demo-user',
    authorName: 'Demo User',
    createdAt: new Date()
  };
  
  if (!highlights[documentId]) highlights[documentId] = [];
  highlights[documentId].push(highlight);
  
  res.status(201).json(highlight);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-document', ({ documentId, userId, userName }) => {
    console.log(`User ${userName} (${userId}) joined document ${documentId}`);
    
    socket.join(documentId);
    socket.userId = userId;
    socket.userName = userName;
    socket.documentId = documentId;
    
    socket.to(documentId).emit('user-joined', {
      userId,
      userName,
      socketId: socket.id
    });
    
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

  socket.on('document-update', ({ documentId, update }) => {
    socket.to(documentId).emit('document-update', {
      update,
      userId: socket.userId
    });
  });

  socket.on('awareness-update', ({ documentId, awareness }) => {
    socket.to(documentId).emit('awareness-update', {
      awareness,
      userId: socket.userId,
      userName: socket.userName
    });
  });

  socket.on('comment-added', ({ documentId, comment }) => {
    socket.to(documentId).emit('comment-added', comment);
  });

  socket.on('highlight-added', ({ documentId, highlight }) => {
    socket.to(documentId).emit('highlight-added', highlight);
  });

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };