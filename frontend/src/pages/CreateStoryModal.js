import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import theme from '../theme/designSystem';

const CreateStoryModal = ({ onClose, onStoryCreated }) => {
  const { user } = useAuth();
  const [mediaFile, setMediaFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      setMediaFile({
        type: mediaType,
        url: event.target.result,
        file: file
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!mediaFile) {
      setError('الرجاء اختيار صورة أو فيديو');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();

      const response = await axios.post('http://localhost:8000/api/stories', {
        media: {
          type: mediaFile.type,
          url: mediaFile.url
        },
        caption
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      if (response.data.success) {
        onStoryCreated && onStoryCreated(response.data.story);
        setMediaFile(null);
        setCaption('');
        onClose && onClose();
      } else {
        setError('فشل نشر القصة، حاول مرة أخرى');
      }
    } catch (err) {
      console.error('Story creation error:', err);
      setError('فشل نشر القصة، حاول مرة أخرى');
    } finally {
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
            disabled={loading || !mediaFile}
            style={{
              background: mediaFile ? theme.colors.primary.orange : '#ccc',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 20px',
              cursor: mediaFile ? 'pointer' : 'not-allowed'
            }}
          >
            <span style={{
              fontSize: '14px',
              fontWeight: theme.typography.weights.bold,
              color: 'white',
              fontFamily: theme.typography.fonts.primary
            }}>نشر القصة</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.primary.blue,
            fontFamily: theme.typography.fonts.primary,
            marginBottom: '20px'
          }}>إنشاء قصة جديدة</h2>

          {/* Error Message */}
          {error && (
            <div style={{
              width: '100%',
              background: '#ffebee',
              color: '#c62828',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Media Preview */}
          {mediaFile ? (
            <div style={{
              width: '100%',
              maxWidth: '300px',
              marginBottom: '20px',
              position: 'relative'
            }}>
              {mediaFile.type === 'image' ? (
                <img 
                  src={mediaFile.url}
                  alt="Story preview"
                  style={{
                    width: '100%',
                    borderRadius: '15px',
                    maxHeight: '400px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <video 
                  src={mediaFile.url}
                  controls
                  style={{
                    width: '100%',
                    borderRadius: '15px',
                    maxHeight: '400px'
                  }}
                />
              )}
              <button
                onClick={() => setMediaFile(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <label style={{
              width: '100%',
              maxWidth: '300px',
              height: '400px',
              border: `3px dashed ${theme.colors.primary.orange}`,
              borderRadius: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginBottom: '20px',
              background: '#FFF9F0'
            }}>
              <input 
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <span style={{
                fontSize: '48px',
                marginBottom: '10px'
              }}>📸</span>
              <span style={{
                fontSize: '16px',
                color: theme.colors.primary.blue,
                fontFamily: theme.typography.fonts.secondary
              }}>اضغط لاختيار صورة أو فيديو</span>
            </label>
          )}

          {/* Caption Input */}
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="أضف تعليقاً (اختياري)"
            maxLength={200}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '12px',
              border: `2px solid ${theme.colors.primary.blue}`,
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: theme.typography.fonts.secondary,
              textAlign: 'right',
              outline: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateStoryModal;
