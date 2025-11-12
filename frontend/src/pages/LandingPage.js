import React from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme/designSystem';

const LandingPage = () => {
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
        maxWidth: '480px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#F5F5F0',
        padding: '40px 20px',
        direction: 'rtl',
        fontFamily: theme.typography.fonts.secondary,
        boxShadow: '0 0 20px rgba(0,0,0,0.1)'
      }}>
      {/* Top Spacer */}
      <div style={{ flex: 1 }}></div>

      {/* Logo and Brand Name */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        flex: 2,
        justifyContent: 'center'
      }}>
        {/* Logo */}
        <img 
          src="/icon.png" 
          alt="Logo" 
          style={{
            width: '120px',
            height: '120px',
            display: 'block'
          }}
        />
        
        {/* Brand Name */}
        <h1 style={{
          fontFamily: theme.typography.fonts.primary,
          fontSize: '48px',
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.primary.orange,
          margin: 0,
          letterSpacing: '2px'
        }}>
          وِصال
        </h1>
      </div>

      {/* Play Button */}
      <div style={{
        width: '100%',
        maxWidth: '300px',
        marginBottom: '60px'
      }}>
        <button
          onClick={() => navigate('/tutorial')}
          style={{
            width: '100%',
            padding: '18px 40px',
            background: theme.colors.primary.blue,
            color: theme.colors.text.white,
            border: 'none',
            borderRadius: '50px',
            fontSize: '24px',
            fontWeight: theme.typography.weights.bold,
            fontFamily: theme.typography.fonts.primary,
            cursor: 'pointer',
            boxShadow: theme.shadows.lg,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = theme.shadows.xl;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = theme.shadows.lg;
          }}
        >
          !العب
        </button>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        paddingBottom: '20px'
      }}>
        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: theme.colors.primary.orange,
          margin: 0,
          textAlign: 'center',
          fontFamily: theme.typography.fonts.secondary,
          fontWeight: theme.typography.weights.medium
        }}>
          جميع الحقوق محفوظة لتطبيق تعليم لغة الإشارة
        </p>
        
        {/* Website */}
        <p style={{
          fontSize: '14px',
          color: theme.colors.primary.orange,
          margin: 0,
          fontFamily: theme.typography.fonts.secondary
        }}>
          www.wsalopp.com
        </p>
        
        {/* Copyright */}
        <p style={{
          fontSize: '14px',
          color: theme.colors.primary.blue,
          margin: 0,
          fontFamily: theme.typography.fonts.secondary
        }}>
          ©2025
        </p>
      </div>
      </div>
    </div>
  );
};

export default LandingPage;
