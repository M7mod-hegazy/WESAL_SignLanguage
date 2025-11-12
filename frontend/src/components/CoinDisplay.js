import React from 'react';

const CoinDisplay = ({ coins }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '12px',
      zIndex: 10
    }}>
      {/* Live Badge and Coin Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#4CAF50',
        padding: '8px 20px',
        borderRadius: '25px',
        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
      }}>
        {/* Globe Icon */}
        <span style={{ fontSize: '20px' }}>🌐</span>
        
        {/* Live Text */}
        <span style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#FFFFFF'
        }}>
          Live
        </span>

        {/* Coin Icon */}
        <div style={{
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 10px rgba(255, 153, 51, 0.4)',
          border: '3px solid #FFFFFF',
          marginLeft: '5px'
        }}>
          💰
        </div>
      </div>

      {/* Light Bulb with rays */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px'
      }}>
        {/* Rays */}
        <div style={{
          display: 'flex',
          gap: '4px',
          justifyContent: 'center'
        }}>
          <div style={{ width: '3px', height: '10px', background: '#FFD700', borderRadius: '2px', transform: 'rotate(-30deg)' }}></div>
          <div style={{ width: '3px', height: '10px', background: '#FFD700', borderRadius: '2px' }}></div>
          <div style={{ width: '3px', height: '10px', background: '#FFD700', borderRadius: '2px', transform: 'rotate(30deg)' }}></div>
        </div>

        {/* Bulb */}
        <div style={{
          width: '50px',
          height: '55px',
          background: 'linear-gradient(180deg, #FFE55C 0%, #FFD700 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          border: '3px solid #FF9933',
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '8px'
        }}>
          {/* Bulb base */}
          <div style={{
            width: '25px',
            height: '10px',
            background: '#4A90E2',
            borderRadius: '0 0 8px 8px'
          }}></div>
        </div>
      </div>
      
      {/* Coin Count */}
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#FF9933',
        background: '#FFFFFF',
        padding: '8px 20px',
        borderRadius: '15px',
        border: '3px solid #FF9933',
        minWidth: '80px',
        textAlign: 'center',
        boxShadow: '0 4px 10px rgba(255, 153, 51, 0.2)'
      }}>
        {coins}
      </div>
    </div>
  );
};

export default CoinDisplay;
