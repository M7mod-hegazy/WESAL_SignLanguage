// Utility function to get the correct profile icon based on user gender
export const getProfileIcon = (gender = 'male') => {
  return gender === 'male' 
    ? '/pages/home_maleIcon.png' 
    : '/pages/home_femaleIcon.png';
};

// Proxy Google images through a CDN to avoid rate limiting
export const proxyGoogleImage = (googleImageUrl) => {
  if (!googleImageUrl) return null;
  
  // Use weserv.nl as a free image proxy service
  // This caches and serves Google images without rate limiting
  try {
    // Using weserv.nl proxy with no-cache parameter to get fresh image
    return `https://images.weserv.nl/?url=${encodeURIComponent(googleImageUrl)}&n=-1`;
  } catch (error) {
    console.error('Error creating proxy URL:', error);
    return googleImageUrl; // Fallback to original URL
  }
};

// Get profile icon with priority: Google photo (via proxy) > Gender-based default
export const getDefaultProfileIcon = (userPhoto, gender = 'male') => {
  // If user has a photo from Google/Firebase, use it via proxy
  if (userPhoto && userPhoto.trim()) {
    // Check if it's a valid URL (not empty or placeholder)
    if (userPhoto.startsWith('http') || userPhoto.startsWith('data:')) {
      // If it's a Google image, proxy it to avoid rate limiting
      if (userPhoto.includes('lh3.googleusercontent.com') || userPhoto.includes('googleusercontent.com')) {
        return proxyGoogleImage(userPhoto);
      }
      return userPhoto;
    }
  }
  
  // Otherwise, use gender-based default icon
  return getProfileIcon(gender);
};
