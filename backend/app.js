import express from 'express';
import cors from 'cors';
import documentRoutes from './routes/documentRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import highlightRoutes from './routes/highlightRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/docs', documentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/suggestions', suggestionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;