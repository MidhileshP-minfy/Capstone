import React, { useState } from 'react';
import { Lightbulb, CheckCircle, X, ArrowRight, Sparkles } from 'lucide-react';

const SuggestionPanel = ({ suggestions, onApplySuggestion, onDismissSuggestion }) => {
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'accessibility':
        return '♿';
      case 'performance':
        return '⚡';
      case 'design':
        return '🎨';
      case 'ux':
        return '👤';
      default:
        return '💡';
    }
  };

  const getSuggestionColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-primary-200 dark:border-secondary-700 bg-primary-50 dark:bg-secondary-800/50';
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-secondary-900 border-l border-primary-200 dark:border-secondary-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-primary-100 dark:border-secondary-700 bg-primary-50 dark:bg-secondary-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-secondary-600 dark:text-primary-300" />
          <h3 className="font-semibold text-secondary-800 dark:text-white">Smart Suggestions</h3>
          {suggestions.length > 0 && (
            <span className="bg-primary-200 dark:bg-secondary-700 text-secondary-700 dark:text-primary-300 text-xs px-2 py-1 rounded-full">
              {suggestions.length}
            </span>
          )}
        </div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
          AI-powered recommendations to improve your design
        </p>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto text-primary-300 dark:text-secondary-600 mb-3" />
            <p className="text-secondary-500 dark:text-secondary-400 text-sm">No suggestions available</p>
            <p className="text-secondary-400 dark:text-secondary-500 text-xs mt-1">
              Keep designing and we'll provide helpful tips!
            </p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`border rounded-lg p-4 transition-all duration-200 text-white ${getSuggestionColor(suggestion.priority)}`}
            >
              {/* Suggestion Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-secondary-800 dark:text-white text-sm">
                      {suggestion.title}
                    </h4>
                    <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1 capitalize">
                      {suggestion.category} • {suggestion.priority} priority
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDismissSuggestion(suggestion.id)}
                  className="text-secondary-400 hover:text-secondary-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestion Description */}
              <p className="text-sm text-secondary-700 dark:text-secondary-300 mb-3">
                {suggestion.description}
              </p>

              {/* Expandable Details */}
              {suggestion.details && (
                <div className="mb-3">
                  <button
                    onClick={() => setExpandedSuggestion(
                      expandedSuggestion === suggestion.id ? null : suggestion.id
                    )}
                    className="text-xs text-blue-500 hover:text-blue-400 flex items-center space-x-1"
                  >
                    <span>View details</span>
                    <ArrowRight
                      className={`w-3 h-3 transition-transform ${
                        expandedSuggestion === suggestion.id ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {expandedSuggestion === suggestion.id && (
                    <div className="mt-2 p-3 bg-white dark:bg-secondary-800 rounded border border-primary-200 dark:border-secondary-700 text-xs text-secondary-600 dark:text-secondary-300">
                      {suggestion.details}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onApplySuggestion(suggestion)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>Apply</span>
                </button>
                <button
                  onClick={() => onDismissSuggestion(suggestion.id)}
                  className="px-3 py-2 border border-primary-300 dark:border-secondary-600 text-secondary-600 dark:text-secondary-300 rounded text-xs hover:bg-primary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SuggestionPanel;