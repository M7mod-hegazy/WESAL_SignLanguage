import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVkegCNgr3wcrZSsLbqnVlEpc0rbRC5OM",
  authDomain: "signlanguage-6c6a5.firebaseapp.com",
  projectId: "signlanguage-6c6a5",
  storageBucket: "signlanguage-6c6a5.firebasestorage.app",
  messagingSenderId: "809834391337",
  appId: "1:809834391337:web:be81c70855f2fcfd7b3938",
  measurementId: "G-DL1KBRPCSQ"
};

// Initialize Firebase
let app;
let auth;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback initialization
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  try {
    storage = getStorage(app);
  } catch (storageError) {
    console.error('Storage initialization error:', storageError);
    storage = null;
  }
}

// Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Auth functions
export const loginWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const loginWithFacebook = () => {
  return signInWithPopup(auth, facebookProvider);
};

export const loginWithTwitter = () => {
  return signInWithPopup(auth, twitterProvider);
};

export const logout = () => {
  return signOut(auth);
};

export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const updateUserProfile = (user, profile) => {
  return updateProfile(user, profile);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Export redirect functions for alternative auth method
export { 
  auth,
  storage,
  signInWithRedirect,
  getRedirectResult 
};
export default app;
