import axios from 'axios';
import {
  auth,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginWithFacebook,
  loginWithTwitter,
  logout as firebaseLogout,
  resetPassword,
  onAuthChange,
  updateUserProfile
} from '../config/firebase';
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

// Axios instance with auth token
const api = axios.create({
  baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sync user with backend
const syncUserWithBackend = async (firebaseUser, gender = null) => {
  try {
    const token = await firebaseUser.getIdToken();
    localStorage.setItem('authToken', token);

    const payload = {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      provider: firebaseUser.providerData[0]?.providerId || 'password',
      emailVerified: firebaseUser.emailVerified
    };

    // Add gender if provided (for registration)
    if (gender) {
      payload.gender = gender;
    }

    const response = await axios.post(`${API_URL}/auth/verify`, payload, {
      timeout: 5000 // 5 second timeout
    });

    return response.data;
  } catch (error) {
    console.warn('Backend sync failed, continuing with Firebase auth only:', error.message);
    // Return default data if backend is unavailable
    return {
      success: true,
      user: {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        coins: 100 // Default coins
      },
      message: 'Authenticated with Firebase (backend unavailable)'
    };
  }
};

// Register with email/password
export const register = async (email, password, displayName, gender = 'male') => {
  try {
    const userCredential = await registerWithEmail(email, password);
    const user = userCredential.user;

    // Update display name using Firebase updateProfile
    if (displayName) {
      await updateUserProfile(user, { displayName });
    }

    // Sync with backend (pass gender for registration)
    const backendData = await syncUserWithBackend(user, gender);

    return {
      user,
      backendData
    };
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
};

// Login with email/password
export const login = async (email, password) => {
  try {
    const userCredential = await loginWithEmail(email, password);
    const user = userCredential.user;

    // Sync with backend
    const backendData = await syncUserWithBackend(user);

    return {
      user,
      backendData
    };
  } catch (error) {
    throw error;
  }
};

// Login with Google
export const loginGoogle = async () => {
  try {
    const userCredential = await loginWithGoogle();
    const user = userCredential.user;

    // Sync with backend
    const backendData = await syncUserWithBackend(user);

    return {
      user,
      backendData
    };
  } catch (error) {
    throw error;
  }
};

// Login with Facebook
export const loginFacebook = async () => {
  try {
    const userCredential = await loginWithFacebook();
    const user = userCredential.user;

    // Sync with backend
    const backendData = await syncUserWithBackend(user);

    return {
      user,
      backendData
    };
  } catch (error) {
    throw error;
  }
};

// Login with Twitter
export const loginTwitter = async () => {
  try {
    const userCredential = await loginWithTwitter();
    const user = userCredential.user;

    // Sync with backend
    const backendData = await syncUserWithBackend(user);

    return {
      user,
      backendData
    };
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await firebaseLogout();
    localStorage.removeItem('authToken');
  } catch (error) {
    throw error;
  }
};

// Reset password
export const forgotPassword = async (email) => {
  try {
    await resetPassword(email);
  } catch (error) {
    throw error;
  }
};

// Get current user from backend
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user stats
export const getUserStats = async () => {
  try {
    const response = await api.get('/auth/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete account
export const deleteAccount = async () => {
  try {
    const response = await api.delete('/auth/account');
    await logout();
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthChange(async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('authToken', token);
        callback(firebaseUser);
      } catch (error) {
        console.error('Token refresh error:', error);
        callback(null);
      }
    } else {
      localStorage.removeItem('authToken');
      callback(null);
    }
  });
};

export { api };
