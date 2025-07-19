import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, User, Clock, MoreHorizontal } from 'lucide-react';

/**
 * A pop-up component for displaying and adding comments.
 * @param {string} mode - 'viewAll' for a read-only list, 'add' for adding a new comment.
 * @param {string|null} targetText - The selected text being commented on.
 */
const CommentSystem = ({
  isVisible,
  onClose,
  position,
  comments,
  onAddComment,
  onResolveComment,
  mode = 'viewAll',
  targetText = null
}) => {
  const [newComment, setNewComment] = useState('');
  const commentInputRef = useRef(null);

  useEffect(() => {
    if (isVisible && mode === 'add' && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [isVisible, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  if (!isVisible) return null;

  const getTitle = () => {
    if (mode === 'add' && targetText) {
      const displayText = targetText.length > 20 ? `${targetText.substring(0, 20)}...` : targetText;
      return `Reply to "${displayText}"`;
    }
    return 'All Comments';
  };

  return (
    <div
      className="absolute bg-white dark:bg-secondary-800 rounded-lg shadow-2xl border border-primary-200 dark:border-secondary-700 w-80 z-50 flex flex-col"
      style={{ left: position.x, top: position.y, maxHeight: '450px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-100 dark:border-secondary-700">
        <div className="flex items-center space-x-2 min-w-0">
          <MessageCircle className="w-5 h-5 text-secondary-600 dark:text-primary-300 flex-shrink-0" />
          <span className="font-medium text-secondary-800 dark:text-white truncate" title={getTitle()}>{getTitle()}</span>
          {comments.length > 0 && (
            <span className="bg-primary-100 dark:bg-secondary-700 text-secondary-600 dark:text-primary-300 text-xs px-2 py-1 rounded-full">
              {comments.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600 dark:hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 max-h-80 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="p-4 text-center text-secondary-500 dark:text-secondary-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary-300 dark:text-secondary-600" />
            <p className="text-sm">{mode === 'add' ? 'Be the first to comment on this.' : 'No comments yet.'}</p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary-600 dark:text-primary-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-secondary-800 dark:text-white text-sm">{comment.author}</span>
                      <span className="text-xs text-secondary-500 dark:text-secondary-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />{comment.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-700 dark:text-secondary-200 mt-1">{comment.text}</p>
                    {comment.targetText && (
                      <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1 border-l-2 border-primary-200 pl-2 italic">
                        Replying to: "{comment.targetText}"
                      </p>
                    )}
                    {comment.resolved && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">Resolved</span>
                    )}
                  </div>
                  <button className="text-secondary-400 hover:text-secondary-600 dark:hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                {!comment.resolved && (
                  <button onClick={() => onResolveComment(comment.id)} className="text-xs text-secondary-500 hover:text-secondary-700 dark:hover:text-white ml-11">
                    Mark as resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conditionally render Add Comment Form */}
      {mode === 'add' && (
        <div className="border-t border-primary-100 dark:border-secondary-700 p-4 bg-primary-50 dark:bg-secondary-900/50 rounded-b-lg">
          <form onSubmit={handleSubmit}>
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 bg-white dark:bg-secondary-800 border border-primary-200 dark:border-secondary-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-secondary-800 dark:text-white"
              rows={3}
            />
            <div className="flex justify-end items-center mt-3">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Comment</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommentSystem;