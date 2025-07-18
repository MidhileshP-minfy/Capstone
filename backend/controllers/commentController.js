import { db } from '../config/firebase.js';

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { documentId, content, position, selection } = req.body;
    
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
    
    const commentData = {
      documentId,
      content,
      position,
      selection,
      authorId: userId,
      authorName: req.user.name || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolved: false,
      replies: []
    };
    
    const commentRef = await db.collection('comments').add(commentData);
    
    const newComment = {
      id: commentRef.id,
      ...commentData
    };
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

// Get all comments for a document
export const getComments = async (req, res) => {
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
    
    const commentsRef = db.collection('comments');
    const snapshot = await commentsRef
      .where('documentId', '==', documentId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { commentId } = req.params;
    const { content, replies } = req.body;
    
    const commentRef = db.collection('comments').doc(commentId);
    const comment = await commentRef.get();
    
    if (!comment.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const commentData = comment.data();
    
    // Check if user is the author or has admin access to the document
    if (commentData.authorId !== userId) {
      const docRef = db.collection('docs').doc(commentData.documentId);
      const doc = await docRef.get();
      const docData = doc.data();
      
      if (docData.roles?.[userId] !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const updateData = {
      updatedAt: new Date(),
    };
    
    if (content !== undefined) updateData.content = content;
    if (replies !== undefined) updateData.replies = replies;
    
    await commentRef.update(updateData);
    
    res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { commentId } = req.params;
    
    const commentRef = db.collection('comments').doc(commentId);
    const comment = await commentRef.get();
    
    if (!comment.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const commentData = comment.data();
    
    // Check if user is the author or has admin access to the document
    if (commentData.authorId !== userId) {
      const docRef = db.collection('docs').doc(commentData.documentId);
      const doc = await docRef.get();
      const docData = doc.data();
      
      if (docData.roles?.[userId] !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    await commentRef.delete();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Resolve/unresolve a comment
export const resolveComment = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { commentId } = req.params;
    const { resolved } = req.body;
    
    const commentRef = db.collection('comments').doc(commentId);
    const comment = await commentRef.get();
    
    if (!comment.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const commentData = comment.data();
    
    // Verify user has access to the document
    const docRef = db.collection('docs').doc(commentData.documentId);
    const doc = await docRef.get();
    const docData = doc.data();
    
    if (!docData.roles?.[userId]) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await commentRef.update({
      resolved: resolved,
      resolvedBy: resolved ? userId : null,
      resolvedAt: resolved ? new Date() : null,
      updatedAt: new Date()
    });
    
    res.json({ message: 'Comment resolved status updated' });
  } catch (error) {
    console.error('Error resolving comment:', error);
    res.status(500).json({ error: 'Failed to resolve comment' });
  }
};