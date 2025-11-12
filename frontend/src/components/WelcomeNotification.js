import React, { useEffect, useState } from 'react';
import theme from '../theme/designSystem';

const WelcomeNotification = ({ username, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      opacity: isVisible && !isClosing ? 1 : 0,
      transform: isVisible && !isClosing ? 'translateY(0)' : 'translateY(-35px)',
      transition: 'all 0.3s ease',
      pointerEvents: isClosing ? 'none' : 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, ' + theme.colors.primary.orange + ' 0%, ' + theme.colors.secondary.yellow + ' 100%)',
        padding: '20px 30px',
        borderRadius: '15px',
        boxShadow: '0 8px 25px rgba(241, 138, 33, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        minWidth: '300px',
        direction: 'rtl',
        border: `3px solid ${theme.colors.primary.blue}`
      }}>
        {/* Welcome Icon */}
        <div style={{
          width: '50px',
          height: '50px',
          background: theme.colors.background.white,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px'
        }}>
          👋
        </div>

        {/* Message */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: theme.typography.weights.bold,
            fontFamily: theme.typography.fonts.primary,
            color: theme.colors.text.white,
            marginBottom: '5px'
          }}>
            مرحباً {username}!
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            fontFamily: theme.typography.fonts.secondary,
            color: theme.colors.text.white,
            opacity: 0.9
          }}>
            تم تسجيل الدخول بنجاح
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.colors.text.white,
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px',
            lineHeight: 1,
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.8'}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default WelcomeNotification;
