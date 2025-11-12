// Utility function to get the correct profile icon based on user gender
export const getProfileIcon = (gender = 'male') => {
  return gender === 'male' 
    ? '/pages/home_maleIcon.png' 
    : '/pages/home_femaleIcon.png';
};

// Get profile icon with priority: Google photo > Gender-based default
export const getDefaultProfileIcon = (userPhoto, gender = 'male') => {
  // If user has a photo from Google/Firebase, use it
  if (userPhoto) return userPhoto;
  
  // Otherwise, use gender-based default icon
  return getProfileIcon(gender);
};
