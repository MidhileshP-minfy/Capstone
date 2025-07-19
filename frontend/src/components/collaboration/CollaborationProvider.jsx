import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AuthContext';

const CollaborationContext = createContext();

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

export const CollaborationProvider = ({ children, documentId }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!socket || !documentId || !user) return;

    // Join document room
    socket.emit('join-document', documentId);
    socket.emit('user-join', {
      docId: documentId,
      user: {
        id: user.uid,
        name: user.displayName || user.email,
        email: user.email,
        color: generateUserColor(user.uid),
      }
    });

    // Listen for presence updates
    socket.on('presence-update', (users) => {
      setActiveUsers(users.filter(u => u.id !== user.uid));
    });

    // Listen for comments
    socket.on('new-comment', (comment) => {
      setComments(prev => [...prev, comment]);
    });

    // Listen for suggestions
    socket.on('new-suggestion', (suggestion) => {
      setSuggestions(prev => [...prev, suggestion]);
    });

    // Get existing comments and suggestions
    socket.emit('get-comments', documentId, (existingComments) => {
      setComments(existingComments || []);
    });

    socket.emit('get-suggestions', documentId, (existingSuggestions) => {
      setSuggestions(existingSuggestions || []);
    });

    return () => {
      socket.off('presence-update');
      socket.off('new-comment');
      socket.off('new-suggestion');
    };
  }, [socket, documentId, user]);

  const addComment = (comment) => {
    if (!socket || !documentId) return;
    
    const newComment = {
      id: Date.now().toString(),
      documentId,
      userId: user.uid,
      userName: user.displayName || user.email,
      userEmail: user.email,
      content: comment.content,
      position: comment.position,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    socket.emit('add-comment', { docId: documentId, comment: newComment });
  };

  const addSuggestion = (suggestion) => {
    if (!socket || !documentId) return;
    
    const newSuggestion = {
      id: Date.now().toString(),
      documentId,
      userId: user.uid,
      userName: user.displayName || user.email,
      userEmail: user.email,
      type: suggestion.type, // 'insert', 'delete', 'replace'
      content: suggestion.content,
      originalContent: suggestion.originalContent,
      position: suggestion.position,
      timestamp: new Date().toISOString(),
      status: 'pending', // 'pending', 'accepted', 'rejected'
    };

    socket.emit('add-suggestion', { docId: documentId, suggestion: newSuggestion });
  };

  const resolveComment = (commentId) => {
    if (!socket || !documentId) return;
    socket.emit('resolve-comment', { docId: documentId, commentId });
  };

  const acceptSuggestion = (suggestionId) => {
    if (!socket || !documentId) return;
    socket.emit('accept-suggestion', { docId: documentId, suggestionId });
  };

  const rejectSuggestion = (suggestionId) => {
    if (!socket || !documentId) return;
    socket.emit('reject-suggestion', { docId: documentId, suggestionId });
  };

  const value = {
    socket,
    activeUsers,
    comments,
    suggestions,
    addComment,
    addSuggestion,
    resolveComment,
    acceptSuggestion,
    rejectSuggestion,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

// Generate consistent color for user based on their ID
const generateUserColor = (userId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};