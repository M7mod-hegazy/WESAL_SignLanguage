import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import theme from '../theme/designSystem';

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
        setMediaFiles(prev => [...prev, {
          type: mediaType,
          url: event.target.result,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!postContent.trim()) {
      setError('الرجاء كتابة محتوى المنشور');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();

      const mediaPayload = mediaFiles.map(media => ({
        type: media.type,
        url: media.url
      }));

      const response = await axios.post('http://localhost:8000/api/posts', {
        content: postContent,
        media: mediaPayload
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setError('');
        setLoading(false);
        setPostContent('');
        setMediaFiles([]);

        onPostCreated && onPostCreated(response.data.post);
        onClose && onClose();
      }
    } catch (err) {
      console.error('❌ Create post error:', err);
      setError('فشل نشر المنشور، حاول مرة أخرى');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#F5F5F0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      {/* Responsive Container */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        height: '100vh',
        background: '#FFF9F0',
        display: 'flex',
        flexDirection: 'column',
        direction: 'rtl',
        fontFamily: theme.typography.fonts.secondary,
        position: 'relative',
        overflow: 'auto',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: `1px solid #FFE8CC`
        }}>
          {/* Back Button */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '5px'
            }}
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

          {/* Post Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? '#ccc' : theme.colors.primary.orange,
              border: 'none',
              borderRadius: '10px',
              padding: '8px 20px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            <span style={{
              fontSize: '14px',
              fontWeight: theme.typography.weights.bold,
              color: 'white',
              fontFamily: theme.typography.fonts.primary
            }}>
              {loading ? 'جاري النشر...' : 'انشر الآن'}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* User Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <img 
              src={user?.photoURL || '/pages/TeamPage/profile.png'}
              alt="Profile"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: `2px solid ${theme.colors.primary.blue}`,
                objectFit: 'cover'
              }}
            />
            <span style={{
              fontSize: '14px',
              color: '#999',
              fontFamily: theme.typography.fonts.secondary
            }}>ماذا يدور بخاطرك؟</span>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '10px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Text Input Area */}
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="اكتب منشورك هنا..."
            autoFocus
            style={{
              width: '100%',
              flex: 1,
              minHeight: '200px',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontFamily: theme.typography.fonts.secondary,
              color: theme.colors.primary.blue,
              background: 'transparent',
              resize: 'none',
              textAlign: 'right',
              direction: 'rtl',
              marginBottom: '15px'
            }}
          />

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '10px',
              marginBottom: '15px'
            }}>
              {mediaFiles.map((media, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  {media.type === 'image' ? (
                    <img 
                      src={media.url} 
                      alt=""
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <video 
                      src={media.url}
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Buttons Bar - Bottom */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          padding: '20px',
          borderTop: `1px solid #FFE8CC`,
          background: 'white'
        }}>
          {/* Image Upload */}
          <label style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}>
            <input 
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <img 
              src="/pages/community/image.png"
              alt="Add Image"
              style={{
                width: '32px',
                height: '32px'
              }}
            />
          </label>

          {/* Video Upload */}
          <label style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}>
            <input 
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <img 
              src="/pages/community/video.png"
              alt="Add Video"
              style={{
                width: '32px',
                height: '32px'
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
