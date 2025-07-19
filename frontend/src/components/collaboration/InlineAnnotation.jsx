import React from 'react';
import { MessageCircle, Edit3, Check, X } from 'lucide-react';
import { useCollaboration } from './CollaborationProvider';

const InlineAnnotation = ({ annotation }) => {
  const { resolveComment, acceptSuggestion, rejectSuggestion } = useCollaboration();

  const getBackground = () => {
    switch (annotation.type) {
      case 'highlight':
        return annotation.color;
      case 'comment':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'suggestion':
        return 'bg-green-100 dark:bg-green-900/20';
      default:
        return 'bg-primary-100 dark:bg-secondary-700';
    }
  };

  const handleAction = (action) => {
    switch (action) {
      case 'resolve':
        resolveComment(annotation.id);
        break;
      case 'accept':
        acceptSuggestion(annotation.id);
        break;
      case 'reject':
        rejectSuggestion(annotation.id);
        break;
    }
  };

  return (
    <div className="group relative inline">
      <span className={`${getBackground()} cursor-pointer`}>
        {annotation.text}
      </span>
      
      <div className="invisible group-hover:visible absolute z-50 bottom-full left-0 mb-2 w-64 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-primary-200 dark:border-secondary-700">
        <div className="p-3">
          <div className="flex items-center space-x-2 mb-2">
            {annotation.type === 'comment' && <MessageCircle className="h-4 w-4 text-blue-500" />}
            {annotation.type === 'suggestion' && <Edit3 className="h-4 w-4 text-green-500" />}
            <span className="text-sm font-medium">{annotation.userName}</span>
          </div>
          
          <p className="text-sm text-secondary-600 dark:text-primary-300 mb-3">
            {annotation.content || annotation.suggestedText}
          </p>

          {annotation.type === 'comment' && (
            <button
              onClick={() => handleAction('resolve')}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Resolve
            </button>
          )}

          {annotation.type === 'suggestion' && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleAction('accept')}
                className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700 dark:text-green-400"
              >
                <Check className="h-3 w-3" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => handleAction('reject')}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <X className="h-3 w-3" />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InlineAnnotation;