import React, { useState } from 'react';
import { Highlighter, MessageCircle, Edit3, X } from 'lucide-react';
import { useCollaboration } from './CollaborationProvider';

const HighlightToolbar = ({ selectedText, onClose }) => {
  const [mode, setMode] = useState('highlight'); // 'highlight', 'comment', 'suggest'
  const [input, setInput] = useState('');
  const { addHighlight, addComment, addSuggestion } = useCollaboration();

  const highlightColors = [
    { name: 'Yellow', color: '#FEF08A', textColor: '#854D0E' },
    { name: 'Green', color: '#BBF7D0', textColor: '#14532D' },
    { name: 'Blue', color: '#BFDBFE', textColor: '#1E3A8A' },
    { name: 'Pink', color: '#FBCFE8', textColor: '#BE185D' },
    { name: 'Purple', color: '#DDD6FE', textColor: '#5B21B6' },
    { name: 'Orange', color: '#FED7AA', textColor: '#C2410C' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (mode === 'highlight') {
      addHighlight({
        text: selectedText,
        color: highlightColors[0].color,
        textColor: highlightColors[0].textColor,
      });
    } else if (mode === 'comment') {
      addComment({
        text: selectedText,
        comment: input,
      });
    } else if (mode === 'suggest') {
      addSuggestion({
        originalText: selectedText,
        suggestedText: input,
      });
    }

    setInput('');
    onClose();
  };

  return (
    <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-primary-200 dark:border-secondary-700 w-96">
        <div className="p-4 border-b border-primary-200 dark:border-secondary-700 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setMode('highlight')}
              className={`p-2 rounded ${mode === 'highlight' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-primary-100'}`}
            >
              <Highlighter className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMode('comment')}
              className={`p-2 rounded ${mode === 'comment' ? 'bg-blue-100 text-blue-800' : 'hover:bg-primary-100'}`}
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMode('suggest')}
              className={`p-2 rounded ${mode === 'suggest' ? 'bg-green-100 text-green-800' : 'hover:bg-primary-100'}`}
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
          <button onClick={onClose} className="text-secondary-500 hover:text-secondary-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <div className="text-sm text-secondary-600 dark:text-primary-300 mb-2">Selected text:</div>
            <div className="p-2 bg-primary-50 dark:bg-secondary-700 rounded text-sm">
              {selectedText}
            </div>
          </div>

          {mode === 'highlight' && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {highlightColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className="w-8 h-8 rounded border-2 border-white dark:border-secondary-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>
          )}

          {(mode === 'comment' || mode === 'suggest') && (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'comment' ? "Add your comment..." : "Suggest new text..."}
              className="w-full px-3 py-2 border border-primary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white resize-none mb-4"
              rows={3}
              required
            />
          )}

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white ${
              mode === 'highlight' ? 'bg-yellow-500 hover:bg-yellow-600' :
              mode === 'comment' ? 'bg-blue-500 hover:bg-blue-600' :
              'bg-green-500 hover:bg-green-600'
            }`}
          >
            {mode === 'highlight' ? 'Highlight' : mode === 'comment' ? 'Add Comment' : 'Suggest Change'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HighlightToolbar;