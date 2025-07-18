import { db } from '../config/firebase.js';

// Create a new highlight
export const createHighlight = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { documentId, selection, color, tags, note } = req.body;
    
    // Verify user has access to the document
    const docRef = db.collection('docs').doc(documentId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const docData = doc.data();
    if (!docData.roles?.[userId]) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const highlightData = {
      documentId,
      selection,
      color: color || '#D8C9AE', // Default to our theme color
      tags: tags || [],
      note: note || '',
      authorId: userId,
      authorName: req.user.name || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const highlightRef = await db.collection('highlights').add(highlightData);
    
    const newHighlight = {
      id: highlightRef.id,
      ...highlightData
    };
    
    res.status(201).json(newHighlight);
  } catch (error) {
    console.error('Error creating highlight:', error);
    res.status(500).json({ error: 'Failed to create highlight' });
  }
};

// Get all highlights for a document
export const getHighlights = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { documentId } = req.params;
    
    // Verify user has access to the document
    const docRef = db.collection('docs').doc(documentId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const docData = doc.data();
    if (!docData.roles?.[userId]) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const highlightsRef = db.collection('highlights');
    const snapshot = await highlightsRef
      .where('documentId', '==', documentId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const highlights = [];
    snapshot.forEach((doc) => {
      highlights.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });
    
    res.json(highlights);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    res.status(500).json({ error: 'Failed to fetch highlights' });
  }
};

// Update a highlight
export const updateHighlight = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { highlightId } = req.params;
    const { color, tags, note } = req.body;
    
    const highlightRef = db.collection('highlights').doc(highlightId);
    const highlight = await highlightRef.get();
    
    if (!highlight.exists) {
      return res.status(404).json({ error: 'Highlight not found' });
    }
    
    const highlightData = highlight.data();
    
    // Check if user is the author or has admin access to the document
    if (highlightData.authorId !== userId) {
      const docRef = db.collection('docs').doc(highlightData.documentId);
      const doc = await docRef.get();
      const docData = doc.data();
      
      if (docData.roles?.[userId] !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const updateData = {
      updatedAt: new Date(),
    };
    
    if (color !== undefined) updateData.color = color;
    if (tags !== undefined) updateData.tags = tags;
    if (note !== undefined) updateData.note = note;
    
    await highlightRef.update(updateData);
    
    res.json({ message: 'Highlight updated successfully' });
  } catch (error) {
    console.error('Error updating highlight:', error);
    res.status(500).json({ error: 'Failed to update highlight' });
  }
};

// Delete a highlight
export const deleteHighlight = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { highlightId } = req.params;
    
    const highlightRef = db.collection('highlights').doc(highlightId);
    const highlight = await highlightRef.get();
    
    if (!highlight.exists) {
      return res.status(404).json({ error: 'Highlight not found' });
    }
    
    const highlightData = highlight.data();
    
    // Check if user is the author or has admin access to the document
    if (highlightData.authorId !== userId) {
      const docRef = db.collection('docs').doc(highlightData.documentId);
      const doc = await docRef.get();
      const docData = doc.data();
      
      if (docData.roles?.[userId] !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    await highlightRef.delete();
    
    res.json({ message: 'Highlight deleted successfully' });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    res.status(500).json({ error: 'Failed to delete highlight' });
  }
};