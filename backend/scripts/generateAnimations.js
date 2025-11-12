/**
 * Generate sample animation data for testing without requiring actual videos
 */

function generateWaveAnimation() {
  const fps = 30;
  const duration = 2.0;
  const totalFrames = Math.floor(fps * duration);
  
  const frames = [];
  
  for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
    const timestamp = frameNum / fps;
    
    // Wave motion - rotate hand back and forth
    const angle = Math.sin(timestamp * 3) * 0.3;
    
    const landmarks = [];
    
    // Wrist
    landmarks.push({ x: 0.5, y: 0.5, z: 0.0 });
    
    // Thumb (4 points)
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.5 - 0.1 * (i + 1) + angle * 0.1,
        y: 0.5 - 0.05 * (i + 1),
        z: 0.02 * i
      });
    }
    
    // Index finger (4 points)
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.5 - 0.05 + angle * 0.15,
        y: 0.5 - 0.1 * (i + 1),
        z: 0.01 * i
      });
    }
    
    // Middle finger (4 points)
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.5 + angle * 0.15,
        y: 0.5 - 0.12 * (i + 1),
        z: 0.01 * i
      });
    }
    
    // Ring finger (4 points)
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.5 + 0.05 + angle * 0.15,
        y: 0.5 - 0.1 * (i + 1),
        z: 0.01 * i
      });
    }
    
    // Pinky (4 points)
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.5 + 0.1 * (i + 1) + angle * 0.1,
        y: 0.5 - 0.08 * (i + 1),
        z: 0.01 * i
      });
    }
    
    frames.push({
      frame: frameNum,
      timestamp: timestamp,
      hands: [{
        handedness: 'right',
        landmarks: landmarks
      }]
    });
  }
  
  return {
    fps: fps,
    duration: duration,
    total_frames: totalFrames,
    frames: frames
  };
}

function generateThumbsUpAnimation() {
  const fps = 30;
  const duration = 1.5;
  const totalFrames = Math.floor(fps * duration);
  
  const frames = [];
  
  for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
    const timestamp = frameNum / fps;
    const progress = Math.min(1.0, timestamp / 1.0);
    
    const landmarks = [];
    
    // Wrist
    landmarks.push({ x: 0.5, y: 0.6, z: 0.0 });
    
    // Thumb - extends upward
    const thumbExtension = progress * 0.2;
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.45,
        y: 0.6 - thumbExtension * (i + 1),
        z: 0.02 * i
      });
    }
    
    // Other fingers - curl inward
    const curl = progress * 0.1;
    
    // Index
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.48 + curl,
        y: 0.6 + 0.05 * (i + 1),
        z: -0.05 * i * progress
      });
    }
    
    // Middle
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.5 + curl,
        y: 0.6 + 0.05 * (i + 1),
        z: -0.05 * i * progress
      });
    }
    
    // Ring
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.52 + curl,
        y: 0.6 + 0.05 * (i + 1),
        z: -0.05 * i * progress
      });
    }
    
    // Pinky
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.54 + curl,
        y: 0.6 + 0.04 * (i + 1),
        z: -0.05 * i * progress
      });
    }
    
    frames.push({
      frame: frameNum,
      timestamp: timestamp,
      hands: [{
        handedness: 'right',
        landmarks: landmarks
      }]
    });
  }
  
  return {
    fps: fps,
    duration: duration,
    total_frames: totalFrames,
    frames: frames
  };
}

function generatePeaceSignAnimation() {
  const fps = 30;
  const duration = 1.5;
  const totalFrames = Math.floor(fps * duration);
  
  const frames = [];
  
  for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
    const timestamp = frameNum / fps;
    const progress = Math.min(1.0, timestamp / 1.0);
    
    const landmarks = [];
    
    // Wrist
    landmarks.push({ x: 0.5, y: 0.6, z: 0.0 });
    
    // Thumb - curled
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.45 + 0.02 * i,
        y: 0.6 + 0.02 * i,
        z: -0.03 * i
      });
    }
    
    // Index - extended up and left
    const spread = progress * 0.08;
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.48 - spread * (i + 1),
        y: 0.6 - 0.08 * (i + 1),
        z: 0.01 * i
      });
    }
    
    // Middle - extended up and right
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.52 + spread * (i + 1),
        y: 0.6 - 0.08 * (i + 1),
        z: 0.01 * i
      });
    }
    
    // Ring - curled
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.52,
        y: 0.6 + 0.03 * (i + 1),
        z: -0.04 * i * progress
      });
    }
    
    // Pinky - curled
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: 0.54,
        y: 0.6 + 0.03 * (i + 1),
        z: -0.04 * i * progress
      });
    }
    
    frames.push({
      frame: frameNum,
      timestamp: timestamp,
      hands: [{
        handedness: 'right',
        landmarks: landmarks
      }]
    });
  }
  
  return {
    fps: fps,
    duration: duration,
    total_frames: totalFrames,
    frames: frames
  };
}

module.exports = {
  generateWaveAnimation,
  generateThumbsUpAnimation,
  generatePeaceSignAnimation
};
