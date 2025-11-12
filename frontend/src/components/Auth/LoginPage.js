import React, { useState } from 'react';
import { login, loginGoogle, loginFacebook, loginTwitter } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !email.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return;
    }

    if (!password || password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      console.log('Login successful:', result);
      
      // Only navigate if login was successful
      if (result && result.user) {
        navigate('/'); // Redirect to home
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific Firebase errors
      let errorMessage = 'فشل تسجيل الدخول';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'المستخدم غير موجود';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'كلمة المرور غير صحيحة';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صالح';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'محاولات كثيرة جداً. حاول لاحقاً';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await loginGoogle();
      console.log('Google login successful:', result);
      
      // Only navigate if login was successful
      if (result && result.user) {
        navigate('/');
      }
    } catch (err) {
      console.error('Google login error:', err);
      
      let errorMessage = 'فشل تسجيل الدخول بجوجل';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'تم إلغاء تسجيل الدخول';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'تم إلغاء الطلب';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await loginFacebook();
      console.log('Facebook login successful:', result);
      
      // Only navigate if login was successful
      if (result && result.user) {
        navigate('/');
      }
    } catch (err) {
      console.error('Facebook login error:', err);
      
      let errorMessage = 'فشل تسجيل الدخول بفيسبوك';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'تم إلغاء تسجيل الدخول';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'البريد الإلكتروني مستخدم بطريقة تسجيل دخول أخرى';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTwitterLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await loginTwitter();
      console.log('Twitter login successful:', result);
      
      // Only navigate if login was successful
      if (result && result.user) {
        navigate('/');
      }
    } catch (err) {
      console.error('Twitter login error:', err);
      
      let errorMessage = 'فشل تسجيل الدخول بتويتر';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'تم إلغاء تسجيل الدخول';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>تسجيل الدخول</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleEmailLogin} style={styles.form}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            dir="rtl"
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            dir="rtl"
          />

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={styles.divider}>
          <span>أو</span>
        </div>

        <div style={styles.socialButtons}>
          <button 
            onClick={handleGoogleLogin}
            style={{...styles.socialButton, ...styles.googleButton}}
            disabled={loading}
          >
            🔍 تسجيل الدخول بجوجل
          </button>

          <button 
            onClick={handleFacebookLogin}
            style={{...styles.socialButton, ...styles.facebookButton}}
            disabled={loading}
          >
            📘 تسجيل الدخول بفيسبوك
          </button>

          <button 
            onClick={handleTwitterLogin}
            style={{...styles.socialButton, ...styles.twitterButton}}
            disabled={loading}
          >
            🐦 تسجيل الدخول بتويتر
          </button>
        </div>

        <p style={styles.footer}>
          ليس لديك حساب؟ <a href="/register" style={styles.link}>إنشاء حساب</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F5F5F0',
    fontFamily: 'Harmattan, sans-serif',
    direction: 'rtl'
  },
  card: {
    background: '#FFFFFF',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '450px'
  },
  title: {
    fontSize: '32px',
    fontFamily: 'Marhey, sans-serif',
    color: '#005593',
    textAlign: 'center',
    marginBottom: '30px'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #A4C8E2',
    borderRadius: '10px',
    fontFamily: 'Harmattan, sans-serif',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  button: {
    padding: '15px',
    fontSize: '18px',
    fontFamily: 'Harmattan, sans-serif',
    fontWeight: 'bold',
    background: '#F18A21',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background 0.3s',
    marginTop: '10px'
  },
  divider: {
    textAlign: 'center',
    margin: '25px 0',
    color: '#999',
    position: 'relative'
  },
  socialButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  socialButton: {
    padding: '12px',
    fontSize: '16px',
    fontFamily: 'Harmattan, sans-serif',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
    color: '#FFFFFF'
  },
  googleButton: {
    background: '#DB4437'
  },
  facebookButton: {
    background: '#4267B2'
  },
  twitterButton: {
    background: '#1DA1F2'
  },
  footer: {
    textAlign: 'center',
    marginTop: '25px',
    color: '#666'
  },
  link: {
    color: '#F18A21',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default LoginPage;
