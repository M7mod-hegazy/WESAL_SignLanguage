import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme/designSystem';
import BottomNav from '../components/BottomNav';

const TeamPlayersPage = ({ onBack, onStartGame, categoryTitle, onHome, onNotifications }) => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState(['', '', '']);

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleAddPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, '']);
    }
  };

  const handleRemovePlayer = (index) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const handleSubmit = () => {
    const filledPlayers = players.filter(p => p.trim() !== '');
    if (filledPlayers.length > 0) {
      onStartGame && onStartGame(filledPlayers);
    } else {
      alert('الرجاء إدخال اسم لاعب واحد على الأقل');
    }
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
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: '24px',
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.primary.orange,
            fontFamily: theme.typography.fonts.primary,
            textAlign: 'center',
            margin: '0 0 40px 0'
          }}>ادخل أسماء اللاعبين</h1>

          {/* Player Input Fields */}
          <div style={{
            width: '100%',
            maxWidth: '350px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginBottom: '30px'
          }}>
            {players.map((player, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  width: '100%'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'white',
                  border: `3px solid ${theme.colors.primary.orange}`,
                  borderRadius: '20px',
                  padding: '12px 15px',
                  gap: '10px'
                }}>
                    {/* Remove Button */}
                    {players.length > 1 && (
                    <button
                      onClick={() => handleRemovePlayer(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                       <img 
                    src="/pages/TeamPage/quit.png" 
                    alt="Player"
                    style={{
                      width: '10px',
                      height: '10px'
                    }}
                  />
                    </button>
                  )}
                 
                  {/* Input Field */}
                  <input
                    type="text"
                    value={player}
                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                    placeholder="اسم اللاعب"
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '16px',
                      fontFamily: theme.typography.fonts.secondary,
                      color: theme.colors.primary.blue,
                      background: 'transparent',
                      textAlign: 'right',
                      direction: 'rtl'
                    }}
                  />

                 {/* Profile Icon */}
                 <img 
                    src="/pages/TeamPage/profile.png" 
                    alt="Player"
                    style={{
                      width: '35px',
                      height: '35px'
                    }}
                  />

                </div>
              </div>
            ))}
          </div>

          {/* Add Player Button */}
          {players.length < 6 && (
            <button
              onClick={handleAddPlayer}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '10px',
                marginBottom: '30px'
              }}
            >
              <span style={{
                fontSize: '40px',
                color: theme.colors.primary.blue,
                fontWeight: 'bold',
                lineHeight: 1
              }}>+</span>
            </button>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            style={{
              background: theme.colors.primary.blue,
              border: 'none',
              borderRadius: '15px',
              padding: '15px 60px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 85, 147, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{
              fontSize: '18px',
              fontWeight: theme.typography.weights.bold,
              color: 'white',
              fontFamily: theme.typography.fonts.primary
            }}>التالي</span>
          </button>
        </div>
        
        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default TeamPlayersPage;
