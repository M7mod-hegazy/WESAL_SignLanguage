import React, { useRef, useEffect, useState } from 'react';

/**
 * VideoAnimation Component
 * Displays transparent WebM videos with alpha channel support
 * Includes fallback for browsers that don't support alpha WebM
 */
const VideoAnimation = ({ 
  videoSrc,           // Can be full path with extension OR base path without extension
  animationData,      // Lottie animation data (fallback)
  isPlaying = true,
  loop = true,
  className = '',
  style = {}
}) => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [currentSource, setCurrentSource] = useState('alpha');
  
  // Check if videoSrc is a full path (has extension) or needs extension
  const isFullPath = videoSrc && (videoSrc.endsWith('.webm') || videoSrc.endsWith('.mp4'));
  const videoPath = isFullPath ? videoSrc : (videoSrc ? `${videoSrc}_alpha.webm` : null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // Ignore AbortError - it's expected when switching videos quickly
          if (err.name !== 'AbortError') {
            console.warn('Video autoplay failed:', err);
          }
        });
      }
    } else {
      video.pause();
    }

    // Cleanup: pause video when component unmounts or effect re-runs
    return () => {
      if (video && !video.paused) {
        video.pause();
      }
    };
  }, [isPlaying]);

  // Reset video when source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();
    
    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // Ignore AbortError - it's expected when switching videos quickly
          if (err.name !== 'AbortError') {
            console.warn('Video play failed:', err);
          }
        });
      }
    }
  }, [videoSrc, isPlaying]);

  const handleError = (e) => {
    // Try fallback if alpha version fails
    if (currentSource === 'alpha') {
      setCurrentSource('fallback');
    } else if (currentSource === 'fallback') {
      setCurrentSource('mp4');
    } else {
      setVideoError(true);
    }
  };

  const handleCanPlay = () => {
    setVideoError(false);
  };

  // Show error state if no video source or video failed to load
  if (!videoSrc || videoError) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 100%)',
        borderRadius: '15px',
        ...style
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#FF9933'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎥</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {!videoSrc ? 'No video source' : 'Video not available'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      loop={loop}
      muted
      playsInline
      onError={handleError}
      onCanPlay={handleCanPlay}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        background: 'transparent',
        display: 'block',
        ...style
      }}
    >
      {/* Check if videoSrc already has extension (full path) */}
      {videoSrc && videoSrc.endsWith('.webm') ? (
        // Full path with extension - use as is
        <source 
          src={videoSrc} 
          type="video/webm"
        />
      ) : (
        // Base path without extension - add suffixes
        <>
          {/* Primary source: WebM with alpha channel (VP9) */}
          {currentSource === 'alpha' && (
            <source 
              src={`${videoSrc}_alpha.webm`} 
              type="video/webm; codecs=vp9"
            />
          )}
          
          {/* Fallback 1: WebM without alpha */}
          {(currentSource === 'fallback' || currentSource === 'alpha') && (
            <source 
              src={`${videoSrc}_fallback.webm`} 
              type="video/webm"
            />
          )}
          
          {/* Fallback 2: MP4 for Safari */}
          <source 
            src={`${videoSrc}_fallback.mp4`} 
            type="video/mp4"
          />
        </>
      )}
      
      {/* Fallback message */}
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoAnimation;
