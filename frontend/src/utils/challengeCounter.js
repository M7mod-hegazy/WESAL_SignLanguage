import axios from 'axios';
import { auth } from '../config/firebase';

// Utility functions for tracking challenge progress (MongoDB-backed)

/**
 * Increment the challenges counter for the current user
 * This is called when a user answers a quiz question correctly in solo mode
 * Now uses MongoDB instead of localStorage
 */
export const incrementChallengesCount = async (userId) => {
  if (!userId) return;
  
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    const token = await user.getIdToken();
    const response = await axios.post(
      'http://localhost:8000/api/auth/increment-challenges',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      console.log(`✅ Challenge completed! Total: ${response.data.challengesCompleted}`);
      return response.data.challengesCompleted;
    }
  } catch (error) {
    console.error('Failed to increment challenges:', error);
    // Fallback to localStorage if API fails
    const key = `challenges_${userId}`;
    const currentCount = parseInt(localStorage.getItem(key) || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem(key, newCount.toString());
    return newCount;
  }
};

/**
 * Get the current challenges count for a user
 * Fetched from user profile in MongoDB
 */
export const getChallengesCount = (userProfile) => {
  if (!userProfile) return 0;
  return userProfile.challengesCompleted || 0;
};

/**
 * Reset challenges count (for testing or admin purposes)
 */
export const resetChallengesCount = (userId) => {
  if (!userId) return;
  
  const key = `challenges_${userId}`;
  localStorage.removeItem(key);
  console.log('🔄 Challenges count reset');
};
