import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import theme from '../theme/designSystem';
import TeamPlayersPage from './TeamPlayersPage';
import BottomNav from '../components/BottomNav';

const TeamPage = ({ onBack, onHome, onNotifications }) => {
  const navigate = useNavigate();
  const { coins, subtractCoins } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showPlayersPage, setShowPlayersPage] = useState(false);

  const teamCards = [
    { id: 1, image: '/pages/TeamPage/team1.png', title: 'مشاعر وحالات', locked: false },
    { id: 2, image: '/pages/TeamPage/team2.png', title: 'مهن ووظائف', locked: true },
    { id: 3, image: '/pages/TeamPage/team3.png', title: 'مصطلحات طبية', locked: true },
    { id: 4, image: '/pages/TeamPage/team4.png', title: 'أماكن عامة', locked: true },
    { id: 5, image: '/pages/TeamPage/team5.png', title: 'أشياء/أدوات', locked: true },
    { id: 6, image: '/pages/TeamPage/team6.png', title: 'أنشطة يومية', locked: true }
  ];

  const handleCardClick = (card) => {
    if (card.locked) {
      setSelectedCard(card);
      setShowModal(true);
    } else {
      setSelectedCard(card);
      setShowPlayersPage(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  const handleBackFromPlayers = () => {
    setShowPlayersPage(false);
    setSelectedCard(null);
  };

  const handleStartGame = (players) => {
    // Navigate to spin page with players
    navigate('/team-spin', {
      state: {
        players: players,
        timeLimit: 30
      }
    });
  };


  // Spin page is now a separate route, no need to render it here

  // Show players page if unlocked card was clicked
  if (showPlayersPage && selectedCard) {
    return (
      <TeamPlayersPage 
        onBack={handleBackFromPlayers}
        onStartGame={handleStartGame}
        categoryTitle={selectedCard.title}
        onHome={onHome}
        onNotifications={onNotifications}
      />
    );
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
        {/* Header Image with Overlays */}
        <div style={{
          position: 'relative',
          width: '100%'
        }}>
          <img 
            src="/pages/TeamPage/teamHero.png" 
            alt="Team Challenge Header"
            style={{
              width: '100%',
              height: '90px',
              display: 'block'
            }}
          />
          
          {/* Coin Display Overlay - Left Side */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10
          }}>
            <img 
              src="/pages/TeamPage/teamCoin.png" 
              alt="Coin"
              style={{
                width: '30px',
                height: '30px'
              }}
            />
            <span style={{
              fontSize: '18px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.blue,
              fontFamily: theme.typography.fonts.primary
            }}>{coins}</span>
          </div>

          {/* Back Button Overlay - Right Side */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              zIndex: 10,
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
        </div>

        {/* Content - Cards Grid */}
        <div style={{
          flex: 1,
          padding: '20px 10px 80px 10px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          alignContent: 'start'
        }}>
          {teamCards.map((card) => (
            <div
              key={card.id}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <button
                onClick={() => handleCardClick(card)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  width: '140px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img 
                  src={card.image}
                  alt={card.title}
                  style={{
                    width: '140px',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '20px'
                  }}
                />
              </button>
            </div>
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
                  alt="Coin"
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

export default TeamPage;
