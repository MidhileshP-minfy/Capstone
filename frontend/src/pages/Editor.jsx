import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentApi } from '../services/api';
import BlockNoteEditor from '../components/editor/BlockNoteEditor';
import { Save, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState([
    {
      id: "1",
      type: "paragraph",
      content: "Start writing your document here..."
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (document && title && content) {
      const timer = setTimeout(() => {
        handleSave();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [title, content, document]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await documentApi.getById(id);
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content || [
        {
          id: "1",
          type: "paragraph",
          content: "Start writing your document here..."
        },
      ]);
    } catch (error) {
      setError('Failed to load document');
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document) return;

    try {
      setSaving(true);
      await documentApi.update(id, {
        title,
        content,
      });
      setLastSaved(new Date());
    } catch (error) {
      setError('Failed to save document');
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error && !document) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-secondary-600 dark:text-primary-300 hover:text-secondary-800 dark:hover:text-primary-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-4">
            {lastSaved && (
              <span className="text-sm text-secondary-500 dark:text-primary-300">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-secondary-700 text-white px-4 py-2 rounded-lg hover:bg-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md p-4 mb-6">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-primary-200 dark:border-secondary-700">
          <div className="p-6 border-b border-primary-200 dark:border-secondary-700">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Document title..."
              className="w-full text-3xl font-bold text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 border-none outline-none bg-transparent"
            />
          </div>
          
          <div className="p-6">
            <BlockNoteEditor
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing your document here..."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Editor;