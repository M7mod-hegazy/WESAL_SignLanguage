import React from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme/designSystem';

const TutorialPage3 = () => {
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
        direction: 'rtl',
        fontFamily: theme.typography.fonts.secondary,
        boxShadow: '0 0 20px rgba(0,0,0,0.1)'
      }}>
      {/* Top Half - Image (50% height) */}
      <div style={{
        height: '50vh',
        position: 'relative',
        background: theme.colors.secondary.yellow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'visible'
      }}>
        <img 
          src="/pages/TutorialPage3.png" 
          alt="Tutorial 3"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            zIndex: 2,
            position: 'relative'
          }}
        />

        {/* Skip Button - Top Left */}
        <button
          onClick={() => navigate('/auth')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'transparent',
            border: 'none',
            color: theme.colors.text.white,
            fontSize: '28px',
            fontWeight: theme.typography.weights.bold,
            fontFamily: theme.typography.fonts.primary,
            cursor: 'pointer',
            padding: '10px 20px',
            transition: 'all 0.3s ease',
            zIndex: 3
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          تخطى
        </button>

        {/* Wave SVG Bottom */}
        <svg 
          style={{
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            width: '100%',
            height: '60px',
            zIndex: 1
          }}
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,30 Q360,0 720,30 T1440,30 L1440,60 L0,60 Z" 
            fill={theme.colors.background.cream}
          />
        </svg>
      </div>

      {/* Bottom Half - Content (50% height) */}
      <div style={{
        height: '50vh',
        background: theme.colors.background.cream,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        gap: '40px'
      }}>
        {/* Description Text */}
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '400px'
        }}>
          {/* First Line with Star */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>⭐</span>
            <p style={{
              fontSize: '20px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.blue,
              margin: 0,
              lineHeight: 1.6
            }}>
              مجتمع تواصلي داعم
            </p>
          </div>

          {/* Second Line - Orange */}
          <p style={{
            fontSize: '18px',
            color: theme.colors.primary.orange,
            margin: 0,
            lineHeight: 1.8,
            fontWeight: theme.typography.weights.medium
          }}>
            انضم إلى مجتمع يعزز الشمول
          </p>

          {/* Third Line - Orange */}
          <p style={{
            fontSize: '18px',
            color: theme.colors.primary.orange,
            margin: 0,
            lineHeight: 1.8,
            fontWeight: theme.typography.weights.medium
          }}>
            وشارك تجربتك وتعلمك مع الآخرين.
          </p>
        </div>

        {/* Next Button */}
        <div style={{
          width: '100%',
          maxWidth: '280px'
        }}>
          <button
            onClick={() => navigate('/auth')}
            style={{
              width: '100%',
              padding: '16px 40px',
              background: theme.colors.secondary.yellow,
              color: theme.colors.text.white,
              border: 'none',
              borderRadius: '50px',
              fontSize: '26px',
              fontWeight: theme.typography.weights.bold,
              fontFamily: theme.typography.fonts.primary,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(248, 184, 23, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(248, 184, 23, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(248, 184, 23, 0.4)';
            }}
          >
            التالي
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TutorialPage3;
