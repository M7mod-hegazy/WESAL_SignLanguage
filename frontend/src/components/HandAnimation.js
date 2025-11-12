import React, { useEffect, useRef, useState } from 'react';

/**
 * HandAnimation Component
 * Renders hand landmarks from MediaPipe data on a canvas
 */
const HandAnimation = ({ animationData, isPlaying = true, loop = true }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Hand landmark connections (MediaPipe hand model)
  const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],           // Index
    [0, 9], [9, 10], [10, 11], [11, 12],      // Middle
    [0, 13], [13, 14], [14, 15], [15, 16],    // Ring
    [0, 17], [17, 18], [18, 19], [19, 20],    // Pinky
    [5, 9], [9, 13], [13, 17]                 // Palm
  ];

  useEffect(() => {
    if (!animationData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      const size = Math.min(container.clientWidth, container.clientHeight, 600);
      canvas.width = size;
      canvas.height = size;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const drawHand = (landmarks, handedness) => {
      if (!landmarks || landmarks.length === 0) return;

      const width = canvas.width;
      const height = canvas.height;

      // Draw connections
      ctx.strokeStyle = '#FF9933';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      HAND_CONNECTIONS.forEach(([start, end]) => {
        if (landmarks[start] && landmarks[end]) {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];

          ctx.beginPath();
          ctx.moveTo(startPoint.x * width, startPoint.y * height);
          ctx.lineTo(endPoint.x * width, endPoint.y * height);
          ctx.stroke();
        }
      });

      // Draw landmarks
      landmarks.forEach((landmark, index) => {
        const x = landmark.x * width;
        const y = landmark.y * height;

        // Different colors for different finger parts
        let color = '#FF9933';
        if (index === 0) color = '#FF5500'; // Wrist
        else if (index <= 4) color = '#FF7700'; // Thumb
        else if (index <= 8) color = '#FF8800'; // Index
        else if (index <= 12) color = '#FF9933'; // Middle
        else if (index <= 16) color = '#FFAA44'; // Ring
        else color = '#FFBB55'; // Pinky

        // Draw landmark point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, index === 0 ? 8 : 6, 0, 2 * Math.PI);
        ctx.fill();

        // Add white border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000; // Convert to seconds
      const fps = animationData.fps || 30;
      const duration = animationData.duration || 2;

      let frameIndex = Math.floor(elapsed * fps);

      // Loop animation
      if (loop && frameIndex >= animationData.frames.length) {
        startTimeRef.current = timestamp;
        frameIndex = 0;
      } else if (!loop && frameIndex >= animationData.frames.length) {
        frameIndex = animationData.frames.length - 1;
      }

      setCurrentFrame(frameIndex);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background circle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.45, 0, 2 * Math.PI);
      ctx.fill();

      // Draw decorative border
      ctx.strokeStyle = '#FF9933';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Get current frame data
      const frame = animationData.frames[frameIndex];
      
      if (frame && frame.hands && frame.hands.length > 0) {
        frame.hands.forEach(hand => {
          drawHand(hand.landmarks, hand.handedness);
        });
      }

      // Continue animation if playing
      if (isPlaying && (loop || frameIndex < animationData.frames.length - 1)) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      startTimeRef.current = null;
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [animationData, isPlaying, loop]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(255, 153, 51, 0.2)'
        }}
      />
    </div>
  );
};

export default HandAnimation;
