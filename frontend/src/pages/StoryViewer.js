import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import theme from '../theme/designSystem';

const StoryViewer = ({ storyGroup, allStoryGroups, initialGroupIndex, onClose, onStoryDeleted }) => {
  const { user } = useAuth();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const currentGroup = allStoryGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories?.[currentStoryIndex];

  // Load like state from localStorage
  useEffect(() => {
    if (!currentStory) return;
    const userId = user?.uid || 'guest';
    const storyLikes = JSON.parse(localStorage.getItem(`storyLikes_${userId}`) || '[]');
    setIsLiked(storyLikes.includes(currentStory?.id));
  }, [currentStory, user]);

  const handleLike = async () => {
    if (!user) return;
    
    const userId = user?.uid || 'guest';
    const storyLikes = JSON.parse(localStorage.getItem(`storyLikes_${userId}`) || '[]');
    const newLikedState = !isLiked;
    
    // Update UI immediately
    if (isLiked) {
      // Unlike
      const index = storyLikes.indexOf(currentStory.id);
      if (index > -1) {
        storyLikes.splice(index, 1);
      }
      setIsLiked(false);
    } else {
      // Like
      if (!storyLikes.includes(currentStory.id)) {
        storyLikes.push(currentStory.id);
      }
      setIsLiked(true);
    }
    
    // Save to localStorage
    localStorage.setItem(`storyLikes_${userId}`, JSON.stringify(storyLikes));
    
    // Also update story in localStorage
    const localStories = JSON.parse(localStorage.getItem('userStories') || '[]');
    const updatedStories = localStories.map(story => {
      if (story.id === currentStory.id) {
        return {
          ...story,
          likes: newLikedState ? (story.likes || 0) + 1 : Math.max(0, (story.likes || 0) - 1)
        };
      }
      return story;
    });
    localStorage.setItem('userStories', JSON.stringify(updatedStories));
    
    // Try to sync with MongoDB if it's a MongoDB story
    const isMongoStory = /^[0-9a-fA-F]{24}$/.test(currentStory.id);
    if (isMongoStory) {
      try {
        const token = await user.getIdToken();
        await axios.post(
          `http://localhost:8000/api/stories/${currentStory.id}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` }, timeout: 2000 }
        );
        console.log('✅ Story like synced to MongoDB');
      } catch (error) {
        console.log('⚠️ Failed to sync story like to MongoDB, saved locally');
      }
    }
  };

  const handleNext = () => {
    // Move to next story in current group
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } 
    // Move to next group
    else if (currentGroupIndex < allStoryGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } 
    // Close viewer
    else {
      onClose();
    }
  };

  const handlePrevious = () => {
    // Move to previous story in current group
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    }
    // Move to previous group
    else if (currentGroupIndex > 0) {
      const prevGroup = allStoryGroups[currentGroupIndex - 1];
      setCurrentGroupIndex(currentGroupIndex - 1);
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  };

  const handleDeleteStory = async () => {
    if (!user || !window.confirm('هل تريد حذف هذه القصة؟')) return;

    try {
      const token = await user.getIdToken();
      const response = await axios.delete(
        `http://localhost:8000/api/stories/${currentStory.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onStoryDeleted && onStoryDeleted();
        
        // If this was the last story in the group, close viewer
        if (currentGroup.stories.length === 1) {
          onClose();
        } else {
          // Move to next story or previous
          handleNext();
        }
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('فشل حذف القصة');
    }
  };

  // Auto-progress timer (7 seconds per story)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 0.5; // Increment by 0.5% every 35ms = 7 seconds total
      });
    }, 35);

    return () => clearInterval(interval);
  }, [currentStoryIndex, currentGroupIndex, isPaused]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentStoryIndex, currentGroupIndex]);

  const handleClose = () => {
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Story Container */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        height: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Progress Bars */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '10px 15px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10
        }}>
          {currentGroup.stories.map((_, index) => (
            <div key={index} style={{
              flex: 1,
              height: '3px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'white',
                width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? `${progress}%` : '0%',
                transition: 'width 0.1s linear'
              }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: 0,
          right: 0,
          padding: '0 15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div>
              <div style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: theme.typography.fonts.primary
              }}>{currentStory.author?.name || 'مستخدم'}</div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '12px',
                fontFamily: theme.typography.fonts.secondary
              }}>
                {(() => {
                  const storyDate = new Date(currentStory.createdAt);
                  const now = new Date();
                  const diffMs = now - storyDate;
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);
                  
                  if (diffMins < 1) return 'الآن';
                  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
                  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
                  return `منذ ${diffDays} يوم`;
                })()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Delete Button (only for story owner) */}
            {user && currentStory.author?.name === (user.displayName || user.email?.split('@')[0]) && (
              <button
                onClick={handleDeleteStory}
                style={{
                  background: 'rgba(255, 68, 68, 0.9)',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontFamily: theme.typography.fonts.secondary,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#ff0000'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.9)'}
              >
                حذف
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                cursor: 'pointer',
                padding: '5px',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Story Media */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '80px 20px 20px'
        }}>
          {currentStory.media?.url ? (
            currentStory.media.type === 'image' ? (
              <img 
                src={currentStory.media.url}
                alt="Story"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  console.error('Story image failed to load:', currentStory.media.url);
                  e.target.style.display = 'none';
                }}
                onLoad={() => console.log('Story image loaded successfully')}
              />
            ) : (
              <video 
                src={currentStory.media.url}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            )
          ) : (
            <div style={{
              color: 'white',
              fontSize: '16px',
              fontFamily: theme.typography.fonts.secondary,
              textAlign: 'center'
            }}>
              لا توجد وسائط للعرض
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={handleLike}
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '20px',
              background: isLiked ? '#F18A21' : 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{
              fontSize: '24px',
              color: isLiked ? 'white' : '#F18A21'
            }}>❤</span>
          </button>

          {/* Caption */}
          {currentStory.caption && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '15px',
              right: '15px',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '10px 15px',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontFamily: theme.typography.fonts.secondary,
              textAlign: 'center'
            }}>
              {currentStory.caption}
            </div>
          )}
        </div>

        {/* Navigation Areas */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '30%',
          cursor: 'pointer',
          zIndex: 5
        }}
        onClick={handlePrevious}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '70%',
          cursor: 'pointer',
          zIndex: 5
        }}
        onClick={handleNext}
        />
      </div>
    </div>
  );
};

export default StoryViewer;
