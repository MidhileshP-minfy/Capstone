import React, { createContext, useContext, useState } from 'react';

const CollaborationContext = createContext();

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

export const CollaborationProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const addComment = (comment) => {
    setComments(prev => [...prev, comment]);
  };

  const updateComment = (commentId, updates) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, ...updates } : comment
    ));
  };

  const deleteComment = (commentId) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const addHighlight = (highlight) => {
    setHighlights(prev => [...prev, highlight]);
  };

  const updateHighlight = (highlightId, updates) => {
    setHighlights(prev => prev.map(highlight => 
      highlight.id === highlightId ? { ...highlight, ...updates } : highlight
    ));
  };

  const deleteHighlight = (highlightId) => {
    setHighlights(prev => prev.filter(highlight => highlight.id !== highlightId));
  };

  const addSuggestion = (suggestion) => {
    setSuggestions(prev => [...prev, suggestion]);
  };

  const updateSuggestion = (suggestionId, updates) => {
    setSuggestions(prev => prev.map(suggestion => 
      suggestion.id === suggestionId ? { ...suggestion, ...updates } : suggestion
    ));
  };

  const deleteSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.filter(suggestion => suggestion.id !== suggestionId));
  };

  const value = {
    comments,
    highlights,
    suggestions,
    connectedUsers,
    isCommenting,
    isHighlighting,
    isSuggesting,
    setIsCommenting,
    setIsHighlighting,
    setIsSuggesting,
    setConnectedUsers,
    addComment,
    updateComment,
    deleteComment,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    addSuggestion,
    updateSuggestion,
    deleteSuggestion
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};