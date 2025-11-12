import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import theme from '../theme/designSystem';
import BottomNav from '../components/BottomNav';

const TeamSpinPage = ({ onBack, players: propPlayers, onStartChallenge, onHome, onNotifications }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get players from either props (when used as component) or location state (when used as route)
  const players = propPlayers || location.state?.players || [];
  const initialTimeLimit = location.state?.timeLimit || 30;
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeLimit, setTimeLimit] = useState(initialTimeLimit);
  const colors = ['#F8B817', '#F18A21']; // Yellow and Orange alternating

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedPlayer(null);

    // Random spin with multiple rotations
    const extraRotations = 5 + Math.floor(Math.random() * 5);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (extraRotations * 360) + randomAngle;

    setRotation(totalRotation);

    // Calculate the winner after animation completes
    setTimeout(() => {
      const segmentAngle = 360 / players.length;
      
      // Get the final rotation angle (0-360)
      const finalAngle = totalRotation % 360;
      
      // The arrow is at the top (pointing down)
      // Segments are drawn starting at -90 degrees (top) going clockwise
      // When wheel rotates clockwise by X degrees, segment that was at angle A is now at (A + X)
      
      // We need to find which segment is now at the top (-90 degrees or 270 degrees)
      // If wheel rotated by finalAngle, then segment that's now at top was originally at:
      // originalAngle = -90 - finalAngle
      
      const targetAngle = (-90 - finalAngle + 360) % 360;
      
      // Find which segment this angle belongs to
      // Segment i starts at: (i * segmentAngle) - 90
      // Segment i ends at: ((i + 1) * segmentAngle) - 90
      
      let winnerIndex = 0;
      for (let i = 0; i < players.length; i++) {
        const segmentStart = ((i * segmentAngle) - 90 + 360) % 360;
        const segmentEnd = (((i + 1) * segmentAngle) - 90 + 360) % 360;
        
        // Check if targetAngle falls within this segment
        if (segmentStart < segmentEnd) {
          // Normal case: segment doesn't cross 0/360 boundary
          if (targetAngle >= segmentStart && targetAngle < segmentEnd) {
            winnerIndex = i;
            break;
          }
        } else {
          // Segment crosses 0/360 boundary
          if (targetAngle >= segmentStart || targetAngle < segmentEnd) {
            winnerIndex = i;
            break;
          }
        }
      }

      setSelectedPlayer(players[winnerIndex]);
      setIsSpinning(false);
    }, 4000);
  };

  const segmentAngle = 360 / players.length;

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
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              navigate('/team');
            }
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
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
          alignItems: 'center',
          gap: '30px'
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: '24px',
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.primary.orange,
            fontFamily: theme.typography.fonts.primary,
            textAlign: 'center',
            margin: 0
          }}>من قد التحدي؟</h1>

          {/* Wheel Container */}
          <div style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Pointer/Arrow at top */}
            <div style={{
              position: 'absolute',
              top: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '25px solid transparent',
              borderRight: '25px solid transparent',
              borderTop: '35px solid #F18A21',
              zIndex: 10
            }} />

            {/* Spinning Wheel */}
            <svg
              width="280"
              height="280"
              viewBox="0 0 280 280"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
              }}
            >
              {/* Outer Circle Border */}
              <circle
                cx="140"
                cy="140"
                r="138"
                fill="none"
                stroke={theme.colors.primary.blue}
                strokeWidth="5"
              />

              {/* Segments */}
              {players.map((player, index) => {
                const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
                const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
                
                const x1 = 140 + 135 * Math.cos(startAngle);
                const y1 = 140 + 135 * Math.sin(startAngle);
                const x2 = 140 + 135 * Math.cos(endAngle);
                const y2 = 140 + 135 * Math.sin(endAngle);

                const largeArcFlag = segmentAngle > 180 ? 1 : 0;

                const pathData = [
                  `M 140 140`,
                  `L ${x1} ${y1}`,
                  `A 135 135 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');

                // Calculate text position (middle of segment)
                const textAngle = (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
                const textRadius = 85;
                const textX = 140 + textRadius * Math.cos(textAngle);
                const textY = 140 + textRadius * Math.sin(textAngle);
                const textRotation = index * segmentAngle + segmentAngle / 2;

                return (
                  <g key={index}>
                    {/* Segment */}
                    <path
                      d={pathData}
                      fill={colors[index % colors.length]}
                      stroke={theme.colors.primary.blue}
                      strokeWidth="3"
                    />
                    
                    {/* Player Name */}
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                      fontFamily={theme.typography.fonts.primary}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                    >
                      {player}
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>

          {/* Result Display */}
          {selectedPlayer && !isSpinning && (
            <div style={{
              padding: '15px 30px',
              background: theme.colors.secondary.yellow,
              borderRadius: '15px',
              animation: 'fadeIn 0.5s ease'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: theme.typography.weights.bold,
                color: 'white',
                fontFamily: theme.typography.fonts.primary
              }}>الفائز: {selectedPlayer}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            width: '100%',
            maxWidth: '350px',
            marginTop: 'auto'
          }}>
            {/* Time and Spin Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              {/* Time Button - Left */}
              <button
                onClick={() => setShowTimeModal(true)}
                style={{
                  background: theme.colors.primary.orange,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
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
                }}>الوقت : {timeLimit}ث</span>
              </button>

              {/* Spin Button - Right */}
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                style={{
                  background: theme.colors.primary.blue,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  opacity: isSpinning ? 0.6 : 1,
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSpinning) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
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
                }}>ابدأ الدوران</span>
              </button>
            </div>

            {/* Start Challenge Button */}
            <button
              onClick={() => {
                console.log('Challenge button clicked');
                console.log('Selected player:', selectedPlayer);
                console.log('Time limit:', timeLimit);
                
                if (selectedPlayer) {
                  // If used as a route (from quiz return), navigate to quiz
                  if (!onStartChallenge) {
                    navigate('/quiz', {
                      state: {
                        mode: 'team',
                        players: players,
                        firstPlayer: selectedPlayer,
                        timeLimit: timeLimit
                      }
                    });
                  } else {
                    // If used as component (from TeamPage), call callback
                    onStartChallenge(selectedPlayer, timeLimit);
                  }
                } else {
                  console.log('Cannot start challenge - no player selected');
                }
              }}
              disabled={!selectedPlayer || isSpinning}
              style={{
                background: theme.colors.secondary.yellow,
                border: 'none',
                borderRadius: '12px',
                padding: '18px 20px',
                cursor: (!selectedPlayer || isSpinning) ? 'not-allowed' : 'pointer',
                opacity: (!selectedPlayer || isSpinning) ? 0.6 : 1,
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedPlayer && !isSpinning) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
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
              }}>لمعرفة التحدي</span>
            </button>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Time Edit Modal */}
      {showTimeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#FFF9F0',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '350px',
            direction: 'rtl',
            fontFamily: theme.typography.fonts.secondary
          }}>
            {/* Title */}
            <h2 style={{
              fontSize: '20px',
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.primary.orange,
              fontFamily: theme.typography.fonts.primary,
              textAlign: 'center',
              marginBottom: '25px'
            }}>اختر الوقت</h2>

            {/* Time Options */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '25px'
            }}>
              {[15, 30, 45, 60, 90, 120].map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setTimeLimit(time);
                    setShowTimeModal(false);
                  }}
                  style={{
                    background: timeLimit === time ? theme.colors.primary.orange : '#FFE8CC',
                    border: `2px solid ${theme.colors.primary.orange}`,
                    borderRadius: '12px',
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (timeLimit !== time) {
                      e.currentTarget.style.background = theme.colors.secondary.yellow;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (timeLimit !== time) {
                      e.currentTarget.style.background = '#FFE8CC';
                    }
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: theme.typography.weights.bold,
                    color: timeLimit === time ? 'white' : theme.colors.primary.orange,
                    fontFamily: theme.typography.fonts.primary
                  }}>{time} ثانية</span>
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowTimeModal(false)}
              style={{
                width: '100%',
                background: theme.colors.primary.blue,
                border: 'none',
                borderRadius: '12px',
                padding: '15px',
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
              <span style={{
                fontSize: '16px',
                fontWeight: theme.typography.weights.bold,
                color: 'white',
                fontFamily: theme.typography.fonts.primary
              }}>إغلاق</span>
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default TeamSpinPage;
