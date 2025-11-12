import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import theme from '../theme/designSystem';

const SimulationModePage = ({ onBack, onHome, onNotifications, onSelectCategory }) => {
  const navigate = useNavigate();
  const { coins } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [, setSelectedCategory] = useState(null);

  const categories = [
    { 
      id: 1, 
      title: 'المقهى', 
      image: '/pages/SoloPgae/soloOpen.png',
      locked: false,
      description: 'الوصف: تطلب الطلبات المفضلة وتتعامل مع الجامع باستخدام الإشارات',
      reward: 'الوقت المتاح : ٣٠ث + ١٠ نقاط'
    },
    { 
      id: 2, 
      title: 'زيارة الطبيب', 
      image: '/pages/SoloPgae/soloClosed1.png',
      locked: true,
      description: 'الوصف: تطلب الطلبات المفضلة وتتعامل مع الطبيب باستخدام الإشارات',
      reward: 'الوقت المتاح : ٣٠ث + ١٠ نقاط'
    },
    { 
      id: 3, 
      title: 'المدرسة', 
      image: '/pages/SoloPgae/soloClosed2.png',
      locked: true,
      description: 'الوصف: تطلب الطلبات المفضلة وتتعامل مع المعلم باستخدام الإشارات',
      reward: 'الوقت المتاح : ٣٠ث + ١٠ نقاط'
    },
    { 
      id: 4, 
      title: 'السوق', 
      image: '/pages/SoloPgae/soloClosed3.png',
      locked: true,
      description: 'الوصف: تطلب الطلبات المفضلة وتتعامل مع البائع باستخدام الإشارات',
      reward: 'الوقت المتاح : ٣٠ث + ١٠ نقاط'
    },
    { 
      id: 5, 
      title: 'ركوب الحافلة', 
      image: '/pages/SoloPgae/soloClosed4.png',
      locked: true,
      description: 'الوصف: تطلب الطلبات المفضلة وتتعامل مع السائق باستخدام الإشارات',
      reward: 'الوقت المتاح : ٣٠ث + ١٠ نقاط'
    }
  ];

  const handleCategoryClick = (category) => {
    if (category.locked) {
      setSelectedCategory(category);
      setShowModal(true);
    } else {
      // Navigate to simulation quiz page
      navigate('/simulation-quiz', { 
        state: { 
          category: 'محاكاة المقهى' 
        }
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

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
        {/* Header */}
        <div style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
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

          {/* Title */}
          <div style={{
            flex: 1,
            textAlign: 'center',
            paddingRight: '30px'
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.orange,
              fontFamily: theme.typography.fonts.primary,
              margin: 0,
              lineHeight: '1.4'
            }}>
              جاهز تعيش التجربة؟<br />
              اختر الموقف وابدأ التحدي!
            </h2>
          </div>

          {/* Coin Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.blue,
              fontFamily: theme.typography.fonts.primary
            }}>{coins}</span>
            <img 
              src="/pages/TeamPage/teamCoin.png" 
              alt="Coin"
              style={{
                width: '25px',
                height: '25px'
              }}
            />
          </div>
        </div>

        {/* Content - Categories List */}
        <div style={{
          flex: 1,
          padding: '10px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto'
        }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCategoryClick(category);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img 
                src={category.image}
                alt={category.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '20px'
                }}
              />
            </button>
          ))}
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Lock Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: '#FFF9F0',
              borderRadius: '30px',
              padding: '30px 25px',
              maxWidth: '320px',
              width: '90%',
              position: 'relative',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              border: `4px solid ${theme.colors.primary.orange}`,
              direction: 'rtl',
              fontFamily: theme.typography.fonts.secondary
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              <img 
                src="/pages/TeamPage/quit.png" 
                alt="Close"
                style={{
                  width: '50px',
                  height: '50px',
                  display: 'block'
                }}
              />
            </button>

            {/* Lock Icon */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <img 
                src="/pages/TeamPage/bigLock.png" 
                alt="Locked"
                style={{
                  width: '80px',
                  height: '80px'
                }}
              />
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '18px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.blue,
              fontFamily: theme.typography.fonts.primary,
              textAlign: 'center',
              margin: '0 0 10px 0'
            }}>أوه! هذا القسم مقفول</h2>

            {/* Subtitle */}
            <p style={{
              fontSize: '14px',
              fontWeight: theme.typography.weights.medium,
              color: theme.colors.primary.blue,
              fontFamily: theme.typography.fonts.secondary,
              textAlign: 'center',
              margin: '0 0 25px 0',
              lineHeight: '1.5'
            }}>اختر طريقتك لفتحه واستعد للتحدي</p>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Buy with Coins Button */}
              <button
                style={{
                  background: theme.colors.primary.blue,
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{
                  fontSize: '14px',
                  fontWeight: theme.typography.weights.medium,
                  color: 'white',
                  fontFamily: theme.typography.fonts.primary
                }}>افتح ب 50 عملة من رصيدك</span>
                <img 
                  src="/pages/TeamPage/teamCoin.png" 
                  alt="Coin"
                  style={{
                    width: '24px',
                    height: '24px'
                  }}
                />
              </button>

              {/* Watch Ad Button */}
              <button
                style={{
                  background: theme.colors.primary.orange,
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{
                  fontSize: '14px',
                  fontWeight: theme.typography.weights.medium,
                  color: 'white',
                  fontFamily: theme.typography.fonts.primary
                }}>شاهد إعلان سريع</span>
                <img 
                  src="/pages/TeamPage/seeAds.png" 
                  alt="Ads"
                  style={{
                    width: '24px',
                    height: '24px'
                  }}
                />
              </button>

              {/* Buy Button */}
              <button
                style={{
                  background: theme.colors.secondary.yellow,
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{
                  fontSize: '14px',
                  fontWeight: theme.typography.weights.medium,
                  color: 'white',
                  fontFamily: theme.typography.fonts.primary
                }}>اشتراك الأن ٩.٩٩ شهرياً</span>
                <img 
                  src="/pages/TeamPage/buy.png" 
                  alt="Buy"
                  style={{
                    width: '24px',
                    height: '24px'
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationModePage;
