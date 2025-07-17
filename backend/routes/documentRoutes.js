import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument
} from '../controllers/documentController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Document routes
router.get('/', getAllDocuments);
router.get('/:id', getDocument);
router.post('/', createDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;