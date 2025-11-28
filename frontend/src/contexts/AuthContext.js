import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import guestStorage from '../utils/guestStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(100);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if guest user exists in localStorage first
    const guestUser = guestStorage.getUser();
    if (guestUser) {
      setUser(guestUser);
      setCoins(guestStorage.getCoins());
      setIsGuest(true);
      setLoading(false);
      return;
    }

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set user from Firebase immediately
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          gender: 'male', // Default, will be updated from backend
          isGuest: false,
          getIdToken: () => firebaseUser.getIdToken()
        };
        setUser(userData);
        setIsGuest(false);
        
        try {
          // Try to get user data from backend
          const token = await firebaseUser.getIdToken();
          const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('📥 Backend response:', response.data);
          
          // Update user with backend data including gender
          const backendUser = response.data.user || response.data;
          const userCoins = backendUser.coins ?? 100;
          const userGender = backendUser.gender || 'male';
          const userPhotoURL = backendUser.photoURL || firebaseUser.photoURL;
          
          console.log('💰 Setting coins from backend:', userCoins);
          console.log('👤 Setting gender from backend:', userGender);
          console.log('📸 Setting photoURL from backend:', userPhotoURL);
          
          setCoins(userCoins);
          setUser({
            ...userData,
            gender: userGender,
            photoURL: userPhotoURL // Ensure photoURL is updated from backend
          });
        } catch (error) {
          console.log('⚠️ تعذر الاتصال بالخادم، سيتم استخدام البيانات الافتراضية');
          // Keep default values if backend fails
          setCoins(100);
        }
      } else {
        setUser(null);
        setCoins(100);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateCoins = async (newCoins) => {
    console.log('💰 updateCoins called:', newCoins);
    setCoins(newCoins);
    
    // For guest users, save to localStorage
    if (user?.isGuest) {
      guestStorage.setCoins(newCoins);
      return;
    }
    
    // Save to backend for registered users
    if (user && user.getIdToken) {
      try {
        const token = await user.getIdToken();
        console.log('📤 Sending coins to backend:', newCoins);
        const response = await axios.post(`${API_BASE_URL}/auth/update-coins`, 
          { coins: newCoins },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Coins updated in backend:', response.data);
      } catch (error) {
        console.log('⚠️ تم حفظ العملات محلياً، سيتم المزامنة لاحقاً');
        // Continue even if backend update fails
      }
    }
  };

  const addCoins = async (amount) => {
    const newCoins = coins + amount;
    console.log('➕ Adding coins:', amount, 'New total:', newCoins);
    await updateCoins(newCoins);
  };

  const subtractCoins = async (amount) => {
    if (coins < amount) {
      console.warn('⚠️ Cannot subtract', amount, 'coins. Current balance:', coins);
      return false;
    }
    const newCoins = Math.max(0, coins - amount);
    console.log('➖ Subtracting coins:', amount, 'New total:', newCoins);
    await updateCoins(newCoins);
    return true;
  };

  const loginAsGuest = () => {
    const guestUser = guestStorage.createGuest();
    setUser(guestUser);
    setCoins(100);
    setIsGuest(true);
  };

  const logoutGuest = () => {
    guestStorage.clearGuest();
    setUser(null);
    setCoins(100);
    setIsGuest(false);
  };

  const value = {
    user,
    coins,
    loading,
    isGuest,
    updateCoins,
    addCoins,
    subtractCoins,
    loginAsGuest,
    logoutGuest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
