import React from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme/designSystem';
import BottomNav from '../components/BottomNav';

const SoloModePage = ({ onBack, onSelectMode, onHome, onNotifications }) => {
  const navigate = useNavigate();
  const modes = [
    { id: 'questions', title: 'تحدي الأسئلة', type: 'questions' },
    { id: 'simulation', title: 'تحدي المحاكاة', type: 'simulation' }
  ];

  return (
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
        overflow: 'auto',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 20px',
        maxWidth: '480px'
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            zIndex: 10,
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
          {/* Mode Buttons */}
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                if (mode.type === 'simulation') {
                  navigate('/simulation');
                } else {
                  navigate('/quiz', { state: { mode: 'solo', type: mode.type } });
                }
              }}
              style={{
                width: '100%',
                maxWidth: '320px',
                background: 'white',
                border: `3px solid ${theme.colors.primary.orange}`,
                borderRadius: '20px',
                padding: '30px 40px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(241, 138, 33, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span style={{
                fontSize: '24px',
                fontWeight: theme.typography.weights.bold,
                color: theme.colors.primary.orange,
                fontFamily: theme.typography.fonts.primary
              }}>{mode.title}</span>
            </button>
          ))}
        </div>
        
        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default SoloModePage;
