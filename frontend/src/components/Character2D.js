import React, { useRef, useEffect, useState } from 'react';

// MediaPipe hand landmark connections (moved outside component)
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],           // Index
  [0, 9], [9, 10], [10, 11], [11, 12],      // Middle
  [0, 13], [13, 14], [14, 15], [15, 16],    // Ring
  [0, 17], [17, 18], [18, 19], [19, 20],    // Pinky
  [5, 9], [9, 13], [13, 17]                 // Palm
];

// Finger colors (moved outside component)
const FINGER_COLORS = {
  thumb: '#FF6B6B',
  index: '#4ECDC4',
  middle: '#45B7D1',
  ring: '#96CEB4',
  pinky: '#FFEAA7',
  palm: '#DFE6E9'
};

// Helper function (moved outside component)
const getFingerColor = (index) => {
  if (index <= 4) return FINGER_COLORS.thumb;
  if (index <= 8) return FINGER_COLORS.index;
  if (index <= 12) return FINGER_COLORS.middle;
  if (index <= 16) return FINGER_COLORS.ring;
  if (index <= 20) return FINGER_COLORS.pinky;
  return FINGER_COLORS.palm;
};

// 2D Character with Hand Overlay
const Character2D = ({ animationData, isPlaying, loop = true }) => {
  const canvasRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef(null);
  const [characterImage, setCharacterImage] = useState(null);

  // Load character image
  useEffect(() => {
    const img = new Image();
    img.src = '/images/character.png';
    img.onload = () => setCharacterImage(img);
  }, []);

  useEffect(() => {
    if (!animationData || !animationData.frames || !isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const fps = animationData.fps || 30;
    const frameDelay = 1000 / fps;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw character image if loaded
      if (characterImage) {
        const scale = Math.min(
          canvas.width / characterImage.width,
          canvas.height / characterImage.height
        ) * 0.8;
        
        const x = (canvas.width - characterImage.width * scale) / 2;
        const y = (canvas.height - characterImage.height * scale) / 2;
        
        ctx.drawImage(
          characterImage,
          x, y,
          characterImage.width * scale,
          characterImage.height * scale
        );
      }

      // Get current frame data
      const frameData = animationData.frames[currentFrame];
      if (frameData && frameData.hands && frameData.hands.length > 0) {
        frameData.hands.forEach((hand) => {
          if (!hand.landmarks) return;

          const landmarks = hand.landmarks;

          // Draw connections
          ctx.lineWidth = 3;
          HAND_CONNECTIONS.forEach(([start, end]) => {
            if (landmarks[start] && landmarks[end]) {
              const startX = landmarks[start].x * canvas.width;
              const startY = landmarks[start].y * canvas.height;
              const endX = landmarks[end].x * canvas.width;
              const endY = landmarks[end].y * canvas.height;

              ctx.strokeStyle = getFingerColor(start);
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.lineTo(endX, endY);
              ctx.stroke();
            }
          });

          // Draw landmarks
          landmarks.forEach((landmark, index) => {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            const z = landmark.z || 0;

            // Size based on depth
            const size = 8 - z * 2;

            ctx.fillStyle = getFingerColor(index);
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();

            // Add white border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        });
      }

      // Move to next frame
      if (loop) {
        setCurrentFrame((prev) => {
          const nextFrame = prev + 1;
          return nextFrame >= animationData.frames.length ? 0 : nextFrame;
        });
      }

      animationRef.current = setTimeout(animate, frameDelay);
    };

    animate();

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [animationData, isPlaying, currentFrame, loop, characterImage]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 100%)'
      }}
    />
  );
};

export default Character2D;
