import React from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme/designSystem';
import BottomNav from '../components/BottomNav';

const NotificationsPage = () => {
  const navigate = useNavigate();
  
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
        overflow: 'hidden',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 20px',
        maxWidth: '480px'
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
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
          {/* Bell Icon */}
          <img 
            src="/pages/newBell.png" 
            alt="Notifications"
            style={{
              width: '120px',
              height: '120px',
              display: 'block'
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
          }}>لاتوجد إشعارات حتى الان !</h1>

          {/* Back to Home Button */}
          <button 
            onClick={() => navigate('/home')}
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
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            الرجوع للصفحة الرئيسية
          </button>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default NotificationsPage;
