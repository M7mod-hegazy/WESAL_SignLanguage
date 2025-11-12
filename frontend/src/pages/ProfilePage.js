import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import theme from '../theme/designSystem';
import BottomNav from '../components/BottomNav';
import EditProfilePage from './EditProfilePage';
import { getDefaultProfileIcon } from '../utils/getProfileIcon';
import { getChallengesCount } from '../utils/challengeCounter';

const ProfilePage = ({ onBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('likes'); // likes, saved, posts
  const [savedPosts, setSavedPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]); // User's own posts (نشر)
  const [sharedPosts, setSharedPosts] = useState([]); // Keep for compatibility
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [stats, setStats] = useState({
    savedCount: 0,
    postsCount: 0, // User's own posts (نشر)
    challengesCount: 0
  });

  // Level system based on activity (easier at start, harder later)
  const calculateLevel = () => {
    const totalActivity = stats.savedCount + stats.postsCount + stats.challengesCount;
    // Level 1: 0-4 activities (easy - 5 activities)
    // Level 2: 5-14 activities (medium - 10 activities)
    // Level 3: 15-29 activities (harder - 15 activities)
    // Level 4: 30-54 activities (hard - 25 activities)
    // Level 5: 55+ activities (expert - 55+ activities)
    
    if (totalActivity >= 55) return { level: 5, name: 'خبير', cup: '🏆', nextLevel: 55, currentThreshold: 55 };
    if (totalActivity >= 30) return { level: 4, name: 'محترف', cup: '🥇', nextLevel: 55, currentThreshold: 30 };
    if (totalActivity >= 15) return { level: 3, name: 'متقدم', cup: '🥈', nextLevel: 30, currentThreshold: 15 };
    if (totalActivity >= 5) return { level: 2, name: 'مبتدئ', cup: '🥉', nextLevel: 15, currentThreshold: 5 };
    return { level: 1, name: 'جديد', cup: '🏅', nextLevel: 5, currentThreshold: 0 };
  };

  const levelInfo = calculateLevel();
  const totalActivity = stats.savedCount + stats.postsCount + stats.challengesCount;
  
  // Calculate progress to next level
  const progressToNextLevel = totalActivity - levelInfo.currentThreshold;
  const activitiesNeededForNextLevel = levelInfo.nextLevel - levelInfo.currentThreshold;
  const progressPercentage = levelInfo.level === 5 
    ? 100 
    : (progressToNextLevel / activitiesNeededForNextLevel) * 100;

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      
      // Fetch user profile to get challengesCompleted and likedStories
      const userProfileResponse = await axios.get('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userProfile = userProfileResponse.data.user || {};
      
      // Fetch ALL posts (no pagination limit for accurate counts)
      const postsResponse = await axios.get('http://localhost:8000/api/posts?limit=1000', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch shared posts from MongoDB
      const sharedPostsResponse = await axios.get('http://localhost:8000/api/shared-posts?limit=1000', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (postsResponse.data.success) {
        const backendPosts = postsResponse.data.posts;
        
        // Get shared posts from MongoDB (not localStorage anymore)
        const sharedPostsData = sharedPostsResponse.data.success ? sharedPostsResponse.data.sharedPosts : [];
        
        // Combine backend posts with shared posts for complete data
        const allPosts = [...backendPosts, ...sharedPostsData];
        
        console.log('🔍 Total posts:', allPosts.length);
        console.log('🔍 User UID:', user.uid);
        console.log('🔍 User Profile ID:', userProfile.id);
        console.log('🔍 Sample post FULL:', JSON.stringify(allPosts[0], null, 2));
        console.log('🔍 Post author:', allPosts[0]?.author);
        console.log('🔍 Post saves:', allPosts[0]?.saves);
        console.log('🔍 Post isSaved:', allPosts[0]?.isSaved);
        
        // Get liked posts (from BOTH backend and shared posts)
        const liked = allPosts.filter(post => post.isLiked === true);
        
        // Get liked stories from MongoDB user profile
        const userLikedStories = userProfile.likedStories || [];
        
        // Combine posts and stories for display
        setLikedPosts([...liked, ...userLikedStories.map(id => ({ id, type: 'story' }))]);
        console.log('❤️ Liked content:', liked.length, 'posts +', userLikedStories.length, 'stories (from MongoDB)');

        // Get saved posts - Use savedPosts array from user profile
        const userSavedPostIds = userProfile.savedPosts || [];
        console.log('💾 User saved post IDs from profile:', userSavedPostIds);
        
        // Also check if posts have saveCount or were saved in community page
        const saved = allPosts.filter(post => {
          // Method 1: Check user profile's savedPosts array
          if (userSavedPostIds.includes(post.id) || userSavedPostIds.includes(post._id)) {
            return true;
          }
          // Method 2: Check if post has saves array with user ID
          if (post.saves && Array.isArray(post.saves)) {
            return post.saves.some(saveId => 
              saveId === userProfile.id || 
              saveId.toString() === userProfile.id
            );
          }
          // Method 3: Check saveCount (if user saved it, it should be > 0)
          // This is a fallback - we'll check localStorage for this user's saves
          const localSaves = JSON.parse(localStorage.getItem('userSavedPosts') || '[]');
          if (localSaves.includes(post.id)) {
            return true;
          }
          return false;
        });
        setSavedPosts(saved);
        console.log('💾 Saved posts:', saved.length);
        console.log('💾 Sample saved post:', saved[0]);

        // Get user's shared posts
        const userSharedPosts = sharedPostsData.filter(post => 
          post.sharedBy?.id === userProfile.id ||
          post.sharedBy?.name === (user?.displayName || user?.email?.split('@')[0])
        );
        setSharedPosts(userSharedPosts);
        console.log('🔁 User shared posts:', userSharedPosts.length);

        // Get user's own posts (posts created by this user)
        // Check if author.id matches userProfile.id (MongoDB ID)
        const userOwnPosts = backendPosts.filter(post => {
          const authorMatch = post.author?.id === userProfile.id || 
                             post.author?._id === userProfile.id;
          if (authorMatch) {
            console.log('✅ Found user post:', post.id, 'by', post.author?.name);
          }
          return authorMatch;
        });
        setUserPosts(userOwnPosts); // Set for display in نشر tab
        console.log('📝 User own posts (نشر):', userOwnPosts.length);

        // Get challenges count from MongoDB user profile
        console.log('🔍 User Profile:', userProfile);
        console.log('🔍 challengesCompleted from profile:', userProfile.challengesCompleted);
        const challengesCount = getChallengesCount(userProfile);
        console.log('🔍 Calculated challenges count:', challengesCount);

        // Calculate stats
        setStats({
          savedCount: saved.length,
          postsCount: userOwnPosts.length, // User's own posts
          challengesCount: challengesCount // From MongoDB
        });

        console.log('📊 Stats:', {
          saved: saved.length,
          shares: userSharedPosts.length,
          challenges: challengesCount,
          totalPosts: allPosts.length
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSaveProfile = async (updatedData) => {
    // Handle profile update here
    console.log('Saving profile:', updatedData);
    setShowEditProfile(false);
    
    // Refresh user data after save
    await fetchUserData();
    
    // Force component re-render with fresh user data
    window.location.reload();
  };

  // Show edit profile page if requested
  if (showEditProfile) {
    return (
      <EditProfilePage 
        onBack={() => setShowEditProfile(false)}
        onSave={handleSaveProfile}
      />
    );
  }

  const renderPostCard = (post) => {
    const mediaUrl = post.media && post.media.length > 0 
      ? (typeof post.media[0] === 'string' ? post.media[0] : post.media[0]?.url)
      : null;

    return (
      <div
        key={post.id}
        style={{
          background: '#FFE8CC',
          borderRadius: '20px',
          padding: '15px',
          marginBottom: '15px',
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}
      >
        {/* Post Thumbnail */}
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '15px',
          background: mediaUrl ? 'transparent' : theme.colors.primary.orange,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          {mediaUrl ? (
            <img 
              src={mediaUrl}
              alt="Post"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          )}
        </div>

        {/* Post Content - Real Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px',
            color: theme.colors.primary.blue,
            fontFamily: theme.typography.fonts.secondary,
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.4'
          }}>
            {post.content || 'منشور'}
          </div>
        </div>

        {/* Action Icons - Show based on current tab */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Like Icon - Only in likes tab */}
          {activeTab === 'likes' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill={theme.colors.primary.orange}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          )}

          {/* Save Icon - Only in saved tab */}
          {activeTab === 'saved' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill={theme.colors.primary.orange}>
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
          )}

          {/* Share Icon - Only in shares tab */}
          {activeTab === 'shares' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" fill={theme.colors.primary.orange}/>
              <circle cx="6" cy="12" r="3" fill={theme.colors.primary.orange}/>
              <circle cx="18" cy="19" r="3" fill={theme.colors.primary.orange}/>
              <line x1="8.5" y1="13" x2="15.5" y2="18" stroke={theme.colors.primary.orange} strokeWidth="2"/>
              <line x1="8.5" y1="11" x2="15.5" y2="6" stroke={theme.colors.primary.orange} strokeWidth="2"/>
            </svg>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF9F0',
      fontFamily: theme.typography.fonts.secondary,
      direction: 'rtl',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        background: '#FFF9F0',
        position: 'relative',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 20px'
      }}>
        {/* Back Button */}
        <button
          onClick={() => onBack ? onBack() : navigate(-1)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            zIndex: 10
          }}
        >
          <img 
            src="/pages/back.png"
            alt="Back"
            style={{
              width: '24px',
              height: '24px'
            }}
          />
        </button>

      {/* Content Container */}
      <div style={{
        padding: '20px'
      }}>
      
      {/* Profile Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '30px',
        marginTop: '20px',
        position: 'relative'
      }}>
        {/* User Avatar */}
        <div style={{
          marginBottom: '15px'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: '#FFE8CC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img 
              src={(() => {
                const photoSrc = getDefaultProfileIcon(user?.photoURL, user?.gender);
                console.log('🖼️ Profile photo source:', photoSrc);
                console.log('👤 User photoURL:', user?.photoURL);
                console.log('👤 User gender:', user?.gender);
                return photoSrc;
              })()} 
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                console.error('❌ Image failed to load:', e.target.src);
                e.target.src = getDefaultProfileIcon(null, user?.gender);
              }}
            />
          </div>
        </div>

        {/* Edit Button - Outside Avatar */}
        <button 
          onClick={() => setShowEditProfile(true)}
          style={{
          position: 'absolute',
          top: '95px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '0'
        }}>
          <img 
            src="/pages/ProfilePage/EDIT.png"
            alt="Edit"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </button>

        {/* Username */}
        <h2 style={{
          fontSize: '20px',
          color: theme.colors.primary.orange,
          fontFamily: theme.typography.fonts.primary,
          fontWeight: theme.typography.weights.bold,
          marginBottom: '15px'
        }}>
          {user?.displayName || user?.email?.split('@')[0] || 'اسم المستخدم'}
        </h2>

        {/* Level Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '40px',
          marginBottom: '15px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '28px' }}>{levelInfo.cup}</span>
            <span style={{
              fontSize: '16px',
              color: theme.colors.primary.orange,
              fontWeight: 'bold',
              fontFamily: theme.typography.fonts.primary
            }}>
              {levelInfo.name}
            </span>
          </div>

          <div style={{
            fontSize: '14px',
            color: '#999',
            fontFamily: theme.typography.fonts.secondary
          }}>
            المستوى {levelInfo.level}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '200px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          direction: 'ltr'
        }}>
          <span style={{
            fontSize: '12px',
            color: theme.colors.primary.orange,
            fontWeight: 'bold'
          }}>
            التقدم
          </span>
          <div style={{
            flex: 1,
            height: '8px',
            background: '#FFE8CC',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: theme.colors.primary.orange,
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: '25px',
        gap: '10px'
      }}>
        {/* Saved Count (قائمتي) */}
        <div style={{
          flex: 1,
          background: '#FFF9F0',
          borderRadius: '20px',
          padding: '20px 15px',
          textAlign: 'center'
        }}>
          <img 
            src="/pages/ProfilePage/posts.png"
            alt="قائمتي"
            style={{
              width: '40px',
              height: '40px',
              marginBottom: '8px',
              objectFit: 'contain'
            }}
          />
          <div style={{
            fontSize: '20px',
            color: theme.colors.primary.orange,
            fontWeight: 'bold',
            marginBottom: '3px'
          }}>
            {stats.savedCount}
          </div>
          <div style={{
            fontSize: '12px',
            color: theme.colors.primary.orange
          }}>
            قائمتي
          </div>
        </div>

        {/* Shares Count (نشر) */}
        <div style={{
          flex: 1,
          background: '#FFF9F0',
          borderRadius: '20px',
          padding: '20px 15px',
          textAlign: 'center'
        }}>
          <img 
            src="/pages/ProfilePage/share.png"
            style={{
              width: '40px',
              height: '40px',
              marginBottom: '8px',
              objectFit: 'contain'
            }}
          />
          <div style={{
            fontSize: '20px',
            color: theme.colors.primary.orange,
            fontWeight: 'bold',
            marginBottom: '3px'
          }}>
            {stats.postsCount}
          </div>
          <div style={{
            fontSize: '12px',
            color: theme.colors.primary.orange
          }}>
            نشر
          </div>
        </div>

        {/* Challenges Count (التحديات) */}
        <div style={{
          flex: 1,
          background: '#FFF9F0',
          borderRadius: '20px',
          padding: '20px 15px',
          textAlign: 'center'
        }}>
          <img 
            src="/pages/ProfilePage/challenges.png"
            alt="التحديات"
            style={{
              width: '40px',
              height: '40px',
              marginBottom: '8px',
              objectFit: 'contain'
            }}
          />
          <div style={{
            fontSize: '20px',
            color: theme.colors.primary.orange,
            fontWeight: 'bold',
            marginBottom: '3px'
          }}>
            {stats.challengesCount}
          </div>
          <div style={{
            fontSize: '12px',
            color: theme.colors.primary.orange
          }}>
            التحديات
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        background: '#FFE8CC',
        borderRadius: '15px',
        padding: '5px'
      }}>
        <button
          onClick={() => setActiveTab('likes')}
          style={{
            flex: 1,
            padding: '10px',
            background: 'transparent',
            color: theme.colors.primary.orange,
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: theme.typography.fonts.secondary,
            fontWeight: activeTab === 'likes' ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          الإعجاب
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          style={{
            flex: 1,
            padding: '10px',
            background: 'transparent',
            color: theme.colors.primary.orange,
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: theme.typography.fonts.secondary,
            fontWeight: activeTab === 'saved' ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          قائمتي
        </button>
        <button
          onClick={() => setActiveTab('shares')}
          style={{
            flex: 1,
            padding: '10px',
            background: 'transparent',
            color: theme.colors.primary.orange,
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: theme.typography.fonts.secondary,
            fontWeight: activeTab === 'shares' ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          نشر
        </button>
      </div>

      {/* Posts List */}
      <div>
        {/* Liked Posts */}
        {activeTab === 'likes' && (
          <div>
            {console.log('Displaying liked posts:', likedPosts)}
            {likedPosts.length > 0 ? (
              likedPosts.map(post => renderPostCard(post))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#999',
                fontFamily: theme.typography.fonts.secondary
              }}>
                لا توجد منشورات معجب بها
              </div>
            )}
          </div>
        )}

        {/* Saved Posts (قائمتي) */}
        {activeTab === 'saved' && (
          <div>
            {console.log('Displaying saved posts:', savedPosts)}
            {savedPosts.length > 0 ? (
              savedPosts.map(post => renderPostCard(post))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#999',
                fontFamily: theme.typography.fonts.secondary
              }}>
                لا توجد منشورات محفوظة
              </div>
            )}
          </div>
        )}

        {/* User's Own Posts (نشر) */}
        {activeTab === 'shares' && (
          <div>
            {userPosts.length > 0 ? (
              userPosts.map(post => renderPostCard(post))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#999',
                fontFamily: theme.typography.fonts.secondary
              }}>
                لم تقم بنشر أي منشورات بعد
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      </div>
    </div>
  );
};

export default ProfilePage;
