import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createSuggestion,
  getSuggestions,
  updateSuggestion,
  deleteSuggestion,
  resolveSuggestion
} from '../controllers/suggestionController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Suggestion routes
router.post('/', createSuggestion);
router.get('/:documentId', getSuggestions);
router.put('/:suggestionId', updateSuggestion);
router.delete('/:suggestionId', deleteSuggestion);
router.patch('/:suggestionId/resolve', resolveSuggestion);

export default router;