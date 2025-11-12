import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei';

// Component to render the 3D character
function CharacterModel({ animationData, isPlaying }) {
  const modelRef = useRef();
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameRef = useRef(0);

  // Load the GLB model using useGLTF hook from drei
  const gltf = useGLTF('/models/character.glb');
  const loadedScene = gltf.scene;

  // Animate the character's hands based on MediaPipe data
  useFrame((state, delta) => {
    if (!loadedScene || !isPlaying || !animationData || !animationData.frames) return;

    const fps = animationData.fps || 30;
    const frameTime = 1 / fps;
    
    frameRef.current += delta;
    
    if (frameRef.current >= frameTime) {
      frameRef.current = 0;
      setCurrentFrame((prev) => {
        const nextFrame = prev + 1;
        return nextFrame >= animationData.frames.length ? 0 : nextFrame;
      });
    }

    // Get current frame data
    const frameData = animationData.frames[currentFrame];
    if (!frameData || !frameData.hands) return;

    // Here you would map the hand landmarks to the character's hand bones
    // This requires knowing the bone structure of your GLB model
    // For now, we'll just make the character visible and positioned correctly
    
    // Optional: Add subtle breathing animation
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <primitive 
      ref={modelRef}
      object={loadedScene} 
      scale={1.5}
      position={[0, -1.5, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// Main 3D Character Component
const Character3D = ({ animationData, isPlaying, loop = true }) => {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      borderRadius: '50%',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 100%)'
    }}>
      <Canvas
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8}
          castShadow
        />
        <pointLight position={[-5, 5, -5]} intensity={0.4} />
        <spotLight 
          position={[0, 10, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.5}
          castShadow
        />

        {/* Camera */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 5]} 
          fov={50}
        />

        {/* Character with Suspense for loading */}
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 2, 0.5]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        }>
          <CharacterModel 
            animationData={animationData}
            isPlaying={isPlaying}
          />
        </Suspense>

        {/* Optional: Allow user to rotate view */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default Character3D;
