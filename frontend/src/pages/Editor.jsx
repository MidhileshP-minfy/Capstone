import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentApi } from '../services/api';
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { ArrowLeft, Share2, CheckCircle, Clock, Loader2, Users, MessageCircle, Lightbulb } from 'lucide-react';
import Layout from '../components/Layout';
import ShareModal from '../components/ShareModal';
import CommentSystem from '../components/collaboration/CommentSystem';
import SuggestionPanel from '../components/collaboration/SuggestionPanel';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { isEqual, debounce } from 'lodash';
import { CollaborationProvider } from '../components/collaboration/CollaborationProvider';
import ActiveUsers from '../components/collaboration/ActiveUsers';

// Custom hook for debouncing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const editorContainerRef = useRef(null);

    // Core State
    const [document, setDocument] = useState(null);
    const [title, setTitle] = useState('');
    const [editorContent, setEditorContent] = useState([
        { type: "paragraph", children: [{ text: "Start writing..." }] }
    ]);
    const [isEditable, setIsEditable] = useState(false);

    // UI & Save State
    const [status, setStatus] = useState('idle'); // 'idle', 'saving', 'saved'
    const [loading, setLoading] = useState(true);
    const [lastSaved, setLastSaved] = useState(null);
    const [error, setError] = useState('');
    const [isShareModalOpen, setShareModalOpen] = useState(false);

    // Comment System State
    const [comments, setComments] = useState([]);
    const [isCommentSystemVisible, setIsCommentSystemVisible] = useState(false);
    const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
    const [selectedText, setSelectedText] = useState('');
    const [selectedRange, setSelectedRange] = useState(null);

    // Suggestion Panel State
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionPanelVisible, setIsSuggestionPanelVisible] = useState(false);

    // BlockNote Editor Instance
    const editor = useCreateBlockNote({
        initialContent: editorContent,
        animations: true,
        defaultStyles: true,
        trailingBlock: true
    });

    // Store initial data for comparison
    const [initialData, setInitialData] = useState({
        title: '',
        content: [{ type: "paragraph", children: [{ text: "Start writing..." }] }],
        comments: [],
        suggestions: []
    });

    // Debounce inputs to trigger auto-save
    const debouncedTitle = useDebounce(title, 1500);
    const debouncedContent = useDebounce(editor?.document || editorContent, 1500);
    const debouncedComments = useDebounce(comments, 1000);
    const debouncedSuggestions = useDebounce(suggestions, 1000);

    // --- EFFECTS ---

    // 1. Load document from server on mount
    useEffect(() => {
        if (id && user) {
            loadDocument();
        }
    }, [id, user]);

    // 2. Update editor content when document loads
    useEffect(() => {
        if (document?.content && editor) {
            const validContent = Array.isArray(document.content) && document.content.length > 0
                ? document.content
                : [{ type: "paragraph", children: [{ text: "Start writing..." }] }];

            editor.replaceBlocks(editor.document, validContent);
            setEditorContent(validContent);
            
            // Load comments and suggestions
            setComments(document.comments || []);
            setSuggestions(document.suggestions || []);
            
            setInitialData({
                title: document.title,
                content: JSON.parse(JSON.stringify(validContent)),
                comments: document.comments || [],
                suggestions: document.suggestions || []
            });
        }
    }, [document, editor]);

    // 3. Auto-save Trigger
    useEffect(() => {
        if (!isEditable || !document || loading || !editor) return;

        const currentContent = editor.topLevelBlocks;
        const hasTitleChanged = debouncedTitle !== initialData.title;
        const hasContentChanged = !isEqual(currentContent, initialData.content);
        const hasCommentsChanged = !isEqual(debouncedComments, initialData.comments);
        const hasSuggestionsChanged = !isEqual(debouncedSuggestions, initialData.suggestions);

        if (hasTitleChanged || hasContentChanged || hasCommentsChanged || hasSuggestionsChanged) {
            handleSave();
        }
    }, [debouncedTitle, debouncedContent, debouncedComments, debouncedSuggestions, initialData, isEditable, document, loading, editor]);

    // 4. Generate suggestions based on content changes
    useEffect(() => {
        if (isEditable && editor && editorContent.length > 0) {
            generateSmartSuggestions();
        }
    }, [editorContent, isEditable]);

    // --- DATA HANDLING ---

    const loadDocument = async () => {
        try {
            setLoading(true);
            const doc = await documentApi.getById(id);
            const userRole = doc.roles?.[user.uid] || null;

            const canEdit = userRole === 'admin' || userRole === 'editor';
            setIsEditable(canEdit);

            const initialContent = doc.content && Array.isArray(doc.content) && doc.content.length > 0
                ? doc.content
                : [{ type: "paragraph", children: [{ text: "Start writing..." }] }];

            setTitle(doc.title);
            setDocument({ ...doc, role: userRole });
            setLastSaved(doc.updatedAt ? new Date(doc.updatedAt) : null);
            setInitialData({ 
                title: doc.title, 
                content: initialContent,
                comments: doc.comments || [],
                suggestions: doc.suggestions || []
            });
            setEditorContent(initialContent);

        } catch (error) {
            console.error('Load document error:', error);
            setError('Failed to load document.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (status === 'saving' || !isEditable || !document || !editor) return;

        try {
            setStatus('saving');
            const currentContent = editor.topLevelBlocks;

            await documentApi.update(id, {
                title: title,
                content: currentContent,
                comments: comments,
                suggestions: suggestions
            });

            setInitialData({
                title: title,
                content: JSON.parse(JSON.stringify(currentContent)),
                comments: JSON.parse(JSON.stringify(comments)),
                suggestions: JSON.parse(JSON.stringify(suggestions))
            });
            setLastSaved(new Date());
            setStatus('saved');

            setTimeout(() => setStatus('idle'), 2000);

        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save document');
            setStatus('idle');
        }
    };

    // --- COMMENT SYSTEM HANDLERS ---

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText && isEditable) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            setSelectedText(selectedText);
            setSelectedRange(range);
            setCommentPosition({
                x: rect.right + 10,
                y: rect.top + window.scrollY
            });
            setIsCommentSystemVisible(true);
        }
    };

    const handleAddComment = (commentText) => {
        const newComment = {
            id: Date.now().toString(),
            text: commentText,
            author: user.name || user.email || 'Anonymous',
            authorId: user.uid,
            timestamp: new Date().toLocaleString(),
            selectedText: selectedText,
            resolved: false,
            createdAt: new Date().toISOString()
        };

        setComments(prev => [...prev, newComment]);
        setIsCommentSystemVisible(false);
        setSelectedText('');
        setSelectedRange(null);
    };

    const handleResolveComment = (commentId) => {
        setComments(prev => 
            prev.map(comment => 
                comment.id === commentId 
                    ? { ...comment, resolved: true, resolvedAt: new Date().toISOString() }
                    : comment
            )
        );
    };

    const handleCloseCommentSystem = () => {
        setIsCommentSystemVisible(false);
        setSelectedText('');
        setSelectedRange(null);
    };

    // --- SUGGESTION SYSTEM HANDLERS ---

    const generateSmartSuggestions = () => {
        const contentText = editorContent
            .map(block => {
                if (block.type === 'paragraph' && block.children) {
                    return block.children.map(child => child.text || '').join('');
                }
                return '';
            })
            .join(' ');

        const newSuggestions = [];

        // Accessibility suggestions
        if (contentText.length > 100 && !contentText.includes('alt=')) {
            newSuggestions.push({
                id: 'accessibility-' + Date.now(),
                type: 'accessibility',
                category: 'Accessibility',
                priority: 'high',
                title: 'Add Alt Text for Images',
                description: 'Consider adding descriptive alt text for any images to improve accessibility.',
                details: 'Alt text helps screen readers understand image content and improves SEO.',
                impact: 'High - Better accessibility'
            });
        }

        // Writing quality suggestions
        const sentences = contentText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.reduce((acc, s) => acc + s.trim().split(' ').length, 0) / sentences.length;
        
        if (avgSentenceLength > 25) {
            newSuggestions.push({
                id: 'readability-' + Date.now(),
                type: 'ux',
                category: 'Readability',
                priority: 'medium',
                title: 'Improve Readability',
                description: 'Some sentences are quite long. Consider breaking them down for better readability.',
                details: 'Shorter sentences are easier to read and understand. Aim for 15-20 words per sentence.',
                impact: 'Medium - Better user experience'
            });
        }

        // Performance suggestions
        if (contentText.length > 5000) {
            newSuggestions.push({
                id: 'performance-' + Date.now(),
                type: 'performance',
                category: 'Performance',
                priority: 'low',
                title: 'Consider Content Pagination',
                description: 'This document is getting quite long. Consider breaking it into sections or pages.',
                details: 'Longer documents can impact loading times and user engagement.',
                impact: 'Low - Better performance'
            });
        }

        // Only add new suggestions that don't already exist
        const existingIds = suggestions.map(s => s.id);
        const filteredSuggestions = newSuggestions.filter(s => !existingIds.includes(s.id));
        
        if (filteredSuggestions.length > 0) {
            setSuggestions(prev => [...prev, ...filteredSuggestions]);
        }
    };

    const handleApplySuggestion = (suggestion) => {
        // Here you would implement the logic to apply the suggestion
        // For now, we'll just mark it as applied and remove it
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        
        // You could also show a success message
        console.log('Applied suggestion:', suggestion.title);
    };

    const handleDismissSuggestion = (suggestionId) => {
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    };

    // --- RENDER LOGIC ---

    const getStatusIndicator = () => {
        if (!isEditable) {
            return lastSaved ? (
                <span className="text-sm text-secondary-500 dark:text-primary-300 flex items-center">
                    <Clock className="h-4 w-4 mr-1.5" />
                    Last saved: {lastSaved.toLocaleTimeString()}
                </span>
            ) : null;
        }

        if (status === 'saving') {
            return (
                <span className="text-sm text-secondary-500 dark:text-primary-300 flex items-center">
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                </span>
            );
        }

        if (status === 'saved' || status === 'idle') {
            return (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Saved
                </span>
            );
        }

        return <div className="h-5 w-20" />;
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
                </div>
            </Layout>
        );
    }

    if (error && !document) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto p-8">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <CollaborationProvider documentId={id}>
            <Layout>
                <div className="flex h-screen">
                    {/* Main Editor Area */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-hidden">
                            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6 h-10">
                                    <button 
                                        onClick={() => navigate('/dashboard')} 
                                        className="flex items-center space-x-2 text-secondary-600 dark:text-primary-300 hover:text-secondary-800 dark:hover:text-primary-100"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back</span>
                                    </button>

                                    <div className="flex items-center space-x-4">
                                        <ActiveUsers />
                                        
                                        {/* Comments Toggle */}
                                        {isEditable && (
                                            <button
                                                onClick={() => setIsCommentSystemVisible(!isCommentSystemVisible)}
                                                className="flex items-center space-x-2 px-3 py-2 text-sm text-secondary-600 dark:text-primary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                <span>Comments</span>
                                                {comments.filter(c => !c.resolved).length > 0 && (
                                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                        {comments.filter(c => !c.resolved).length}
                                                    </span>
                                                )}
                                            </button>
                                        )}

                                        {/* Suggestions Toggle */}
                                        {isEditable && (
                                            <button
                                                onClick={() => setIsSuggestionPanelVisible(!isSuggestionPanelVisible)}
                                                className="flex items-center space-x-2 px-3 py-2 text-sm text-secondary-600 dark:text-primary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                                            >
                                                <Lightbulb className="h-4 w-4" />
                                                <span>Suggestions</span>
                                                {suggestions.length > 0 && (
                                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                        {suggestions.length}
                                                    </span>
                                                )}
                                            </button>
                                        )}

                                        {getStatusIndicator()}

                                        {/* Share Button */}
                                        {(document?.role === 'admin' || document?.role === 'editor') && (
                                            <button 
                                                onClick={() => setShareModalOpen(true)} 
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                <span>Share</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Document Editor */}
                                <div 
                                    ref={editorContainerRef}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg"
                                >
                                    <div className="p-6 border-b border-primary-200 dark:border-secondary-700">
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Document title..."
                                            className="w-full text-3xl font-bold text-secondary-900 dark:text-white placeholder-secondary-400 bg-transparent border-none outline-none"
                                            disabled={!isEditable}
                                        />
                                    </div>

                                    <div 
                                        className="p-6 flex-1 overflow-y-auto"
                                        onMouseUp={handleTextSelection}
                                    >
                                        {editor && (
                                            <BlockNoteView
                                                editor={editor}
                                                editable={isEditable}
                                                theme={isDark ? "dark" : "light"}
                                                className="min-h-[500px]"
                                                onChange={(editor) => {
                                                    setEditorContent(editor.topLevelBlocks);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suggestion Panel */}
                    {isSuggestionPanelVisible && (
                        <SuggestionPanel
                            suggestions={suggestions}
                            onApplySuggestion={handleApplySuggestion}
                            onDismissSuggestion={handleDismissSuggestion}
                        />
                    )}
                </div>

                {/* Comment System */}
                <CommentSystem
                    isVisible={isCommentSystemVisible}
                    onClose={handleCloseCommentSystem}
                    position={commentPosition}
                    comments={comments}
                    onAddComment={handleAddComment}
                    onResolveComment={handleResolveComment}
                />

                {/* Share Modal */}
                {document && (
                    <ShareModal 
                        isOpen={isShareModalOpen} 
                        onClose={() => setShareModalOpen(false)} 
                        document={document} 
                    />
                )}
            </Layout>
        </CollaborationProvider>
    );
};

export default Editor;