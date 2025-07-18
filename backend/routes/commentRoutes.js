import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  resolveComment
} from '../controllers/commentController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Comment routes
router.post('/', createComment);
router.get('/:documentId', getComments);
router.put('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);
router.patch('/:commentId/resolve', resolveComment);

export default router;