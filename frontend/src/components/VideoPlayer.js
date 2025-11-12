import React, { useRef, useEffect, useState } from 'react';

const VideoPlayer = ({ videoPath, isPlaying = true, isPaused = false }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setError(false);
    };

    const handleError = (e) => {
      console.error('Video loading error:', e);
      setError(true);
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [videoPath]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPaused) {
      video.pause();
    } else if (isPlaying) {
      video.play().catch(err => {
        console.error('Error playing video:', err);
      });
    } else {
      video.pause();
    }
  }, [isPlaying, isPaused]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000000',
      position: 'relative'
    }}>
      {isLoading && !error && (
        <div style={{
          position: 'absolute',
          color: '#F18A21',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          جاري التحميل...
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          color: '#ff5252',
          fontSize: '14px',
          textAlign: 'center',
          padding: '20px'
        }}>
          خطأ في تحميل الفيديو
        </div>
      )}

      <video
        ref={videoRef}
        key={videoPath}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: error ? 'none' : 'block'
        }}
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={videoPath} type="video/webm" />
        المتصفح الخاص بك لا يدعم تشغيل الفيديو
      </video>
    </div>
  );
};

export default VideoPlayer;
