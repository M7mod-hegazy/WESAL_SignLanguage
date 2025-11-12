import React, { useEffect, useState } from 'react';
import theme from '../theme/designSystem';

const MessageSentPage = ({ onBack }) => {
  const [isFlying, setIsFlying] = useState(false);

  useEffect(() => {
    // Start flying animation when component mounts
    setIsFlying(true);
    
    // Create Audio Context for generating sounds
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Play simple pop sound at start
    const playPop = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };
    
    // Play simple success beep
    const playSuccess = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    };
    
    playPop();
    
    setTimeout(() => {
      playSuccess();
    }, 1500); // Match animation duration
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes flyFromBottom {
            0% {
              transform: translateY(300px) scale(0.5) translatex(-300px);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateY(0) scale(1) translatex(0);
              opacity: 1;
            }
          }
        `}
      </style>
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
        overflow: 'hidden',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 20px',
        maxWidth: '480px'
      }}>
        {/* Back Button */}
        <button
          onClick={onBack}
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
              height: '24px',
              display: 'block'
            }}
          />
        </button>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '80px 30px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '30px'
        }}>
          {/* Message Icon */}
          <img 
            src="/pages/messageIcon.png" 
            alt="Message Sent"
            style={{
              width: '120px',
              height: '120px',
              display: 'block',
              animation: isFlying ? 'flyFromBottom 1.5s ease-out forwards' : 'none',
              position: 'relative',
              zIndex: 1000
            }}
          />

          {/* Title */}
          <h1 style={{
            fontSize: '24px',
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.primary.blue,
            fontFamily: theme.typography.fonts.primary,
            margin: 0,
            textAlign: 'center'
          }}>رسالتك وصلتنا</h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '16px',
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.primary.blue,
            fontFamily: theme.typography.fonts.primary,
            margin: 0,
            textAlign: 'center',
            lineHeight: '1.6'
          }}>لا تشيل هم قريبين منك انتظر الرد!</p>

          {/* Back to Home Button */}
          <button 
            onClick={onBack}
            style={{
              background: theme.colors.primary.orange,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 40px',
              fontSize: '16px',
              fontWeight: theme.typography.weights.bold,
              fontFamily: theme.typography.fonts.primary,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(241, 138, 33, 0.3)',
              transition: 'all 0.3s ease',
              marginTop: '20px'
            }}
          >
            الرجوع للصفحة الرئيسية
          </button>
        </div>

        {/* Bottom Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          background: '#FFE5CC',
          borderTop: 'none',
          position: 'sticky',
          bottom: 0,
          zIndex: 100
        }}>
          {/* Settings */}
          <button style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}>
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
          <button style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}>
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

          {/* Home - Not Active */}
          <button 
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              transition: 'all 0.3s ease'
            }}
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
    </div>
    </>
  );
};

export default MessageSentPage;
