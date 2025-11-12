import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme/designSystem';
import BottomNav from '../components/BottomNav';
import MessageSentPage from './MessageSentPage';

const ContactUsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  // Show success page after submission
  if (isSubmitted) {
    return <MessageSentPage onBack={() => navigate('/home')} />;
  }

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

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '80px 30px 30px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header with Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '40px'
          }}>
            {/* Message Icon */}
           

            {/* Title */}
            <h1 style={{
              fontSize: '26px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.blue,
              fontFamily: theme.typography.fonts.primary,
              margin: 0
            }}>تواصل معنا !</h1>
             <img 
              src="/pages/messageIcon.png" 
              alt="Message"
              style={{
                width: '60px',
                height: '60px',
                display: 'block'
              }}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1
          }}>
            {/* Name Input */}
            <input
              type="text"
              placeholder="اسم المستخدم"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '15px',
                fontFamily: theme.typography.fonts.primary,
                color: theme.colors.primary.blue,
                background: 'white',
                border: `2px solid ${theme.colors.primary.blue}`,
                borderRadius: '12px',
                textAlign: 'right',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* Email Input */}
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '15px',
                fontFamily: theme.typography.fonts.primary,
                color: theme.colors.primary.blue,
                background: 'white',
                border: `2px solid ${theme.colors.primary.blue}`,
                borderRadius: '12px',
                textAlign: 'right',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* Message Textarea */}
            <textarea
              placeholder="اكتب رسالتك"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={6}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '15px',
                fontFamily: theme.typography.fonts.primary,
                color: theme.colors.primary.blue,
                background: 'white',
                border: `2px solid ${theme.colors.primary.blue}`,
                borderRadius: '12px',
                textAlign: 'right',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* Submit Button */}
            <button 
              type="submit"
              style={{
                background: theme.colors.primary.orange,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 40px',
                fontSize: '16px',
                fontWeight: theme.typography.weights.bold,
                fontFamily: theme.typography.fonts.primary,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(241, 138, 33, 0.3)',
                transition: 'all 0.3s ease',
                marginTop: '10px'
              }}
            >
              أرسل رسالتك
            </button>
          </form>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default ContactUsPage;
