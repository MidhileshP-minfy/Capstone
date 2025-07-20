import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCbosS3nNIeVB2Ao77PxGPfW0Nf4fvr6Bg",
  authDomain: "docc-trial.firebaseapp.com",
  projectId: "docc-trial",
  storageBucket: "docc-trial.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:0987654321"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;