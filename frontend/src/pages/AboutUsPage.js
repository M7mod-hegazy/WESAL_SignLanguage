import React from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme/designSystem';
import BottomNav from '../components/BottomNav';

const AboutUsPage = () => {
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
        background: '#F5F5F0',
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

        {/* Orange Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #F18A21 0%, #F8B817 100%)',
          padding: '60px 20px 80px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Wave at Bottom */}
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            right: 0,
            height: '60px',
            background: '#FFF9F0',
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0'
          }} />

          {/* About Us Image */}
          <div style={{
            width: '350px',
            height: '200px',
            margin: '0 auto',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden'
          }}>
            <img 
              src="/aboutUs.png" 
              alt="About Us"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '30px'
              }}
            />
          </div>
        </div>

        {/* Content Section */}
        <div style={{
          flex: 1,
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#FFF9F0',
          overflowY: 'auto'
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: '28px',
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.primary.blue,
            fontFamily: theme.typography.fonts.primary,
            margin: '0 0 20px 0',
            textAlign: 'center'
          }}>من نحن؟</h1>

          {/* About Text */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            textAlign: 'right',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.orange,
              fontFamily: theme.typography.fonts.primary,
              margin: '0 0 15px 0'
            }}>وصال</h2>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#333',
              fontFamily: theme.typography.fonts.primary,
              margin: '0 0 15px 0'
            }}>
              وصال هي شركة سعودية رائدة متخصصة في تطوير حلول تقنية مبتكرة لخدمة المجتمع وتمكين ذوي الاحتياجات الخاصة.
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#333',
              fontFamily: theme.typography.fonts.primary,
              margin: '0 0 15px 0'
            }}>
              نؤمن بأن التواصل حق للجميع، ونسعى لبناء جسور التواصل بين الصم والمجتمع من خلال تقنيات حديثة وسهلة الاستخدام.
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#333',
              fontFamily: theme.typography.fonts.primary,
              margin: '0'
            }}>
              رؤيتنا هي مجتمع شامل يتواصل فيه الجميع بسهولة ويسر، ونعمل على تحقيق ذلك من خلال منصتنا التعليمية التفاعلية لتعلم لغة الإشارة.
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default AboutUsPage;
