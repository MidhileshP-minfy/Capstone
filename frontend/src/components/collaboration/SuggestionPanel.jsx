import React from 'react';
import { Edit3, X, Check, Clock, User } from 'lucide-react';
import { useCollaboration } from './CollaborationProvider';

const SuggestionPanel = ({ isOpen, onClose }) => {
  const { suggestions, acceptSuggestion, rejectSuggestion } = useCollaboration();

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSuggestionTypeColor = (type) => {
    switch (type) {
      case 'insert': return 'text-green-600 dark:text-green-400';
      case 'delete': return 'text-red-600 dark:text-red-400';
      case 'replace': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-secondary-600 dark:text-primary-300';
    }
  };

  const getSuggestionTypeLabel = (type) => {
    switch (type) {
      case 'insert': return 'Insert';
      case 'delete': return 'Delete';
      case 'replace': return 'Replace';
      default: return 'Edit';
    }
  };

  if (!isOpen) return null;

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-secondary-800 border-l border-primary-200 dark:border-secondary-700 shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b border-primary-200 dark:border-secondary-700">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center">
          <Edit3 className="h-5 w-5 mr-2" />
          Suggestions ({pendingSuggestions.length})
        </h3>
        <button
          onClick={onClose}
          className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-full">
        {pendingSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-3 rounded-lg border bg-primary-50 dark:bg-secondary-700 border-primary-200 dark:border-secondary-600"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-secondary-400 flex items-center justify-center text-xs font-medium text-white">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium text-secondary-900 dark:text-white">
                  {suggestion.userName}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full bg-white dark:bg-secondary-800 ${getSuggestionTypeColor(suggestion.type)}`}>
                  {getSuggestionTypeLabel(suggestion.type)}
                </span>
              </div>
              <span className="text-xs text-secondary-500 dark:text-primary-300 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimestamp(suggestion.timestamp)}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {suggestion.originalContent && (
                <div className="text-sm">
                  <span className="text-red-600 dark:text-red-400 font-medium">Original: </span>
                  <span className="line-through text-secondary-600 dark:text-primary-300">
                    {suggestion.originalContent}
                  </span>
                </div>
              )}
              <div className="text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {suggestion.type === 'delete' ? 'Delete' : 'Suggested'}: 
                </span>
                <span className="text-secondary-700 dark:text-primary-200 ml-1">
                  {suggestion.content}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => acceptSuggestion(suggestion.id)}
                className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Check className="h-3 w-3 mr-1" />
                Accept
              </button>
              <button
                onClick={() => rejectSuggestion(suggestion.id)}
                className="flex-1 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <X className="h-3 w-3 mr-1" />
                Reject
              </button>
            </div>
          </div>
        ))}

        {pendingSuggestions.length === 0 && (
          <div className="text-center py-8">
            <Edit3 className="h-12 w-12 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
            <p className="text-secondary-600 dark:text-primary-300">No pending suggestions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionPanel;