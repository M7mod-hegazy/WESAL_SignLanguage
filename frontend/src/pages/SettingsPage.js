import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import theme from '../theme/designSystem';
import BottomNav from '../components/BottomNav';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoSpeed, setVideoSpeed] = useState(() => {
    return parseFloat(localStorage.getItem('videoSpeed')) || 1;
  });
  const [gender, setGender] = useState(user?.gender || 'male');
  
  // Update gender when user data changes
  React.useEffect(() => {
    if (user?.gender) {
      setGender(user.gender);
    }
  }, [user?.gender]);
  
  // Check if user has Google photo
  const hasGooglePhoto = user?.photoURL && user.photoURL.includes('googleusercontent.com');

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

  const handleVideoSpeedChange = (speed) => {
    setVideoSpeed(speed);
    localStorage.setItem('videoSpeed', speed);
    alert(`✅ تم تغيير سرعة الفيديو إلى ${speed}x`);
  };

  const handleGenderChange = async (selectedGender) => {
    setGender(selectedGender);
    
    // Save to MongoDB
    try {
      const token = await user.getIdToken();
      await axios.put('http://localhost:8000/api/auth/update-gender', 
        { gender: selectedGender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ تم تغيير الأيقونة إلى ${selectedGender === 'male' ? 'ذكر' : 'أنثى'}`);
      // Trigger page refresh to update all icons
      window.location.reload();
    } catch (error) {
      console.error('Error updating gender:', error);
      alert('❌ فشل تحديث الأيقونة');
    }
  };

  const speedOptions = [
    { value: 0.5, label: '0.5x', icon: '🐢' },
    { value: 1, label: '1x', icon: '▶️' },
    { value: 1.5, label: '1.5x', icon: '⚡' },
    { value: 2, label: '2x', icon: '🚀' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        height: '100vh',
        background: '#FFF9F0',
        display: 'flex',
        flexDirection: 'column',
        direction: 'rtl',
        fontFamily: theme.typography.fonts.primary,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 20px',
        maxWidth: '480px'
      }}>
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

          <h1 style={{
            fontSize: '28px',
            fontWeight: theme.typography.weights.bold,
            color: 'white',
            margin: '0',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}>⚙️ الإعدادات</h1>
        </div>

        {/* Settings Content */}
        <div style={{
          flex: 1,
          padding: '30px 20px',
          overflowY: 'auto'
        }}>
          {/* Gender Selection */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.blue,
              margin: '0 0 15px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>👤</span>
              <span>اختر الأيقونة</span>
            </h2>

            {hasGooglePhoto && (
              <div style={{
                background: '#E3F2FD',
                border: '2px solid #2196F3',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#1976D2',
                  margin: 0,
                  fontFamily: theme.typography.fonts.primary,
                  lineHeight: '1.6'
                }}>
                  ℹ️ تستخدم صورة Google الخاصة بك
                  <br />
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    لا يمكن تغيير الأيقونة عند استخدام حساب Google
                  </span>
                </p>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              opacity: hasGooglePhoto ? 0.5 : 1,
              pointerEvents: hasGooglePhoto ? 'none' : 'auto'
            }}>
              <button
                onClick={() => handleGenderChange('male')}
                style={{
                  background: gender === 'male' 
                    ? 'linear-gradient(135deg, #F18A21 0%, #F8B817 100%)' 
                    : 'white',
                  color: gender === 'male' ? 'white' : theme.colors.primary.blue,
                  border: `2px solid ${gender === 'male' ? theme.colors.primary.orange : '#E8A87C'}`,
                  borderRadius: '12px',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: theme.typography.weights.bold,
                  fontFamily: theme.typography.fonts.primary,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <img 
                  src="/pages/home_maleIcon.png"
                  alt="Male"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%'
                  }}
                />
                <span>ذكر</span>
              </button>

              <button
                onClick={() => handleGenderChange('female')}
                style={{
                  background: gender === 'female' 
                    ? 'linear-gradient(135deg, #F18A21 0%, #F8B817 100%)' 
                    : 'white',
                  color: gender === 'female' ? 'white' : theme.colors.primary.blue,
                  border: `2px solid ${gender === 'female' ? theme.colors.primary.orange : '#E8A87C'}`,
                  borderRadius: '12px',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: theme.typography.weights.bold,
                  fontFamily: theme.typography.fonts.primary,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <img 
                  src="/pages/home_femaleIcon.png"
                  alt="Female"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%'
                  }}
                />
                <span>أنثى</span>
              </button>
            </div>
          </div>

          {/* Video Speed Setting */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.blue,
              margin: '0 0 15px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>🎥</span>
              <span>سرعة الفيديو</span>
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {speedOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleVideoSpeedChange(option.value)}
                  style={{
                    background: videoSpeed === option.value 
                      ? 'linear-gradient(135deg, #F18A21 0%, #F8B817 100%)' 
                      : 'white',
                    color: videoSpeed === option.value ? 'white' : theme.colors.primary.blue,
                    border: `2px solid ${videoSpeed === option.value ? theme.colors.primary.orange : '#E8A87C'}`,
                    borderRadius: '12px',
                    padding: '15px',
                    fontSize: '16px',
                    fontWeight: theme.typography.weights.bold,
                    fontFamily: theme.typography.fonts.primary,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logout Button - Sidebar Style */}
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
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
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

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default SettingsPage;
