import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount={
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
})

export const db = admin.firestore();
export const auth = admin.auth();

export default {admin}