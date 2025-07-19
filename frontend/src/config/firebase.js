import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:"AIzaSyCbosS3nNIeVB2Ao77PxGPfW0Nf4fvr6Bg",
  authDomain:"docc-trial.firebaseapp.com",
  projectId:"docc-trial",
  storageBucket:"docc-trial.firebasestorage.app",
  messagingSenderId:"1064852195122",
  appId:"1:1064852195122:web:aaecfb0c87f53c01feb92b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;