import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentApi } from '../services/api';
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { ArrowLeft, Share2, CheckCircle, Clock, Loader2, MessageCircle, Users } from 'lucide-react';
import Layout from '../components/Layout';
import ShareModal from '../components/ShareModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { isEqual, debounce } from 'lodash';
import { CollaborationProvider } from '../components/collaboration/CollaborationProvider';
import ActiveUsers from '../components/collaboration/ActiveUsers';
import CommentPanel from '../components/collaboration/CommentPanel';


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
    const [isCommentPanelOpen, setCommentPanelOpen] = useState(false);

    // BlockNote Editor Instance
    const editor = useCreateBlockNote({
        initialContent: editorContent,
        animations: true,
        defaultStyles: true,
        trailingBlock: true
    });

    // Update editor content when document loads
    useEffect(() => {
        if (document?.content && editor) {
            const validContent = Array.isArray(document.content) && document.content.length > 0
                ? document.content
                : [{ type: "paragraph", children: [{ text: "Start writing..." }] }];

            editor.replaceBlocks(editor.document, validContent);
            setEditorContent(validContent);
            setInitialData({
                title: document.title,
                content: JSON.parse(JSON.stringify(validContent))
            });
        }
    }, [document, editor]);

    // Debounce inputs to trigger auto-save
    const debouncedTitle = useDebounce(title, 1500);
    const debouncedContent = useDebounce(editor?.document || editorContent, 1500);

    // Store initial data for comparison
    const [initialData, setInitialData] = useState({
        title: '',
        content: [{ type: "paragraph", children: [{ text: "Start writing..." }] }]
    });

    // --- EFFECTS ---

    // 1. Load document from server on mount
    useEffect(() => {
        if (id && user) {
            loadDocument();
        }
    }, [id, user]);

    // 2. VS Code-style Auto-save Trigger
    useEffect(() => {
        if (!isEditable || !document || loading || !editor) return;

        const currentContent = editor.topLevelBlocks;
        const hasTitleChanged = debouncedTitle !== initialData.title;
        const hasContentChanged = JSON.stringify(currentContent) !== JSON.stringify(initialData.content);

        if (hasTitleChanged || hasContentChanged) {
            handleSave();
        }
    }, [debouncedTitle, editor?.topLevelBlocks]);

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
            setInitialData({ title: doc.title, content: initialContent });
            setEditorContent(initialContent);

        } catch (error) {
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
            });

            setInitialData({
                title: title,
                content: JSON.parse(JSON.stringify(currentContent))
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

    // --- RENDER LOGIC ---

    const getStatusIndicator = () => {
        // Viewer Role: Always show "Last saved"
        if (!isEditable) {
            return lastSaved ? (
                <span className="text-sm text-secondary-500 dark:text-primary-300 flex items-center">
                    <Clock className="h-4 w-4 mr-1.5" />
                    Last saved: {lastSaved.toLocaleTimeString()}
                </span>
            ) : null;
        }

        // Editor/Admin Roles: Show dynamic status
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

        return <div className="h-5 w-20"/>; // Keep space consistent
    };

    if (loading) return <Layout><div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"/></div></Layout>;
    if (error && !document) return <Layout><div className="max-w-4xl mx-auto p-8"><div className="bg-red-50 border border-red-200 rounded-md p-4"><p className="text-red-600">{error}</p></div></div></Layout>;

    return (
        <CollaborationProvider documentId={id}>
            <Layout>
                <div className={`transition-all duration-300 ${isCommentPanelOpen ? 'mr-80' : ''}`}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between mb-6 h-10">
                            <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 text-secondary-600 dark:text-primary-300 hover:text-secondary-800 dark:hover:text-primary-100">
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back</span>
                            </button>

                            <div className="flex items-center space-x-4">
                                <ActiveUsers />
                                {getStatusIndicator()}

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            setCommentPanelOpen(!isCommentPanelOpen);
                                        }}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isCommentPanelOpen
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-primary-100 dark:bg-secondary-700 text-secondary-600 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-secondary-600'
                                        }`}
                                        title="Comments"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                    </button>
                                </div>

                                {(document?.role === 'admin' || document?.role === 'editor') && (
                                    <button onClick={() => setShareModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                                        <Share2 className="h-4 w-4" />
                                        <span>Share</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-primary-200 dark:border-secondary-700">
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

                            <div className="p-6">
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

                <CommentPanel
                    isOpen={isCommentPanelOpen}
                    onClose={() => setCommentPanelOpen(false)}
                />

                {document && <ShareModal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} document={document} />}
            </Layout>
        </CollaborationProvider>
    );
};

export default Editor;