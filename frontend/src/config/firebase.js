import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8za3ZI4m9gUrYsueUum907vpuKzV8H0Q",
  authDomain: "iiuc25.firebaseapp.com",
  projectId: "iiuc25",
  storageBucket: "iiuc25.firebasestorage.app",
  messagingSenderId: "75690391713",
  appId: "1:75690391713:web:4c72c5316547c8bc68d8e0",
  measurementId: "G-82V42TWJ9J"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
