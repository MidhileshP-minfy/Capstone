import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc as firestoreDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { documentApi } from '../services/api';
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { ArrowLeft, Share2, CheckCircle, Clock, Loader2, Users } from 'lucide-react';
import Layout from '../components/Layout';
import ShareModal from '../components/ShareModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { YDocProvider, useYDoc, useYjsProvider } from "@y-sweet/react";
import {
  DefaultThreadStoreAuth,
  YjsThreadStore,
} from "@blocknote/core/comments";
import { generateUserColor } from "../components/collaboration/utils.js";

// Custom hook for debouncing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

async function resolveUsers(userIds) {
  try {
    if (!userIds || userIds.length === 0) return [];
    
    // Try to get users from Firestore first
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "in", userIds));
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: userData.uid,
          name: userData.displayName || userData.email || `User ${userData.uid?.slice(-4) || 'Unknown'}`,
          avatarUrl: userData.photoURL || '',
        });
      });
      
      if (users.length > 0) return users;
    } catch (firestoreError) {
      console.warn('Firestore user lookup failed, using fallback:', firestoreError);
    }
    
    // Fallback: create user objects from userIds
    return userIds.map(userId => ({
      id: userId,
      name: `User ${userId?.slice(-4) || 'Unknown'}`,
      avatarUrl: '',
    }));
    
  } catch (error) {
    console.error('Error resolving users:', error);
    // Final fallback
    return userIds.map(userId => ({
      id: userId,
       name: `User ${userId?.slice(-4) || 'Unknown'}`,
      avatarUrl: '',
    }));
  }
}

const Editor = () => {
  const { id } = useParams();

  return (
    <YDocProvider
      docId={id}
      authEndpoint="https://demos.y-sweet.dev/api/auth"
    >
      <Document />
    </YDocProvider>
  );
};

