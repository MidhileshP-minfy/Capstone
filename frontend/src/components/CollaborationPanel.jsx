import React, { useState } from 'react';
import { MessageCircle, Highlighter, Edit3, Users, X, Plus, Send, Tag, Check } from 'lucide-react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useAuth } from '../contexts/AuthContext';

const CollaborationPanel = ({ isOpen, onClose }) => {
  const {
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
    addComment,
    addHighlight,
    updateComment,
    deleteComment
  } = useCollaboration();
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('comments');
  const [newComment, setNewComment] = useState('');
  const [selectedColor, setSelectedColor] = useState('#D8C9AE');
  const [highlightTags, setHighlightTags] = useState('');

  const colors = [
    '#D8C9AE', // Main theme color
    '#FFE066', // Yellow
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Light yellow
    '#DDA0DD'  // Plum
  ];

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        content: newComment,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdAt: new Date(),
        resolved: false,
        replies: []
      };
      addComment(comment);
      setNewComment('');
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleHighlight = () => {
    const tags = highlightTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const highlight = {
      id: Date.now(),
      color: selectedColor,
      tags: tags,
      authorId: user.uid,
      authorName: user.displayName || user.email,
      createdAt: new Date(),
      note: ''
    };
    addHighlight(highlight);
    setHighlightTags('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Collaboration</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Connected Users */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Online ({connectedUsers.length + 1})
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Current user */}
          <div className="flex items-center space-x-2 bg-[#D8C9AE] bg-opacity-20 px-2 py-1 rounded-full">
            <div className="w-6 h-6 bg-[#575757] rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {(user.displayName || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300">You</span>
          </div>
          
          {/* Connected users */}
          {connectedUsers.map((connectedUser) => (
            <div key={connectedUser.userId} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {connectedUser.userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-700 dark:text-gray-300">{connectedUser.userName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Buttons */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setIsCommenting(!isCommenting)}
            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isCommenting 
                ? 'bg-[#D8C9AE] text-[#575757]' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">Comment</span>
          </button>
          
          <button
            onClick={() => setIsHighlighting(!isHighlighting)}
            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isHighlighting 
                ? 'bg-[#D8C9AE] text-[#575757]' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Highlighter className="h-4 w-4" />
            <span className="text-sm">Highlight</span>
          </button>
          
          <button
            onClick={() => setIsSuggesting(!isSuggesting)}
            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isSuggesting 
                ? 'bg-[#D8C9AE] text-[#575757]' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            <span className="text-sm">Suggest</span>
          </button>
        </div>
      </div>

      {/* Highlight Color Picker */}
      {isHighlighting && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Highlight Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={highlightTags}
              onChange={(e) => setHighlightTags(e.target.value)}
              placeholder="important, review, question"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={handleHighlight}
            className="w-full bg-[#D8C9AE] text-[#575757] px-3 py-2 rounded-md hover:bg-[#C5B896] transition-colors"
          >
            Apply Highlight
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['comments', 'highlights', 'suggestions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? 'text-[#575757] border-b-2 border-[#D8C9AE]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {/* Add Comment */}
            {isCommenting && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => setIsCommenting(false)}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddComment}
                    className="px-3 py-1 bg-[#D8C9AE] text-[#575757] rounded-md hover:bg-[#C5B896] transition-colors text-sm"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            )}
            
            {/* Comments List */}
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[#575757] rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.authorName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
                {!comment.resolved && (
                  <button
                    onClick={() => updateComment(comment.id, { resolved: true })}
                    className="text-xs text-[#575757] hover:text-[#D8C9AE] flex items-center space-x-1"
                  >
                    <Check className="h-3 w-3" />
                    <span>Resolve</span>
                  </button>
                )}
              </div>
            ))}
            
            {comments.length === 0 && !isCommenting && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'highlights' && (
          <div className="space-y-4">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: highlight.color }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {highlight.authorName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(highlight.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {highlight.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {highlight.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {highlights.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Highlighter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No highlights yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[#575757] rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {suggestion.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {suggestion.authorName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(suggestion.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="mb-1"><strong>Type:</strong> {suggestion.type}</p>
                  {suggestion.originalText && (
                    <p className="mb-1"><strong>Original:</strong> {suggestion.originalText}</p>
                  )}
                  {suggestion.suggestedText && (
                    <p className="mb-1"><strong>Suggested:</strong> {suggestion.suggestedText}</p>
                  )}
                </div>
              </div>
            ))}
            
            {suggestions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Edit3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No suggestions yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationPanel;