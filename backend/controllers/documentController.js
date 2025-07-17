import { db } from '../config/firebase.js';

// Get all documents a user is a member of
export const getAllDocuments = async (req, res) => {
  try {
    const userId = req.user.uid;
    const docsRef = db.collection('docs');
    
    // Query for documents where the user's ID is in the 'members' array
    const snapshot = await docsRef
      .where('members', 'array-contains', userId)
      .orderBy('updatedAt', 'desc')
      .get();
    
    const documents = [];
    snapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// Get a specific document if the user has any role
export const getDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const docId = req.params.id;
    const docRef = db.collection('docs').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const data = doc.data();
    
    // Check if user has any role in the document
    if (!data.roles?.[userId]) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

// Create a new document, assigning the creator as admin
export const createDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, content } = req.body;
    
    const docData = {
      title: title || 'Untitled Document',
      content: content || [{ type: "paragraph", content: "Start writing..." }],
      // Assign the creator as admin and add them to the members list
      roles: {
        [userId]: 'admin',
      },
      members: [userId],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('docs').add(docData);
    
    res.status(201).json({
      id: docRef.id,
      ...docData,
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
};

// Update a document based on user's role
export const updateDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const docId = req.params.id;
    // The request body can now contain title, content, or a new roles object
    const { title, content, roles } = req.body;
    
    const docRef = db.collection('docs').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const docData = doc.data();
    const userRole = docData.roles?.[userId];

    // Deny access if user has no role
    if (!userRole) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updateData = {
      updatedAt: new Date(),
    };
    
    // Only an admin can update the roles
    if (roles) {
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can change roles.' });
      }
      updateData.roles = roles;
      // Also update the members array to keep it in sync with the new roles
      updateData.members = Object.keys(roles);
    }
    
    // Editors and Admins can update the title and content
    if (title !== undefined || content !== undefined) {
      if (userRole === 'viewer') {
        return res.status(403).json({ error: 'Viewers cannot edit the document.' });
      }
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
    }

    await docRef.update(updateData);

    res.json({ message: 'Document updated successfully' });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
};

// Delete a document, only if the user is an admin
export const deleteDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const docId = req.params.id;
    
    const docRef = db.collection('docs').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user is an admin for this document
    const userRole = doc.data().roles?.[userId];
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete this document' });
    }
    
    await docRef.delete();
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};