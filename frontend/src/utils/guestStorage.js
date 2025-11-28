// Guest storage utility for managing guest user data in localStorage

const GUEST_PREFIX = 'wesal_guest_';

export const guestStorage = {
  // Get guest coins
  getCoins: () => {
    const coins = localStorage.getItem(`${GUEST_PREFIX}coins`);
    return coins ? parseInt(coins, 10) : 100; // Default 100 coins
  },

  // Set guest coins
  setCoins: (coins) => {
    localStorage.setItem(`${GUEST_PREFIX}coins`, coins.toString());
  },

  // Get guest user object
  getUser: () => {
    const user = localStorage.getItem(`${GUEST_PREFIX}user`);
    return user ? JSON.parse(user) : null;
  },

  // Set guest user object
  setUser: (user) => {
    localStorage.setItem(`${GUEST_PREFIX}user`, JSON.stringify(user));
  },

  // Check if guest exists
  hasGuest: () => {
    return localStorage.getItem(`${GUEST_PREFIX}user`) !== null;
  },

  // Clear all guest data
  clearGuest: () => {
    localStorage.removeItem(`${GUEST_PREFIX}user`);
    localStorage.removeItem(`${GUEST_PREFIX}coins`);
  },

  // Create new guest user
  createGuest: () => {
    const guestUser = {
      uid: `guest_${Date.now()}`,
      displayName: 'ضيف',
      email: null,
      isGuest: true,
      createdAt: new Date().toISOString()
    };
    guestStorage.setUser(guestUser);
    guestStorage.setCoins(100);
    return guestUser;
  }
};

export default guestStorage;
