import React, { useState } from 'react';
import { register, loginGoogle } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAsGuest } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!displayName || !displayName.trim()) {
      setError('الرجاء إدخال الاسم');
      return;
    }

    if (!email || !email.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('البريد الإلكتروني غير صالح');
      return;
    }

    if (!password || password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, password, displayName, gender);
      console.log('Registration successful:', result);
      
      // Only navigate if registration was successful
      if (result && result.user) {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle specific Firebase errors
      let errorMessage = 'فشل إنشاء الحساب';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صالح';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جداً';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'التسجيل غير مفعل';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await loginGoogle();
      console.log('Google registration successful:', result);
      
      if (result && result.user) {
        navigate('/');
      }
    } catch (err) {
      console.error('Google registration error:', err);
      
      let errorMessage = 'فشل التسجيل بجوجل';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'تم إلغاء التسجيل';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/home');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>إنشاء حساب جديد</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={styles.input}
            required
            dir="rtl"
          />

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            dir="rtl"
          />

          {/* Gender Selection */}
          <div style={styles.genderContainer}>
            <label style={styles.genderLabel}>اختر الأيقونة:</label>
            <div style={styles.genderButtons}>
              <button
                type="button"
                onClick={() => setGender('male')}
                style={{
                  ...styles.genderButton,
                  ...(gender === 'male' ? styles.genderButtonActive : {})
                }}
              >
                <img 
                  src="/pages/home_maleIcon.png"
                  alt="Male"
                  style={styles.genderIcon}
                />
                <span>ذكر</span>
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                style={{
                  ...styles.genderButton,
                  ...(gender === 'female' ? styles.genderButtonActive : {})
                }}
              >
                <img 
                  src="/pages/home_femaleIcon.png"
                  alt="Female"
                  style={styles.genderIcon}
                />
                <span>أنثى</span>
              </button>
            </div>
          </div>

          <input
            type="password"
            placeholder="كلمة المرور (6 أحرف على الأقل)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            minLength={6}
            dir="rtl"
          />

          <input
            type="password"
            placeholder="تأكيد كلمة المرور"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
            minLength={6}
            dir="rtl"
          />

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
          </button>
        </form>

        <div style={styles.divider}>
          <span>أو</span>
        </div>

        <button 
          onClick={handleGoogleRegister}
          style={{...styles.socialButton, ...styles.googleButton}}
          disabled={loading}
        >
          🔍 التسجيل بجوجل
        </button>

        <div style={styles.divider}>
          <span>أو جرب أولاً</span>
        </div>

        <button 
          onClick={handleGuestLogin}
          style={styles.guestButton}
          disabled={loading}
        >
          👤 العب كضيف
        </button>

        <p style={styles.footer}>
          لديك حساب بالفعل؟ <a href="/login" style={styles.link}>تسجيل الدخول</a>
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
  socialButton: {
    padding: '12px',
    fontSize: '16px',
    fontFamily: 'Harmattan, sans-serif',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
    color: '#FFFFFF',
    width: '100%'
  },
  googleButton: {
    background: '#DB4437'
  },
  guestButton: {
    padding: '15px',
    fontSize: '18px',
    fontFamily: 'Harmattan, sans-serif',
    fontWeight: 'bold',
    background: '#F6B03F',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background 0.3s',
    width: '100%',
    marginTop: '15px'
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
  },
  genderContainer: {
    marginBottom: '15px',
    marginTop: '10px'
  },
  genderLabel: {
    display: 'block',
    marginBottom: '12px',
    fontSize: '18px',
    color: '#005593',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  genderButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  genderButton: {
    background: '#FFFFFF',
    border: '2px solid #A4C8E2',
    borderRadius: '12px',
    padding: '15px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    fontFamily: 'Harmattan, sans-serif',
    color: '#005593'
  },
  genderButtonActive: {
    background: 'linear-gradient(135deg, #F18A21 0%, #F8B817 100%)',
    border: '2px solid #F18A21',
    color: '#FFFFFF'
  },
  genderIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  }
};

export default RegisterPage;
