const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

// Simple API service without Firebase authentication
export const documentApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/docs`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/docs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch document');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/docs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/docs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/docs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
    return response.json();
  },
};

export const commentApi = {
  getByDocumentId: async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${documentId}`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return response.json();
  },
};

export const highlightApi = {
  getByDocumentId: async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/api/highlights/${documentId}`);
    if (!response.ok) throw new Error('Failed to fetch highlights');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/highlights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create highlight');
    return response.json();
  },
};