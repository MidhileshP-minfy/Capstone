import { db } from '../config/firebase.js';

// Create a new suggestion
export const createSuggestion = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { documentId, type, originalText, suggestedText, position, selection } = req.body;
    
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
    
    const suggestionData = {
      documentId,
      type, // 'insert', 'delete', 'replace'
      originalText,
      suggestedText,
      position,
      selection,
      authorId: userId,
      authorName: req.user.name || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending', // 'pending', 'accepted', 'rejected'
      resolvedBy: null,
      resolvedAt: null
    };
    
    const suggestionRef = await db.collection('suggestions').add(suggestionData);
    
    const newSuggestion = {
      id: suggestionRef.id,
      ...suggestionData
    };
    
    res.status(201).json(newSuggestion);
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({ error: 'Failed to create suggestion' });
  }
};

// Get all suggestions for a document
export const getSuggestions = async (req, res) => {
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
    
    const suggestionsRef = db.collection('suggestions');
    const snapshot = await suggestionsRef
      .where('documentId', '==', documentId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const suggestions = [];
    snapshot.forEach((doc) => {
      suggestions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
      });
    });
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

// Update a suggestion
export const updateSuggestion = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { suggestionId } = req.params;
    const { suggestedText, originalText } = req.body;
    
    const suggestionRef = db.collection('suggestions').doc(suggestionId);
    const suggestion = await suggestionRef.get();
    
    if (!suggestion.exists) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    const suggestionData = suggestion.data();
    
    // Check if user is the author
    if (suggestionData.authorId !== userId) {
      return res.status(403).json({ error: 'Only the author can update this suggestion' });
    }
    
    // Can only update pending suggestions
    if (suggestionData.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot update resolved suggestions' });
    }
    
    const updateData = {
      updatedAt: new Date(),
    };
    
    if (suggestedText !== undefined) updateData.suggestedText = suggestedText;
    if (originalText !== undefined) updateData.originalText = originalText;
    
    await suggestionRef.update(updateData);
    
    res.json({ message: 'Suggestion updated successfully' });
  } catch (error) {
    console.error('Error updating suggestion:', error);
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
};

// Delete a suggestion
export const deleteSuggestion = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { suggestionId } = req.params;
    
    const suggestionRef = db.collection('suggestions').doc(suggestionId);
    const suggestion = await suggestionRef.get();
    
    if (!suggestion.exists) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    const suggestionData = suggestion.data();
    
    // Check if user is the author or has admin access to the document
    if (suggestionData.authorId !== userId) {
      const docRef = db.collection('docs').doc(suggestionData.documentId);
      const doc = await docRef.get();
      const docData = doc.data();
      
      if (docData.roles?.[userId] !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    await suggestionRef.delete();
    
    res.json({ message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
};

// Resolve a suggestion (accept/reject)
export const resolveSuggestion = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { suggestionId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    
    const suggestionRef = db.collection('suggestions').doc(suggestionId);
    const suggestion = await suggestionRef.get();
    
    if (!suggestion.exists) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    const suggestionData = suggestion.data();
    
    // Verify user has editor/admin access to the document
    const docRef = db.collection('docs').doc(suggestionData.documentId);
    const doc = await docRef.get();
    const docData = doc.data();
    
    const userRole = docData.roles?.[userId];
    if (!userRole || userRole === 'viewer') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const status = action === 'accept' ? 'accepted' : 'rejected';
    
    await suggestionRef.update({
      status,
      resolvedBy: userId,
      resolvedAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({ message: `Suggestion ${action}ed successfully` });
  } catch (error) {
    console.error('Error resolving suggestion:', error);
    res.status(500).json({ error: 'Failed to resolve suggestion' });
  }
};