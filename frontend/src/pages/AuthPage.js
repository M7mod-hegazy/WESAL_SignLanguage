import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, loginGoogle, loginFacebook, loginTwitter } from '../services/authService';
import WelcomeNotification from '../components/WelcomeNotification';
import theme from '../theme/designSystem';

const AuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password) {
      setError('الرجاء ملء جميع الحقول');
      return;
    }

    if (activeTab === 'signup') {
      if (!displayName) {
        setError('الرجاء إدخال الاسم');
        return;
      }
      if (!gender) {
        setError('الرجاء اختيار الأيقونة');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمات المرور غير متطابقة');
        return;
      }
      if (password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }
    }

    setLoading(true);

    try {
      let result;
      if (activeTab === 'login') {
        result = await login(email, password);
      } else {
        result = await register(email, password, displayName, gender);
      }
      
      // Show welcome notification
      const username = result.user?.displayName || displayName || email.split('@')[0];
      setWelcomeUsername(username);
      setShowWelcome(true);
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/home');
      }, 500);
    } catch (err) {
      console.log('⚠️ خطأ في المصادقة');
      let errorMessage = 'حدث خطأ، الرجاء المحاولة مرة أخرى';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'البريد الإلكتروني غير مسجل';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'كلمة المرور غير صحيحة';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جداً';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صالح';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'تحقق من اتصال الإنترنت';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);
    
    try {
      let result;
      if (provider === 'google') {
        result = await loginGoogle();
      } else if (provider === 'facebook') {
        result = await loginFacebook();
      } else if (provider === 'twitter') {
        result = await loginTwitter();
      }
      
      // Show welcome notification
      const username = result.user?.displayName || result.user?.email?.split('@')[0] || 'مستخدم';
      setWelcomeUsername(username);
      setShowWelcome(true);
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/home');
      }, 500);
    } catch (err) {
      console.log('⚠️ خطأ في تسجيل الدخول الاجتماعي');
      setError('حدث خطأ، الرجاء المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {/* Welcome Notification */}
      {showWelcome && (
        <WelcomeNotification 
          username={welcomeUsername}
          onClose={() => setShowWelcome(false)}
        />
      )}
      
      <div style={{
        minHeight: '100vh',
        background: theme.colors.background.cream,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        background: theme.colors.background.cream,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        direction: 'rtl',
        fontFamily: theme.typography.fonts.secondary,
        boxShadow: '0 0 20px rgba(0,0,0,0.1)'
      }}>
      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        background: '#E8B88F',
        borderRadius: '50px',
        padding: '8px',
        marginBottom: '40px',
        width: '90%',
        maxWidth: '400px'
      }}>
        {/* Login Tab */}
        <button
          onClick={() => setActiveTab('login')}
          style={{
            flex: 1,
            padding: '12px 20px',
            background: activeTab === 'login' ? theme.colors.primary.orange : 'transparent',
            color: theme.colors.text.white,
            border: 'none',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: theme.typography.weights.bold,
            fontFamily: theme.typography.fonts.primary,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          تسجيل الدخول
        </button>

        {/* Signup Tab */}
        <button
          onClick={() => setActiveTab('signup')}
          style={{
            flex: 1,
            padding: '12px 20px',
            background: activeTab === 'signup' ? theme.colors.primary.orange : 'transparent',
            color: theme.colors.text.white,
            border: 'none',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: theme.typography.weights.bold,
            fontFamily: theme.typography.fonts.primary,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          سجل الآن
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          width: '90%',
          maxWidth: '400px',
          background: '#ffebee',
          color: '#c62828',
          padding: '12px',
          borderRadius: '10px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Welcome Message */}
      <h1 style={{
        fontSize: '32px',
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary.blue,
        margin: '0 0 10px 0',
        fontFamily: theme.typography.fonts.primary
      }}>
        {activeTab === 'login' ? 'مرحباً من جديد!' : 'مرحباً بك!'}
      </h1>

      <p style={{
        fontSize: '16px',
        color: theme.colors.text.secondary,
        margin: '0 0 30px 0',
        fontFamily: theme.typography.fonts.secondary
      }}>
        {activeTab === 'login' ? 'تسجيل الدخول لحسابك' : 'تسجيل حساب جديد'}
      </p>

      {/* Form Container */}
      <div style={{
        width: '90%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Name Input (Signup only) */}
        {activeTab === 'signup' && (
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px',
              border: `2px solid ${theme.colors.primary.blue}`,
              borderRadius: '15px',
              fontSize: '16px',
              fontFamily: theme.typography.fonts.secondary,
              textAlign: 'right',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />
        )}

        {/* Email Input */}
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 20px',
            border: `2px solid ${theme.colors.primary.blue}`,
            borderRadius: '15px',
            fontSize: '16px',
            fontFamily: theme.typography.fonts.secondary,
            textAlign: 'right',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="كلمة السر"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 20px',
            border: `2px solid ${theme.colors.primary.blue}`,
            borderRadius: '15px',
            fontSize: '16px',
            fontFamily: theme.typography.fonts.secondary,
            textAlign: 'right',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
        />

        {/* Confirm Password (Signup only) */}
        {activeTab === 'signup' && (
          <input
            type="password"
            placeholder="تأكيد كلمة السر"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px',
              border: `2px solid ${theme.colors.primary.blue}`,
              borderRadius: '15px',
              fontSize: '16px',
              fontFamily: theme.typography.fonts.secondary,
              textAlign: 'right',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />
        )}

        {/* Gender Selection Dropdown (Signup only) */}
        {activeTab === 'signup' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '14px 20px',
            border: `2px solid ${gender ? theme.colors.primary.orange : theme.colors.primary.blue}`,
            borderRadius: '15px',
            background: gender ? 'linear-gradient(135deg, #FFF9F0 0%, #FFFFFF 100%)' : '#FFFFFF',
            transition: 'all 0.3s ease',
            boxShadow: gender ? '0 2px 8px rgba(241, 138, 33, 0.15)' : 'none'
          }}>
            {gender ? (
              <img 
                src={gender === 'male' ? '/pages/home_maleIcon.png' : '/pages/home_femaleIcon.png'}
                alt="Gender Icon"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${theme.colors.primary.orange}`,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#E8E8E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>❓</div>
            )}
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: 'transparent',
                fontSize: '17px',
                fontFamily: theme.typography.fonts.primary,
                color: gender ? theme.colors.primary.orange : '#999',
                fontWeight: 'bold',
                textAlign: 'right',
                outline: 'none',
                cursor: 'pointer',
                direction: 'rtl',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(theme.colors.primary.blue)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 10px center',
                backgroundSize: '20px',
                paddingLeft: '35px'
              }}
            >
              <option value="" disabled>اختر الأيقونة...</option>
              <option value="male">ذكر 👨</option>
              <option value="female">أنثى 👩</option>
            </select>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px 40px',
            background: theme.colors.primary.orange,
            color: theme.colors.text.white,
            border: 'none',
            borderRadius: '50px',
            fontSize: '22px',
            fontWeight: theme.typography.weights.bold,
            fontFamily: theme.typography.fonts.primary,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(241, 138, 33, 0.4)',
            transition: 'all 0.3s ease',
            marginTop: '10px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(241, 138, 33, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 6px 20px rgba(241, 138, 33, 0.4)';
          }}
        >
          {activeTab === 'login' ? 'سجل الدخول' : 'سجل الآن'}
        </button>

        {/* Divider */}
        <div style={{
          textAlign: 'center',
          margin: '10px 0',
          color: theme.colors.text.secondary,
          fontSize: '14px'
        }}>
          {activeTab === 'login' 
            ? 'أو لم يكن لديك حساب؟ سجل الآن' 
            : 'أو سجل الدخول باستخدام:'}
        </div>

        {/* Social Login Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '10px'
        }}>
          {/* Google */}
          <button 
          onClick={() => handleSocialLogin('google')}
          disabled={loading}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: theme.colors.background.white,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '24px', height: '24px' }} />
          </button>

          {/* Facebook */}
          <button 
          onClick={() => handleSocialLogin('facebook')}
          disabled={loading}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: '#1877F2',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>f</span>
          </button>

          {/* X (Twitter) */}
          <button 
          onClick={() => handleSocialLogin('twitter')}
          disabled={loading}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: '#000000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>𝕏</span>
          </button>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default AuthPage;
