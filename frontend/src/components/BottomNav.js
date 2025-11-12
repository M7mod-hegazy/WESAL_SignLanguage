import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      background: '#FFE5CC',
      borderTop: 'none',
      padding: '15px 0',
      position: 'sticky',
      bottom: 0,
      zIndex: 100
    }}>
      {/* Settings */}
      <button 
        onClick={() => navigate('/settings')}
        style={{
          background: location.pathname === '/settings' ? 'rgb(245, 245, 240)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: location.pathname === '/settings' ? '10px' : '8px',
          transition: 'all 0.3s ease',
          borderRadius: location.pathname === '/settings' ? '50%' : '0',
          transform: location.pathname === '/settings' ? 'translateY(-35px)' : 'translateY(0)',
          width: location.pathname === '/settings' ? '52px' : 'auto',
          height: location.pathname === '/settings' ? '52px' : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (location.pathname !== '/settings') {
            e.currentTarget.style.transform = 'scale(1.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (location.pathname !== '/settings') {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
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
      <button 
        onClick={() => navigate('/notifications')}
        style={{
          background: location.pathname === '/notifications' ? 'rgb(245, 245, 240)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: location.pathname === '/notifications' ? '10px' : '8px',
          transition: 'all 0.3s ease',
          borderRadius: location.pathname === '/notifications' ? '50%' : '0',
          transform: location.pathname === '/notifications' ? 'translateY(-35px)' : 'translateY(0)',
          width: location.pathname === '/notifications' ? '52px' : 'auto',
          height: location.pathname === '/notifications' ? '52px' : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (location.pathname !== '/notifications') {
            e.currentTarget.style.transform = 'scale(1.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (location.pathname !== '/notifications') {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
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

      {/* Home */}
      <button 
        onClick={() => navigate('/home')}
        style={{
          background: location.pathname === '/home' ? 'rgb(245, 245, 240)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: location.pathname === '/home' ? '10px' : '8px',
          transition: 'all 0.3s ease',
          borderRadius: location.pathname === '/home' ? '50%' : '0',
          transform: location.pathname === '/home' ? 'translateY(-35px)' : 'translateY(0)',
          width: location.pathname === '/home' ? '52px' : 'auto',
          height: location.pathname === '/home' ? '52px' : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (location.pathname !== '/home') {
            e.currentTarget.style.transform = 'scale(1.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (location.pathname !== '/home') {
            e.currentTarget.style.transform = 'scale(1)';
          }
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
  );
};

export default BottomNav;