function Document() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Core State
  const [document, setDocument] = useState(null);
  const [documentUsers, setDocumentUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [title, setTitle] = useState('');
  const [isEditable, setIsEditable] = useState(false);

  // UI & Save State
  const [status, setStatus] = useState('idle'); // 'idle', 'saving', 'saved'
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [isShareModalOpen, setShareModalOpen] = useState(false);

  // Yjs providers
  const provider = useYjsProvider();
  const ydoc = useYDoc();

  // Store initial data for comparison
  const [initialData, setInitialData] = useState({
    title: '',
    content: [{ type: "paragraph", content: [{ type: "text", text: "Start writing..." }] }]
  });

  // Debounce title to trigger auto-save
  const debouncedTitle = useDebounce(title, 1500);

  // Load document and users
  useEffect(() => {
    const fetchDocumentAndUsers = async () => {
      if (user && id) {
        try {
          setLoading(true);
          
          // Load document from API to get permissions and metadata
          const doc = await documentApi.getById(id);
          const userRole = doc.roles?.[user.uid] || null;
          const canEdit = userRole === 'admin' || userRole === 'editor';
          
          setIsEditable(canEdit);
          setTitle(doc.title);
          setDocument({ ...doc, role: userRole });
          setLastSaved(doc.updatedAt ? new Date(doc.updatedAt) : null);
          setInitialData({ title: doc.title });

          // Load users from Firestore for collaboration
          const userIds = doc.members || [];
          
          // Enhanced user resolution with Firebase Auth data
          const usersData = await Promise.all(
            userIds.map(async (userId) => {
              try {
                // Try to get user from Firestore first
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("uid", "==", userId));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                  const userData = querySnapshot.docs[0].data();
                  return {
                    id: userData.uid,
                    name: userData.displayName || userData.email || `User ${userData.uid?.slice(-4) || 'Unknown'}`,
                    email: userData.email,
                    avatarUrl: userData.photoURL || '',
                  };
                }
                
                // Fallback for current user
                if (userId === user.uid) {
                  return {
                    id: user.uid,
                    name: user.displayName || user.email || `User ${user.uid?.slice(-4) || 'Unknown'}`,
                    email: user.email,
                    avatarUrl: user.photoURL || '',
                  };
                }
                
                // Final fallback
                return {
                  id: userId,
                  name: `User ${userId?.slice(-4) || 'Unknown'}`,
                  email: '',
                  avatarUrl: '',
                };
              } catch (error) {
                console.warn(`Failed to resolve user ${userId}:`, error);
                return {
                  id: userId,
                  name: `User ${userId?.slice(-4) || 'Unknown'}`,
                  email: '',
                  avatarUrl: '',
                };
              }
            })
          );
          
          setDocumentUsers(usersData);

          const currentUser = usersData.find(u => u.id === user.uid) || {
            id: user.uid,
            name: user.displayName || user.email || `User ${user.uid?.slice(-4) || 'Unknown'}`,
            email: user.email,
            role: userRole || 'viewer'
          };
          
          setActiveUser({ ...currentUser, role: userRole || 'viewer' });
          
        } catch (error) {
          console.error('Load document error:', error);
          setError('Failed to load document.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDocumentAndUsers();
  }, [id, user]);

  // Auto-save title changes
  useEffect(() => {
    if (!isEditable || !document || loading || !activeUser) return;

    const hasTitleChanged = debouncedTitle !== initialData.title;
    if (hasTitleChanged && debouncedTitle.trim()) {
      handleSave();
    }
  }, [debouncedTitle, initialData.title, isEditable, document, loading, activeUser]);

  // Thread store for comments
  const threadStore = useMemo(() => {
    if (!activeUser || !ydoc) return null;
    return new YjsThreadStore(
      activeUser.id,
      ydoc.getMap("threads"),
      new DefaultThreadStoreAuth(activeUser.id, activeUser.role === 'viewer' ? 'comment' : 'editor'),
    );
  }, [ydoc, activeUser]);

  // BlockNote editor with collaboration
  const editor = useCreateBlockNote(
    {
      resolveUsers,
      comments: threadStore ? { threadStore } : undefined,
      collaboration: provider && activeUser ? {
        provider,
        fragment: ydoc.getXmlFragment("blocknote"),
        user: { 
          color: generateUserColor(activeUser.id), 
          name: activeUser.name 
        },
        showCursorLabels: "activity"
      } : undefined,
    },
    [activeUser, threadStore, provider, ydoc],
  );

  // Save function for title updates
  const handleSave = async () => {
    if (status === 'saving' || !isEditable || !document) return;

    try {
      setStatus('saving');
      
      await documentApi.update(id, {
        title: title,
        // Note: Content is now handled by Yjs collaboration
      });

      setInitialData({ title: title });
      setLastSaved(new Date());
      setStatus('saved');

      setTimeout(() => setStatus('idle'), 2000);

    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save document');
      setStatus('idle');
    }
  };

  // Status indicator
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

  if (!activeUser || !document) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-screen">
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
                  {/* Active Users Display */}
                  {documentUsers.length > 1 && (
                    <div className="flex items-center space-x-2 bg-white dark:bg-secondary-800 rounded-lg px-3 py-2 shadow-sm border border-primary-200 dark:border-secondary-700">
                      <Users className="h-4 w-4 text-secondary-600 dark:text-primary-300" />
                      <span className="text-sm text-secondary-600 dark:text-primary-300">
                        {documentUsers.length} users
                      </span>
                      <div className="flex -space-x-2">
                        {documentUsers.slice(0, 3).map((docUser) => (
                          <div
                            key={docUser.id}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-secondary-800 flex items-center justify-center text-xs font-medium text-white"
                            style={{ backgroundColor: generateUserColor(docUser.id) }}
                            title={docUser.name}
                          >
                            {docUser.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {documentUsers.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-secondary-800 bg-secondary-400 flex items-center justify-center text-xs font-medium text-white">
                            +{documentUsers.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
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

                <div className="p-6 flex-1 overflow-y-auto">
                  <BlockNoteView
                    className="comments-main-container min-h-[500px]"
                    editor={editor}
                    editable={isEditable}
                    theme={isDark ? "dark" : "light"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {document && (
        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setShareModalOpen(false)} 
          document={document} 
        />
      )}
    </Layout>
  );
}

export default Editor;