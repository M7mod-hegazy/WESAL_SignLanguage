import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile as firebaseUpdateProfile, updateEmail } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../config/firebase';
import theme from '../theme/designSystem';
import axios from 'axios';

const EditProfilePage = ({ onBack, onSave }) => {
  const { user } = useAuth();
  
  // Initialize form data
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    phone: user?.phoneNumber || ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [saving, setSaving] = useState(false);

  // Check if user logged in with email/password (can edit email)
  const isEmailProvider = user?.providerData?.[0]?.providerId === 'password';
  
  // Check if user has phone number
  const hasPhone = user?.phoneNumber;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      let newPhotoURL = photoURL;

      // Upload photo to Firebase Storage if changed
      if (photoFile && storage) {
        try {
          const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${photoFile.name}`);
          await uploadBytes(storageRef, photoFile);
          newPhotoURL = await getDownloadURL(storageRef);
        } catch (storageError) {
          console.error('Storage upload error:', storageError);
          alert('تعذر رفع الصورة. سيتم حفظ التغييرات الأخرى.');
          // Continue with other updates even if photo upload fails
          newPhotoURL = photoURL; // Keep current photo
        }
      } else if (photoFile && !storage) {
        alert('خدمة رفع الصور غير متاحة حالياً. سيتم حفظ التغييرات الأخرى.');
      }

      // Update Firebase profile - Use the current auth user directly
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          console.log('Updating profile with:', { displayName: formData.displayName, photoURL: newPhotoURL });
          await firebaseUpdateProfile(currentUser, {
            displayName: formData.displayName,
            photoURL: newPhotoURL
          });
          console.log('Profile updated successfully');
        } catch (profileError) {
          console.error('Profile update error:', profileError);
          throw new Error('فشل تحديث الملف الشخصي');
        }
      }

      // Update email if changed and user is email/password provider
      if (isEmailProvider && formData.email !== user.email) {
        try {
          await updateEmail(auth.currentUser, formData.email);
          console.log('Email updated successfully');
        } catch (emailError) {
          console.error('Email update error:', emailError);
          alert('تعذر تحديث البريد الإلكتروني. قد تحتاج إلى تسجيل الدخول مرة أخرى.');
        }
      }

      // Update backend (MongoDB) - Always try this
      try {
        const token = await user.getIdToken();
        await axios.post('http://localhost:8000/api/auth/verify', {
          displayName: formData.displayName,
          photoURL: newPhotoURL,
          email: formData.email
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Backend updated successfully');
      } catch (backendError) {
        console.error('Error updating backend:', backendError);
        // Continue anyway - backend sync is not critical
      }

      // Call parent onSave callback
      if (onSave) {
        onSave({
          ...formData,
          photoURL: newPhotoURL
        });
      }

      // Reload auth user to get updated data
      try {
        await auth.currentUser.reload();
        console.log('User reloaded:', auth.currentUser.displayName, auth.currentUser.photoURL);
      } catch (reloadError) {
        console.error('Error reloading user:', reloadError);
      }
      
      alert('تم حفظ التغييرات بنجاح!');
      
      // Go back to profile page (it will fetch fresh data)
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('حدث خطأ أثناء حفظ التغييرات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF9F0',
      fontFamily: theme.typography.fonts.secondary,
      direction: 'rtl',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        background: '#FFF9F0',
        position: 'relative',
        padding: '20px'
      }}>
        {/* Back Button */}
        <button
          onClick={onBack}
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

        {/* Save/Confirm Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            padding: '5px',
            zIndex: 10,
            opacity: saving ? 0.5 : 1
          }}
        >
          {saving ? (
            <div style={{
              width: '28px',
              height: '28px',
              border: `3px solid ${theme.colors.primary.blue}`,
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <img 
              src="/pages/done.png"
              alt="Save"
              style={{
                width: '28px',
                height: '28px'
              }}
            />
          )}
        </button>

        {/* Avatar Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '60px',
          marginBottom: '40px'
        }}>
          <div style={{
            position: 'relative'
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: '#FFE8CC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {photoURL ? (
                <img 
                  src={photoURL} 
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: '#E91E63',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Camera Button */}
            <label style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              background: '#FFE8CC',
              border: `2px solid ${theme.colors.primary.orange}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <svg width="24" height="24" viewBox="0 0 24 24" fill={theme.colors.primary.orange}>
                <path d="M12 15.2c1.77 0 3.2-1.43 3.2-3.2s-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2 1.43 3.2 3.2 3.2zm0-5.2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24l1.83 2H20v12z"/>
              </svg>
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {/* Name Field */}
          <div style={{
            background: '#FFE8CC',
            borderRadius: '15px',
            padding: '15px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="أدخل الاسم"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontFamily: theme.typography.fonts.secondary,
                color: theme.colors.primary.blue,
                textAlign: 'right'
              }}
            />
            <label style={{
              fontSize: '14px',
              color: theme.colors.primary.blue,
              fontFamily: theme.typography.fonts.secondary,
              fontWeight: 'bold',
              marginLeft: '15px',
              whiteSpace: 'nowrap'
            }}>
              الاسم
            </label>
          </div>

          {/* Username Field */}
          <div style={{
            background: '#FFE8CC',
            borderRadius: '15px',
            padding: '15px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="أدخل اسم المستخدم"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontFamily: theme.typography.fonts.secondary,
                color: theme.colors.primary.blue,
                textAlign: 'right'
              }}
            />
            <label style={{
              fontSize: '14px',
              color: theme.colors.primary.blue,
              fontFamily: theme.typography.fonts.secondary,
              fontWeight: 'bold',
              marginLeft: '15px',
              whiteSpace: 'nowrap'
            }}>
              اسم المستخدم
            </label>
          </div>

          {/* Email Field - Only editable for email/password users */}
          <div style={{
            background: '#FFE8CC',
            borderRadius: '15px',
            padding: '15px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: isEmailProvider ? 1 : 0.6
          }}>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
              disabled={!isEmailProvider}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontFamily: theme.typography.fonts.secondary,
                color: theme.colors.primary.blue,
                textAlign: 'right',
                cursor: isEmailProvider ? 'text' : 'not-allowed'
              }}
            />
            <label style={{
              fontSize: '14px',
              color: theme.colors.primary.blue,
              fontFamily: theme.typography.fonts.secondary,
              fontWeight: 'bold',
              marginLeft: '15px',
              whiteSpace: 'nowrap'
            }}>
              البريد الإلكتروني
            </label>
          </div>

          {/* Phone Field - Only show if user has phone */}
          {hasPhone && (
            <div style={{
              background: '#FFE8CC',
              borderRadius: '15px',
              padding: '15px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="أدخل رقم الهاتف"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  fontFamily: theme.typography.fonts.secondary,
                  color: theme.colors.primary.blue,
                  textAlign: 'right'
                }}
              />
              <label style={{
                fontSize: '14px',
                color: theme.colors.primary.blue,
                fontFamily: theme.typography.fonts.secondary,
                fontWeight: 'bold',
                marginLeft: '15px',
                whiteSpace: 'nowrap'
              }}>
                رقم الهاتف
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
