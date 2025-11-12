import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import theme from '../theme/designSystem';
import BottomNav from '../components/BottomNav';
import { getDefaultProfileIcon } from '../utils/getProfileIcon';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, coins } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Get username from user object
  const username = user?.displayName || user?.email?.split('@')[0] || 'مستخدم';

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsProfileOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const handleLogout = async () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      try {
        await signOut(auth);
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
        alert('حدث خطأ أثناء تسجيل الخروج');
      }
    }
  };

  const handleNavigation = (page) => {
    handleClose();
    setTimeout(() => {
      navigate(`/${page}`);
    }, 300);
  };

  // Removed all conditional page rendering - now using proper React Router routes
  // Each page has its own URL and route in App.js

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(100%);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
        `}
      </style>
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      

      
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
        overflow: 'auto',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 20px',
        maxWidth: '480px',
      }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0px 0px 20px 20px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* User Profile - Right Side */}
        <button 
          onClick={() => setIsProfileOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <img 
            src={getDefaultProfileIcon(user?.photoURL, user?.gender)} 
            alt="Profile"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: `2px solid ${theme.colors.primary.orange}`,
              background: 'white'
            }}
          />
          <span style={{
            fontSize: '14px',
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.primary.blue,
            fontFamily: theme.typography.fonts.primary
          }}>{username}</span>
        </button>

        {/* Coins - Left Side */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
      
          <span style={{
            fontSize: '16px',
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.primary.blue
          }}>{coins}</span>
              <img 
            src="/coin.png" 
            alt="Coin"
            style={{
              width: '24px',
              height: '24px'
            }}
          />
        </div>
      </div>

      {/* Hero Section - Complete Image */}
      <div style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 15px',
        marginBottom: '12px'
      }}>
        <img 
          src="/pages/home_hero.png" 
          alt="Hero"
          style={{
            width: '100%',
            height: '375px',
            display: 'block',
            position: 'absolute',
            top: '-82px',
          }}
        />
      </div>

      {/* Game Modes Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#F5F5F0',
        marginTop: '300px'
      }}>
        {/* Mode Cards Container */}
        <div style={{
          maxWidth: '350px',
          margin: '0 auto',
          position: 'relative'
        }}>
          {/* Section Title - Positioned on the right */}
          <h2 style={{
            fontSize: '15px',
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.primary.blue,
            textAlign: 'right',
            fontFamily: theme.typography.fonts.primary,
            marginBottom: '10px',
            paddingRight: '10px'
          }}>الأقسام</h2>

          {/* Mode Cards - Using Images */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '25px',
            marginBottom: '20px'
          }}>
          {/* Group Mode - Right Side */}
          <button
            onClick={() => navigate('/team')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
              <img 
                src="/pages/home_bluegroub.png" 
                alt="Group"
                style={{
                  width: '100%',
                  maxWidth: '155px',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <span style={{
                fontSize: '12px',
                fontWeight: theme.typography.weights.regular,
                color: theme.colors.primary.blue,
                fontFamily: theme.typography.fonts.primary
              }}>فريق</span>
            </div>
          </button>

          {/* Solo Mode - Left Side */}
          <button
            onClick={() => navigate('/solo')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src="/pages/home_yellowAlone.png" 
                alt="Solo"
                style={{
                  width: '100%',
                  maxWidth: '155px',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <span style={{
                fontSize: '12px',
                fontWeight: theme.typography.weights.regular,
                color: theme.colors.primary.blue,
                fontFamily: theme.typography.fonts.primary
              }}>فردي</span>
            </div>
          </button>
          </div>
        </div>

        {/* Community Section - Using Complete Image */}
        <div style={{ position: 'relative', maxWidth: '350px', margin: '0 auto' }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.primary.blue,
            fontFamily: theme.typography.fonts.primary,
            textAlign: 'right'
          }}>المجتمع</h3>
          <button
            onClick={() => navigate('/community')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              width: '100%',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <img 
              src="/pages/home_commuinity.png" 
              alt="Community"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              
              }}
            />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Profile Sidebar Overlay */}
      {isProfileOpen && (
        <>
          {/* Dark Overlay with Blur */}
          <div 
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              zIndex: 999,
              animation: isClosing ? 'fadeOut 0.3s ease' : 'fadeIn 0.3s ease'
            }}
          />
          
          {/* Profile Sidebar */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: 0,
            width: '50%',
            borderRadius: '35px 0px 0px 35px',
            maxWidth: '360px',
            height: '90%',
            background: '#FFF9F0',
            zIndex: 1000,
            boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
            animation: isClosing ? 'slideOutRight 0.3s ease' : 'slideInRight 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            direction: 'rtl',
            fontFamily: theme.typography.fonts.secondary
          }}>
            {/* Close Button - Back Arrow */}
            <button
              onClick={handleClose}
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
                  height: '24px'
                }}
              />
            </button>

            {/* Profile Section */}
            <button
              onClick={() => handleNavigation('profile')}
              style={{
                padding: '30px 20px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <img 
                src={getDefaultProfileIcon(user?.photoURL, user?.gender)}
                alt="Profile"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${theme.colors.primary.orange}`
                }}
              />
              <h2 style={{
                fontSize: '16px',
                fontWeight: theme.typography.weights.bold,
                color: theme.colors.primary.blue,
                fontFamily: theme.typography.fonts.primary,
                margin: 0
              }}>{username}</h2>
              <div style={{
                width: '100px',
                height: '3px',
                background: theme.colors.primary.orange,
                borderRadius: '2px'
              }} />
              <p style={{
                fontSize: '11px',
                color: theme.colors.primary.blue,
                fontFamily: theme.typography.fonts.secondary,
                margin: 0,
                opacity: 0.7
              }}>الملف الشخصي</p>
            </button>

            {/* Menu Items */}
            <div style={{
              flex: 1,
              padding: '20px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {/* Menu List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '25px',
                alignItems: 'flex-start'
              }}>
                {/* Main Page Link */}
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  gap: '10px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: theme.colors.primary.orange
                  }}>●</span>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: theme.typography.weights.medium,
                    color: theme.colors.primary.blue,
                    fontFamily: theme.typography.fonts.primary
                  }}>الصفحة الرئيسية</span>
                </button>

                {/* Notifications */}
                <button 
                  onClick={() => handleNavigation('notifications')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    gap: '10px'
                  }}
                >
                  <span style={{
                    fontSize: '12px',
                    color: theme.colors.primary.orange
                  }}>●</span>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: theme.typography.weights.medium,
                    color: theme.colors.primary.blue,
                    fontFamily: theme.typography.fonts.primary
                  }}>إشعارات</span>
                </button>

                {/* Who Are We */}
                <button 
                  onClick={() => handleNavigation('about')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    gap: '10px'
                  }}
                >
                  <span style={{
                    fontSize: '12px',
                    color: theme.colors.primary.orange
                  }}>●</span>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: theme.typography.weights.medium,
                    color: theme.colors.primary.blue,
                    fontFamily: theme.typography.fonts.primary
                  }}>من نحن؟</span>
                </button>

                {/* Contact Us */}
                <button 
                  onClick={() => handleNavigation('contact')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    gap: '10px'
                  }}
                >
                  <span style={{
                    fontSize: '12px',
                    color: theme.colors.primary.orange
                  }}>●</span>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: theme.typography.weights.medium,
                    color: theme.colors.primary.blue,
                    fontFamily: theme.typography.fonts.primary
                  }}>تواصل معنا</span>
                </button>
              </div>
              <button 
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '20px 0',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span style={{
                  fontSize: '15px',
                  fontWeight: theme.typography.weights.bold,
                  color: theme.colors.primary.orange,
                  fontFamily: theme.typography.fonts.primary
                }}>تسجيل الخروج</span>
                <img 
                  src="/pages/signout.png" 
                  alt="Sign Out"
                  style={{
                    width: '16px',
                    height: '16px',
                    display: 'block'
                  }}
                />
              </button>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
    </>
  );
};

export default HomePage;
