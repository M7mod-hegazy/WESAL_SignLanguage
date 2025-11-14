import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import theme from '../theme/designSystem';
import { API_BASE_URL } from '../config/api';
import { getDefaultProfileIcon } from '../utils/getProfileIcon';
import CreatePostModal from './CreatePostModal';
import CreateStoryModal from './CreateStoryModal';
import StoryViewer from './StoryViewer';

const CommunityPage = ({ onBack, onHome, onNotifications, onCreatePost, onCreateStory }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [viewingStory, setViewingStory] = useState(null);
  const [showPostMenu, setShowPostMenu] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editMedia, setEditMedia] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Helper function to get user profile stats (for profile page)
  const getUserProfileStats = useCallback(() => {
    const userId = user?.uid || 'guest';
    const userLikes = JSON.parse(localStorage.getItem(`userLikes_${userId}`) || '[]');
    const userSaves = JSON.parse(localStorage.getItem(`userSaves_${userId}`) || '[]');
    const userShares = JSON.parse(localStorage.getItem(`userShares_${userId}`) || '[]');
    const storyLikes = JSON.parse(localStorage.getItem(`storyLikes_${userId}`) || '[]');
    
    // Get full post details for liked/saved/shared posts
    const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    
    const likedPosts = allPosts.filter(post => userLikes.includes(post.id));
    const savedPosts = allPosts.filter(post => userSaves.includes(post.id));
    const sharedPosts = allPosts.filter(post => userShares.includes(post.id));
    
    return {
      likedPosts,
      savedPosts,
      sharedPosts,
      storyLikes,
      stats: {
        totalLikes: userLikes.length,
        totalSaves: userSaves.length,
        totalShares: userShares.length,
        totalStoryLikes: storyLikes.length
      }
    };
  }, [user]);
  
  // Expose getUserProfileStats globally for profile page
  useEffect(() => {
    if (window) {
    }
  }, [getUserProfileStats, user]);



  const fetchPosts = useCallback(async () => {
    const startTime = performance.now();
    setPostsLoading(true);
    try {
      // Get auth token if user is logged in
      const headers = {};
      if (user) {
        const tokenStart = performance.now();
        const token = await user.getIdToken();
        console.log(`⏱️ [FRONTEND] Token fetch: ${(performance.now() - tokenStart).toFixed(0)}ms`);
        headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('📡 [FRONTEND] Fetching posts from MongoDB...');
      const fetchStart = performance.now();
      const response = await axios.get(`${API_BASE_URL}/posts?page=1&limit=3`, { 
        headers,
        timeout: 15000 // 15 second timeout for MongoDB connection
      });
      
      const fetchTime = performance.now() - fetchStart;
      console.log(`⏱️ [FRONTEND] API call took: ${fetchTime.toFixed(0)}ms`);
      console.log('📥 Response:', response.data);
      console.log('🐛 Backend timing:', response.data._debug);
      
      if (response.data.success && response.data.posts) {
        console.log('✅ Loaded', response.data.posts.length, 'posts from MongoDB');
        
        // Use MongoDB posts directly - no localStorage
        setPosts(response.data.posts);
        
        setHasMore(response.data.pagination?.pages > 1);
        setLoading(false);
        setPostsLoading(false);
      } else {
        console.log('⚠️ No posts returned from MongoDB');
        setPosts([]);
        setLoading(false);
        setPostsLoading(false);
      }
    } catch (error) {
      console.error('❌ Error fetching posts:', error.message);
      console.warn('⚠️ MongoDB timeout - showing empty feed. Please run: node scripts/clearPosts.js');
      setPostsLoading(false);
      
      // Show empty feed - no localStorage fallback
      setPosts([]);
      setLoading(false);
      setPostsLoading(false);
    }
    
    const totalTime = performance.now() - startTime;
    console.log(`🎯 [FRONTEND] Total fetchPosts time: ${totalTime.toFixed(0)}ms`);
  }, [user]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      // Get auth token if user is logged in
      const headers = {};
      if (user) {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }
      
      const nextPage = page + 1;
      const response = await axios.get(`${API_BASE_URL}/posts?page=${nextPage}&limit=10`, { 
        headers,
        timeout: 1000 // 1 second timeout
      });
      
      if (response.data.success && response.data.posts.length > 0) {
        // Get current user's shared post IDs from global storage
        const savedSharedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
        const currentUserName = user?.displayName || user?.email?.split('@')[0];
        const userSharedPostIds = savedSharedPosts
          .filter(post => post.sharedBy?.name === currentUserName)
          .map(post => post.originalPostId || post.id);
        
        // Mark new posts
        const newPosts = response.data.posts.map(post => ({
          ...post,
          isSharedByCurrentUser: userSharedPostIds.includes(post.id)
        }));
        
        // Append new posts
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setPage(nextPage);
        setHasMore(response.data.pagination?.page < response.data.pagination?.pages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      // Backend unavailable - disable infinite scroll
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, user, posts, page]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = (e) => {
      const container = e.target;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      // Load more when user scrolls to bottom (with 200px threshold)
      if (scrollHeight - scrollTop - clientHeight < 200 && !loadingMore && hasMore) {
        loadMorePosts();
      }
    };

    const container = document.querySelector('[data-community-scroll]');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loadingMore, hasMore, loadMorePosts]);

  const fetchStories = useCallback(async () => {
    // Load stories from MongoDB
    try {
      const response = await axios.get(`${API_BASE_URL}/stories`, {
        timeout: 10000
      });
      
      if (response.data.success && response.data.storyGroups) {
        console.log('✅ Loaded', response.data.storyGroups.length, 'story groups from MongoDB');
        
        // Hydrate story images from localStorage
        const hydratedStoryGroups = response.data.storyGroups.map(group => ({
          ...group,
          stories: group.stories.map(story => {
            // Check if media URL is a localStorage reference
            if (story.media?.url && story.media.url.startsWith('story_')) {
              const base64Image = localStorage.getItem(story.media.url);
              if (base64Image) {
                return {
                  ...story,
                  media: {
                    ...story.media,
                    url: base64Image // Replace ID with actual base64
                  }
                };
              }
            }
            return story;
          })
        }));
        
        setStories(hydratedStoryGroups);
      }
    } catch (error) {
      // Silently continue with empty stories - app works in offline mode
    }
  }, []);

  // Load posts and stories on component mount
  useEffect(() => {
    setLoading(true);
    fetchPosts();
    fetchStories();
  }, [fetchPosts, fetchStories]);

  const handleLike = async (postId) => {
    if (!user) return;
    
    // Optimistic UI update
    const currentPost = posts.find(p => p.id === postId);
    const newLikedState = !currentPost?.isLiked;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const currentCount = post.likeCount || 0;
        return {
          ...post,
          isLiked: newLikedState,
          likeCount: newLikedState ? currentCount + 1 : Math.max(0, currentCount - 1)
        };
      }
      return post;
    }));
    
    // Extract original post ID if this is a shared post
    let actualPostId = postId;
    if (postId.startsWith('shared_')) {
      // Format: shared_timestamp_originalId
      const parts = postId.split('_');
      actualPostId = parts[parts.length - 1]; // Get the last part (original ID)
    }
    
    // Check if this is a MongoDB post (valid ObjectId) or localStorage post
    const isMongoPost = /^[0-9a-fA-F]{24}$/.test(actualPostId);
    
    if (!isMongoPost) {
      console.log('⚠️ Local-only post, saving to localStorage');
      // Save to localStorage for persistence
      const savedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
      const updatedPosts = savedPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likeCount: newLikedState ? (post.likeCount || 0) + 1 : Math.max(0, (post.likeCount || 0) - 1)
          };
        }
        return post;
      });
      localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
      
      // Also save user-specific like state
      const userId = user?.uid || 'guest';
      const userLikes = JSON.parse(localStorage.getItem(`userLikes_${userId}`) || '[]');
      if (newLikedState && !userLikes.includes(postId)) {
        userLikes.push(postId);
      } else if (!newLikedState) {
        const index = userLikes.indexOf(postId);
        if (index > -1) userLikes.splice(index, 1);
      }
      localStorage.setItem(`userLikes_${userId}`, JSON.stringify(userLikes));
      return; // Don't try to sync to MongoDB
    }
    
    // Save user-specific like state to localStorage (for persistence after reload)
    const userId = user?.uid || 'guest';
    const userLikes = JSON.parse(localStorage.getItem(`userLikes_${userId}`) || '[]');
    if (newLikedState && !userLikes.includes(postId)) {
      userLikes.push(postId);
    } else if (!newLikedState) {
      const index = userLikes.indexOf(postId);
      if (index > -1) userLikes.splice(index, 1);
    }
    localStorage.setItem(`userLikes_${userId}`, JSON.stringify(userLikes));
    console.log(`💾 Like state saved to localStorage for post: ${postId}`);
    
    // Send to MongoDB (use actualPostId for shared posts)
    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        `${API_BASE_URL}/posts/${actualPostId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      
      if (response.data.success) {
        console.log('✅ Like synced to MongoDB');
        // Refresh post data from server to ensure consistency
        const updatedPost = response.data.post;
        // Update both original and shared versions
        setPosts(posts.map(p => {
          if (p.id === postId || p.id.endsWith('_' + actualPostId)) {
            return { 
              ...updatedPost, 
              id: p.id, // Keep original ID
              isLiked: newLikedState // Preserve the like state we just set
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('❌ Failed to sync like:', error);
      // Revert UI on error
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !newLikedState,
            likeCount: post.likeCount + (newLikedState ? -1 : 1)
          };
        }
        return post;
      }));
      
      // Also revert localStorage
      const revertLikes = JSON.parse(localStorage.getItem(`userLikes_${userId}`) || '[]');
      if (!newLikedState && !revertLikes.includes(postId)) {
        revertLikes.push(postId);
      } else if (newLikedState) {
        const index = revertLikes.indexOf(postId);
        if (index > -1) revertLikes.splice(index, 1);
      }
      localStorage.setItem(`userLikes_${userId}`, JSON.stringify(revertLikes));
    }
  };

  const handleComment = async (postId) => {
    if (!user || !commentText[postId]?.trim()) return;
    
    const commentTextValue = commentText[postId];
    
    // Optimistic UI update
    const tempComment = {
      id: 'temp_' + Date.now(),
      user: {
        name: user.displayName || user.email?.split('@')[0],
        photo: user.photoURL || '/pages/TeamPage/profile.png'
      },
      text: commentTextValue,
      createdAt: new Date().toISOString()
    };
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), tempComment],
          commentCount: (post.commentCount || 0) + 1
        };
      }
      return post;
    }));
    setCommentText({ ...commentText, [postId]: '' });
    
    // Extract original post ID if this is a shared post
    let actualPostId = postId;
    if (postId.startsWith('shared_')) {
      const parts = postId.split('_');
      actualPostId = parts[parts.length - 1];
    }
    
    // Check if this is a MongoDB post (valid ObjectId) or localStorage post
    const isMongoPost = /^[0-9a-fA-F]{24}$/.test(actualPostId);
    
    if (!isMongoPost) {
      console.log('⚠️ Local-only post, saving comment to localStorage');
      // Save to localStorage for persistence
      const savedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
      const updatedPosts = savedPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), tempComment],
            commentCount: (post.commentCount || 0) + 1
          };
        }
        return post;
      });
      localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
      return; // Don't try to sync to MongoDB
    }
    
    // Send to MongoDB (use actualPostId for shared posts)
    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        `${API_BASE_URL}/posts/${actualPostId}/comment`,
        { text: commentTextValue },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      
      if (response.data.success) {
        console.log('✅ Comment synced to MongoDB');
        // Replace temp comment with real one from server
        const updatedPost = response.data.post;
        // Update both original and shared versions
        setPosts(posts.map(p => {
          if (p.id === postId || p.id.endsWith('_' + actualPostId)) {
            return { ...updatedPost, id: p.id };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('❌ Failed to sync comment:', error);
      // Remove temp comment on error
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter(c => c.id !== tempComment.id),
            commentCount: Math.max(0, (post.commentCount || 0) - 1)
          };
        }
        return post;
      }));
      setCommentText({ ...commentText, [postId]: commentTextValue }); // Restore text
    }
  };

  const handleSave = async (postId) => {
    if (!user) return;
    
    // Optimistic UI update
    const currentPost = posts.find(p => p.id === postId);
    const newSavedState = !currentPost?.isSaved;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const currentCount = post.saveCount || 0;
        return {
          ...post,
          isSaved: newSavedState,
          saveCount: newSavedState ? currentCount + 1 : Math.max(0, currentCount - 1)
        };
      }
      return post;
    }));
    
    // Extract original post ID if this is a shared post
    let actualPostId = postId;
    if (postId.startsWith('shared_')) {
      const parts = postId.split('_');
      actualPostId = parts[parts.length - 1];
    }
    
    // Check if this is a MongoDB post (valid ObjectId) or localStorage post
    const isMongoPost = /^[0-9a-fA-F]{24}$/.test(actualPostId);
    
    // ALWAYS save user-specific save state to localStorage (for persistence after reload)
    const userId = user?.uid || 'guest';
    const userSaves = JSON.parse(localStorage.getItem(`userSaves_${userId}`) || '[]');
    if (newSavedState && !userSaves.includes(postId)) {
      userSaves.push(postId);
    } else if (!newSavedState) {
      const index = userSaves.indexOf(postId);
      if (index > -1) userSaves.splice(index, 1);
    }
    localStorage.setItem(`userSaves_${userId}`, JSON.stringify(userSaves));
    console.log(`💾 Save state saved to localStorage for post: ${postId}`);
    
    // Send to MongoDB (use actualPostId for shared posts)
    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        `${API_BASE_URL}/posts/${actualPostId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      
      if (response.data.success) {
        console.log('✅ Save synced to MongoDB');
        const updatedPost = response.data.post;
        // Update both original and shared versions - preserve existing states
        setPosts(posts.map(p => {
          if (p.id === postId || p.id.endsWith('_' + actualPostId)) {
            return { 
              ...updatedPost,
              id: p.id, // Preserve original ID
              isLiked: p.isLiked, // Preserve existing like state
              likeCount: p.likeCount, // Preserve existing like count
              isSharedByCurrentUser: p.isSharedByCurrentUser, // Preserve share state
              saveCount: updatedPost.saveCount || p.saveCount // Use updated count
            };
          }
          return p;
        }));
        console.log(`💾 Save state updated in UI: ${newSavedState}`);
      }
    } catch (error) {
      console.error('❌ Failed to sync save:', error);
      // Revert UI on error
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isSaved: !newSavedState,
            saveCount: post.saveCount + (newSavedState ? -1 : 1)
          };
        }
        return post;
      }));
      
      // Also revert localStorage
      const revertSaves = JSON.parse(localStorage.getItem(`userSaves_${userId}`) || '[]');
      if (!newSavedState && !revertSaves.includes(postId)) {
        revertSaves.push(postId);
      } else if (newSavedState) {
        const index = revertSaves.indexOf(postId);
        if (index > -1) revertSaves.splice(index, 1);
      }
      localStorage.setItem(`userSaves_${userId}`, JSON.stringify(revertSaves));
    }
  };

  const handleShare = async (postId) => {
    if (!user) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }
    
    if (!window.confirm('هل تريد مشاركة هذا المنشور على صفحتك؟')) {
      return;
    }
    
    const userId = user?.uid || 'guest';
    
    // Find the original post
    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return;
    
    // Create a shared post (repost) in the feed with independent interactions
    const sharedPostId = 'shared_' + Date.now() + '_' + postId;
    const sharedPost = {
      id: sharedPostId,
      content: originalPost.content,
      media: originalPost.media, // Keep media reference
      author: originalPost.author,
      sharedBy: {
        name: user.displayName || user.email?.split('@')[0] || 'مستخدم',
        photo: user.photoURL || '/pages/TeamPage/profile.png',
        uid: user.uid
      },
      originalAuthor: originalPost.author,
      originalPostId: postId,
      isShared: true,
      sharedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      // Independent interaction counts for shared post
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      saveCount: 0,
      isLiked: false,
      isSaved: false,
      isSharedByCurrentUser: false,
      comments: []
    };
    
    // Update original post share count
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, shareCount: (post.shareCount || 0) + 1, isSharedByCurrentUser: true }
        : post
    );
    
    // Add shared post to the top
    setPosts([sharedPost, ...updatedPosts]);
    
    // Track user-specific share (only save the ID, not the full post)
    const userShares = JSON.parse(localStorage.getItem(`userShares_${userId}`) || '[]');
    if (!userShares.includes(postId)) {
      userShares.push(postId);
    }
    localStorage.setItem(`userShares_${userId}`, JSON.stringify(userShares));
    
    // Save shared post to MongoDB
    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        `${API_BASE_URL}/posts`,
        {
          content: originalPost.content,
          media: originalPost.media,
          isShared: true,
          originalPostId: postId,
          sharedBy: {
            name: user.displayName || user.email?.split('@')[0] || 'مستخدم',
            photo: user.photoURL || '/pages/TeamPage/profile.png',
            uid: user.uid
          }
        },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      
      if (response.data.success) {
        console.log('✅ Shared post saved to MongoDB');
        
        // Try to update the share count on original post (if it exists in MongoDB)
        try {
          await axios.post(
            `${API_BASE_URL}/posts/${postId}/share`,
            {},
            { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
          );
        } catch (shareError) {
          // Original post might not exist in MongoDB (local-only), that's okay
          console.log('⚠️ Could not update original post share count (might be local-only)');
        }
        
        alert('تم مشاركة المنشور على صفحتك!');
        // Don't call fetchPosts() - it would remove local-only posts!
        // The shared post is already added to the UI above
      }
    } catch (error) {
      console.error('❌ Failed to share post:', error);
      alert('فشل مشاركة المنشور، حاول مرة أخرى');
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
    setEditMedia(post.media || []);
    setShowPostMenu({...showPostMenu, [post.id]: false});
  };

  const handleAddMedia = (e, postId) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
        setEditMedia(prev => [...prev, {
          type: mediaType,
          url: event.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveMedia = (index) => {
    setEditMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async (postId) => {
    if (!user || !editContent.trim()) {
      alert('الرجاء كتابة محتوى المنشور');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await axios.put(
        `${API_BASE_URL}/posts/${postId}`,
        { content: editContent, media: editMedia },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );

      if (response.data.success) {
        console.log('✅ Post updated successfully');
        // Update local state
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, content: editContent, media: editMedia }
            : post
        ));
        setEditingPost(null);
        setEditContent('');
        setEditMedia([]);
        alert('تم تحديث المنشور بنجاح');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('فشل تحديث المنشور، حاول مرة أخرى');
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent('');
    setEditMedia([]);
  };

  const handleDeletePost = async (postId) => {
    if (!user) return;
    
    if (!window.confirm('هل تريد حذف هذا المنشور؟')) return;
    
    // Optimistically remove from UI immediately
    const originalPosts = [...posts];
    setPosts(posts.filter(post => post.id !== postId));
    
    // Check if this is a MongoDB post or local-only post
    const isMongoPost = /^[0-9a-fA-F]{24}$/.test(postId);
    
    if (!isMongoPost) {
      console.log('🗑️ Deleting local-only post from localStorage');
      // Remove from localStorage
      const savedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
      const updatedPosts = savedPosts.filter(post => post.id !== postId);
      localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
      
      // Also remove from user's interaction lists
      const userId = user?.uid || 'guest';
      ['userLikes', 'userSaves', 'userShares'].forEach(key => {
        const list = JSON.parse(localStorage.getItem(`${key}_${userId}`) || '[]');
        const filtered = list.filter(id => id !== postId);
        localStorage.setItem(`${key}_${userId}`, JSON.stringify(filtered));
      });
      
      alert('تم حذف المنشور');
      return;
    }
    
    // Try to delete from MongoDB
    try {
      const token = await user.getIdToken();
      const response = await axios.delete(
        `${API_BASE_URL}/posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );

      if (response.data.success) {
        console.log('✅ Post deleted from MongoDB');
        
        // Also remove from user's interaction lists
        const userId = user?.uid || 'guest';
        ['userLikes', 'userSaves', 'userShares'].forEach(key => {
          const list = JSON.parse(localStorage.getItem(`${key}_${userId}`) || '[]');
          const filtered = list.filter(id => id !== postId);
          localStorage.setItem(`${key}_${userId}`, JSON.stringify(filtered));
        });
        
        alert('تم حذف المنشور');
      }
    } catch (error) {
      console.error('❌ Error deleting post from MongoDB:', error);
      
      // If 404, the post doesn't exist in MongoDB (might be local-only or already deleted)
      if (error.response?.status === 404) {
        console.log('⚠️ Post not found in MongoDB, keeping UI updated (already removed)');
        alert('تم حذف المنشور');
        // Don't revert UI - post is gone anyway
      } else if (error.response?.status === 403) {
        // Revert UI only for permission errors
        setPosts(originalPosts);
        alert('ليس لديك صلاحية لحذف هذا المنشور');
      } else {
        // Revert UI for other errors
        setPosts(originalPosts);
        alert('فشل حذف المنشور، حاول مرة أخرى');
      }
    }
  };

  const handleCreatePost = async (newPost) => {
    console.log('📝 New post created:', newPost);
    
    const postWithStates = {
      ...newPost,
      isLiked: false,
      isSaved: false,
      isSharedByCurrentUser: false,
      likeCount: 0,
      commentCount: 0,
      saveCount: 0,
      shareCount: 0,
      comments: []
    };
    
    // Add to the top of the feed immediately
    setPosts([postWithStates, ...posts]);
    
    console.log('✅ Post added to feed');
  };

  const handlePostCreated = (newPost) => {
    // Refresh posts from MongoDB to get the latest data
    console.log('✅ New post created, refreshing feed from MongoDB');
    fetchPosts();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Responsive Container */}
      <div style={{
        width: '100%',
        height: '100vh',
        background: '#FFF9F0',
        display: 'flex',
        flexDirection: 'column',
        direction: 'rtl',
        fontFamily: theme.typography.fonts.secondary,
        position: 'relative',
        overflow: 'auto',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 20px',
        maxWidth: '480px'
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            zIndex: 10,
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img 
            src="/pages/back.png" 
            alt="Back"
            style={{
              width: '24px',
              height: '24px',
              display: 'block'
            }}
          />
        </button>

        {/* Content */}
        <div 
          data-community-scroll
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '60px 20px 20px'
          }}>
          {/* Stories Section */}
          <div style={{
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: '10px'
            }}>
            
            </div>

            {/* Stories Row */}
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '5px'
            }}>
              {/* Add Story Button */}
              <button
                onClick={() => setShowCreateStory(true)}
                style={{
                  background: 'transparent',
                  border: `3px solid ${theme.colors.primary.orange}`,
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  padding: 0,
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{
                  fontSize: '32px',
                  color: theme.colors.primary.orange,
                  fontWeight: 'bold',
                  lineHeight: 1
                }}>+</span>
              </button>

              {/* Story Groups */}
              {stories.map((storyGroup, groupIndex) => {
                const latestStory = storyGroup.stories[storyGroup.stories.length - 1];
                return (
                  <button
                    key={groupIndex}
                    onClick={() => setViewingStory(groupIndex)}
                    style={{
                      background: 'transparent',
                      border: `3px solid ${theme.colors.primary.orange}`,
                      borderRadius: '50%',
                      width: '60px',
                      height: '60px',
                      padding: '2px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(241, 138, 33, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Story preview image */}
                    {storyGroup.stories.length > 1 && (
                      <div style={{
                        position: 'absolute',
                        top: '-5px',
                        left: '-5px',
                        zIndex: 1, // Add z-index to ensure it's on top of the story count badge
                        background: theme.colors.primary.orange,
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        zIndex: 3,
                        border: '2px solid white'
                      }}>
                        {storyGroup.stories.length}
                      </div>
                    )}
                    
                    {latestStory.media?.url ? (
                      latestStory.media.type === 'image' ? (
                        <img 
                          src={latestStory.media.url}
                          alt="Story"
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            console.log('Story image failed to load:', latestStory.media.url);
                            e.target.src = storyGroup.author?.photo || '/pages/TeamPage/profile.png';
                          }}
                        />
                      ) : (
                        <video 
                          src={latestStory.media.url}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      )
                    ) : (
                      <img 
                        src={storyGroup.author?.photo || '/pages/TeamPage/profile.png'}
                        alt={storyGroup.author?.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Text - OUTSIDE card */}
          <div style={{
            textAlign: 'right',
            marginBottom: '8px',
            paddingRight: '10px'
          }}>
            <span style={{
              fontSize: '14px',
              color: theme.colors.primary.blue,
              fontFamily: theme.typography.fonts.secondary,
              fontWeight: 'bold'
            }}>اكتب منشور</span>
          </div>

          {/* Post Creation Card - Clickable */}
          <div 
            onClick={() => setShowCreatePost(true)}
            style={{
            border: `2px solid ${theme.colors.primary.orange}`,
            borderRadius: '20px',
            padding: '12px 15px',
            marginBottom: '20px',
            position: 'relative',
            minHeight: '80px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(241, 138, 33, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            {/* User Avatar - Top Right INSIDE */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '15px',
              zIndex: 2,
              pointerEvents: 'none'
            }}>
              <img 
                src={getDefaultProfileIcon(user?.photoURL, user?.gender)}
                alt="Profile"
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  border: `2px solid ${theme.colors.primary.orange}`,
                  background: 'white',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '55px'
            }}>
              {/* Media Icons - LEFT */}
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <div style={{ padding: '2px', pointerEvents: 'none' }}>
                  <img 
                    src="/pages/community/image.png"
                    alt="Photo"
                    style={{
                      width: '20px',
                      height: '20px',
                      opacity: 0.6
                    }}
                  />
                </div>
                <div style={{ padding: '2px', pointerEvents: 'none' }}>
                  <img 
                    src="/pages/community/video.png"
                    alt="Video"
                    style={{
                      width: '20px',
                      height: '20px',
                      opacity: 0.6
                    }}
                  />
                </div>
                <div style={{ padding: '2px', pointerEvents: 'none' }}>
                  <img 
                    src="/pages/community/edit.png"
                    alt="Edit"
                    style={{
                      width: '20px',
                      height: '20px',
                      opacity: 0.6
                    }}
                  />
                </div>
              </div>

              {/* Post Button - RIGHT */}
              <div 
                style={{
                background: theme.colors.primary.orange,
                border: 'none',
                borderRadius: '8px',
                padding: '6px 16px',
                pointerEvents: 'none'
              }}
              >
                <span style={{
                  fontSize: '13px',
                  fontWeight: theme.typography.weights.bold,
                  color: 'white',
                  fontFamily: theme.typography.fonts.primary
                }}>انشر الآن</span>
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          {postsLoading && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: `4px solid ${theme.colors.secondary.lightBlue}`,
                borderTop: `4px solid ${theme.colors.primary.orange}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px'
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{
                color: theme.colors.primary.blue,
                fontSize: '16px',
                fontFamily: theme.typography.fonts.primary
              }}>جاري تحميل المنشورات...</p>
            </div>
          )}

          {/* Posts Feed */}
          {!postsLoading && posts.length === 0 && !loadingMore && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: theme.colors.primary.blue,
              fontSize: '16px',
              fontFamily: theme.typography.fonts.primary
            }}>
              لا توجد منشورات حالياً
              <br />
              <span style={{ fontSize: '14px', color: '#999' }}>
                كن أول من ينشر!
              </span>
            </div>
          )}
          
          {posts.map((post, postIndex) => {
            return (
            <div
              key={post.id}
              style={{
                background:  '#FFF9F0' ,
                border: `2px solid ${theme.colors.secondary.yellow}` ,
                borderRadius: '20px',
                padding: '15px',
                marginBottom: '15px'
              }}
            >
              {/* Shared By Indicator */}
              {post.isShared && post.sharedBy && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  padding: '8px',
                  background: '#FFF3E0',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>🔄</span>
                  <img 
                    src={post.sharedBy.photo || '/pages/TeamPage/profile.png'}
                    alt={post.sharedBy.name}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <span style={{
                    fontSize: '13px',
                    color: theme.colors.primary.blue,
                    fontFamily: theme.typography.fonts.secondary
                  }}>
                    {post.sharedBy.name} شارك هذا المنشور
                  </span>
                </div>
              )}

              {/* Post Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <img 
                  src={post.originalAuthor?.photo || post.author?.photo || '/pages/TeamPage/profile.png'}
                  alt={post.originalAuthor?.name || post.author?.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  flex: 1,
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: theme.typography.weights.bold,
                    color: theme.colors.primary.blue,
                    fontFamily: theme.typography.fonts.primary
                  }}>{post.originalAuthor?.name || post.author?.name || 'مستخدم'}</div>
                  <div style={{
                    fontSize: '11px',
                    color: '#999',
                    fontFamily: theme.typography.fonts.secondary
                  }}>{formatTime(post.createdAt)}</div>
                </div>

                {/* 3-Dot Menu (only for post owner) */}
                {user && post.author?.name === (user.displayName || user.email?.split('@')[0]) && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowPostMenu({...showPostMenu, [post.id]: !showPostMenu[post.id]})}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)';
                        const svg = e.currentTarget.querySelector('circle');
                        if (svg) svg.setAttribute('fill', theme.colors.primary.orange);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        const svg = e.currentTarget.querySelector('circle');
                        if (svg) svg.setAttribute('fill', theme.colors.primary.blue);
                      }}
                      title="خيارات"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="5" r="2" fill={theme.colors.primary.blue}/>
                        <circle cx="12" cy="12" r="2" fill={theme.colors.primary.blue}/>
                        <circle cx="12" cy="19" r="2" fill={theme.colors.primary.blue}/>
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showPostMenu[post.id] && (
                      <div style={{
                        position: 'absolute',
                        top: '35px',
                        left: '0',
                        background: 'white',
                        border: `2px solid ${theme.colors.primary.orange}`,
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 100,
                        minWidth: '120px',
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => handleEditPost(post)}
                          style={{
                            width: '100%',
                            padding: '12px 15px',
                            background: 'transparent',
                            border: 'none',
                            textAlign: 'right',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'flex-end',
                            fontSize: '14px',
                            fontFamily: theme.typography.fonts.secondary,
                            color: theme.colors.primary.blue,
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FFF9F0';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <span>تعديل</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" 
                                  fill={theme.colors.primary.blue}/>
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            handleDeletePost(post.id);
                            setShowPostMenu({...showPostMenu, [post.id]: false});
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 15px',
                            background: 'transparent',
                            border: 'none',
                            borderTop: `1px solid #FFE8CC`,
                            textAlign: 'right',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'flex-end',
                            fontSize: '14px',
                            fontFamily: theme.typography.fonts.secondary,
                            color: '#ff4444',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ffebee';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <span>حذف</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" 
                                  fill="#ff4444"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Post Content */}
              {editingPost === post.id ? (
                <div style={{ marginBottom: '12px' }}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '10px',
                      border: `2px solid ${theme.colors.primary.orange}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontFamily: theme.typography.fonts.secondary,
                      textAlign: 'right',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                  
                  {/* Edit Media Section */}
                  {editMedia.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
                      {editMedia.map((media, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          {media.type === 'image' ? (
                            <img src={media.url} alt="Edit" style={{ width: '100%', borderRadius: '8px' }} />
                          ) : (
                            <video src={media.url} style={{ width: '100%', borderRadius: '8px' }} controls />
                          )}
                          <button
                            onClick={() => handleRemoveMedia(index)}
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              background: 'rgba(255, 68, 68, 0.9)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '16px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Add Media Button */}
                    <label style={{
                      padding: '8px 15px',
                      background: theme.colors.primary.blue,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontFamily: theme.typography.fonts.secondary
                    }}>
                      📎 إضافة صور
                      <input 
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={(e) => handleAddMedia(e, post.id)}
                        style={{ display: 'none' }}
                      />
                    </label>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '8px 15px',
                          background: '#ccc',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontFamily: theme.typography.fonts.secondary
                        }}
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        style={{
                          padding: '8px 15px',
                          background: theme.colors.primary.orange,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontFamily: theme.typography.fonts.secondary
                        }}
                      >
                        حفظ
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{
                  fontSize: '14px',
                  color: theme.colors.primary.blue,
                  fontFamily: theme.typography.fonts.secondary,
                  margin: '0 0 12px 0',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>{post.content}</p>
              )}

              {/* Post Media */}
              {post.media && post.media.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: post.media.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                  gap: '10px',
                  marginBottom: '12px'
                }}>
                  {post.media.map((media, index) => {
                    const imageUrl = media.url;
                    
                    if (!imageUrl) {
                      return null; // Skip if no valid image
                    }
                    
                    return (
                    <div key={index}>
                      {media.type === 'image' ? (
                        <img 
                          src={imageUrl}
                          alt="Post media"
                          style={{
                            width: '100%',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            maxHeight: '300px'
                          }}
                          onError={(e) => {
                            console.error('❌ Failed to load image:', media.url);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <video 
                          src={imageUrl}
                          controls
                          style={{
                            width: '100%',
                            borderRadius: '10px',
                            maxHeight: '300px'
                          }}
                        />
                      )}
                    </div>
                  );
                  })}
                </div>
              )}


              {/* Post Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                paddingTop: '12px',
                borderTop: `1px solid #FFE8CC`
              }}>
                {/* Like Button */}
                <button 
                  onClick={() => handleLike(post.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s ease',
                    padding: '5px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                          fill={post.isLiked ? theme.colors.primary.orange : 'none'}
                          stroke={post.isLiked ? theme.colors.primary.orange : '#E8D5C4'}
                          strokeWidth="2"/>
                  </svg>
                  <span style={{
                    fontSize: '14px',
                    color: theme.colors.primary.blue,
                    fontFamily: theme.typography.fonts.secondary
                  }}>{post.likeCount || 0}</span>
                </button>

                {/* Comment Button */}
                <button 
                  onClick={() => setShowComments({...showComments, [post.id]: !showComments[post.id]})}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s ease',
                    padding: '5px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="14" rx="3" 
                          stroke="#E8D5C4" 
                          strokeWidth="2" 
                          fill="none"/>
                  </svg>
                  <span style={{
                    fontSize: '14px',
                    color: theme.colors.primary.blue,
                    fontFamily: theme.typography.fonts.secondary
                  }}>{post.commentCount || 0}</span>
                </button>

                {/* Share Button */}
                {!post.isShared && (
                  <button 
                    onClick={() => handleShare(post.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s ease',
                      padding: '5px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="18" cy="5" r="3" 
                        fill={post.isSharedByCurrentUser ? theme.colors.primary.orange : '#E8D5C4'}/>
                      <circle cx="6" cy="12" r="3" 
                        fill={post.isSharedByCurrentUser ? theme.colors.primary.orange : '#E8D5C4'}/>
                      <circle cx="18" cy="19" r="3" 
                        fill={post.isSharedByCurrentUser ? theme.colors.primary.orange : '#E8D5C4'}/>
                      <line x1="8.5" y1="13" x2="15.5" y2="18" 
                        stroke={post.isSharedByCurrentUser ? theme.colors.primary.orange : '#E8D5C4'} 
                        strokeWidth="2"/>
                      <line x1="8.5" y1="11" x2="15.5" y2="6" 
                        stroke={post.isSharedByCurrentUser ? theme.colors.primary.orange : '#E8D5C4'} 
                        strokeWidth="2"/>
                    </svg>
                    <span style={{
                      fontSize: '14px',
                      color: theme.colors.primary.blue,
                      fontFamily: theme.typography.fonts.secondary
                    }}>{post.shareCount || 0}</span>
                  </button>
                )}

                {/* Save Button */}
                <button 
                  onClick={() => handleSave(post.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s ease',
                    padding: '5px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" 
                          fill={post.isSaved ? theme.colors.primary.orange : 'none'}
                          stroke={post.isSaved ? theme.colors.primary.orange : '#E8D5C4'}
                          strokeWidth="2"/>
                  </svg>
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div style={{
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: `1px solid #FFE8CC`
                }}>
                  {/* Existing Comments */}
                  {post.comments && post.comments.map((comment) => (
                    <div key={comment.id} style={{
                      display: 'flex',
                      gap: '10px',
                      marginBottom: '10px',
                      padding: '10px',
                      background: '#FFF9F0',
                      borderRadius: '10px',
                      alignItems: 'flex-start'
                    }}>
                      <img 
                        src={comment.author?.photo || comment.user?.photo || '/pages/TeamPage/profile.png'}
                        alt="Profile"
                        style={{
                          width: '35px',
                          height: '35px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `2px solid ${theme.colors.secondary.yellow}`
                        }}
                      />
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: theme.typography.weights.bold,
                          color: theme.colors.primary.blue,
                          marginBottom: '3px',
                          fontFamily: theme.typography.fonts.primary
                        }}>{comment.author?.name || comment.user?.name || 'مستخدم'}</div>
                        <div style={{
                          fontSize: '14px',
                          color: '#333',
                          fontFamily: theme.typography.fonts.secondary,
                          lineHeight: '1.4',
                          wordBreak: 'break-word'
                        }}>{comment.text}</div>
                        <div style={{
                          fontSize: '11px',
                          color: '#999',
                          marginTop: '3px',
                          fontFamily: theme.typography.fonts.secondary
                        }}>
                          {(() => {
                            const commentDate = new Date(comment.createdAt);
                            const now = new Date();
                            const diffMs = now - commentDate;
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffHours = Math.floor(diffMs / 3600000);
                            
                            if (diffMins < 1) return 'الآن';
                            if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
                            if (diffHours < 24) return `منذ ${diffHours} ساعة`;
                            return commentDate.toLocaleDateString('ar-EG');
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment */}
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '10px'
                  }}>
                    <button
                      onClick={() => handleComment(post.id)}
                      style={{
                        background: theme.colors.primary.orange,
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 15px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: theme.typography.fonts.primary
                      }}
                    >
                      إرسال
                    </button>
                    <input
                      type="text"
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                      placeholder="اكتب تعليقاً..."
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: `2px solid ${theme.colors.primary.blue}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontFamily: theme.typography.fonts.secondary,
                        textAlign: 'right',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            );
          })}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: theme.colors.primary.orange
            }}>
              <div style={{
                display: 'inline-block',
                width: '30px',
                height: '30px',
                border: `3px solid ${theme.colors.primary.orange}`,
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          )}

          {/* No More Posts */}
          {!hasMore && posts.length > 0 && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#999',
              fontSize: '14px',
              fontFamily: theme.typography.fonts.secondary
            }}>
              لا توجد منشورات أخرى
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          background: '#FFE5CC',
          borderTop: 'none',
          padding: '15px 0',
          position: 'sticky',
          bottom: 0,
          zIndex: 100
        }}>
          {/* Settings */}
          <button 
            onClick={() => navigate('/settings')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src="/pages/geerIcon.png" 
              alt="Settings"
              style={{
                width: '28px',
                height: '28px',
                display: 'block'
              }}
            />
          </button>

          {/* Notifications */}
          <button 
            onClick={() => navigate('/notifications')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src="/pages/NotificationIcon.png" 
              alt="Notifications"
              style={{
                width: '28px',
                height: '28px',
                display: 'block'
              }}
            />
          </button>

          {/* Home */}
          <button 
            onClick={() => navigate('/home')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src="/pages/homeIcon.png" 
              alt="Home"
              style={{
                width: '28px',
                height: '28px',
                display: 'block'
              }}
            />
          </button>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {viewingStory !== null && stories.length > 0 && (
        <StoryViewer 
          storyGroup={stories[viewingStory]}
          allStoryGroups={stories}
          initialGroupIndex={viewingStory}
          onClose={() => setViewingStory(null)}
          onStoryDeleted={() => {
            fetchStories();
          }}
        />
      )}

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStoryModal 
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={() => {
            setShowCreateStory(false);
            fetchStories();
          }}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal 
          onClose={() => setShowCreatePost(false)}
          onPostCreated={(newPost) => {
            handlePostCreated(newPost);
            setShowCreatePost(false);
          }}
        />
      )}

    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default CommunityPage;
