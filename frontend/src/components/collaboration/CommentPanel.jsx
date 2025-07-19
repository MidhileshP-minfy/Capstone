import React, { useState } from 'react';
import { MessageCircle, X, Check, Clock, User } from 'lucide-react';
import { useCollaboration } from './CollaborationProvider';

const CommentPanel = ({ isOpen, onClose }) => {
  const { comments, addComment, resolveComment } = useCollaboration();
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment({
      content: newComment,
      position: { line: 0, column: 0 }, // This would be set based on cursor position
    });
    setNewComment('');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-secondary-800 border-l border-primary-200 dark:border-secondary-700 shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b border-primary-200 dark:border-secondary-700">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Comments ({comments.length})
        </h3>
        <button
          onClick={onClose}
          className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-200px)]">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`p-3 rounded-lg border ${
              comment.resolved
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                : 'bg-primary-50 dark:bg-secondary-700 border-primary-200 dark:border-secondary-600'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-secondary-400 flex items-center justify-center text-xs font-medium text-white">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium text-secondary-900 dark:text-white">
                  {comment.userName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-secondary-500 dark:text-primary-300 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimestamp(comment.timestamp)}
                </span>
                {!comment.resolved && (
                  <button
                    onClick={() => resolveComment(comment.id)}
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    title="Resolve comment"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-secondary-700 dark:text-primary-200">
              {comment.content}
            </p>
            {comment.resolved && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Resolved
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
            <p className="text-secondary-600 dark:text-primary-300">No comments yet</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-primary-200 dark:border-secondary-700">
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border border-primary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white resize-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="w-full bg-secondary-700 text-white py-2 px-4 rounded-md hover:bg-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentPanel;