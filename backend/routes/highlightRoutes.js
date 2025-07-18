import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createHighlight,
  getHighlights,
  updateHighlight,
  deleteHighlight
} from '../controllers/highlightController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Highlight routes
router.post('/', createHighlight);
router.get('/:documentId', getHighlights);
router.put('/:highlightId', updateHighlight);
router.delete('/:highlightId', deleteHighlight);

export default router;