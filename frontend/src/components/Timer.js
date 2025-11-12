import React from 'react';
import Countdown from 'react-countdown';

const Timer = ({ duration = 30, onTimeUp, isActive = true, onReset, digital = false, inControlBar = false }) => {
  
  // Convert to Arabic-Indic numerals
  const toArabicNumerals = (num) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return arabicNumerals[parseInt(num)] || num;
  };

  // Renderer for control bar mode
  const controlBarRenderer = ({ minutes, seconds, completed }) => {
    // Format minutes and seconds to always be 2 digits
    const mins = String(minutes).padStart(2, '0');
    const secs = String(seconds).padStart(2, '0');
    
    const digit1 = toArabicNumerals(mins[0]);
    const digit2 = toArabicNumerals(mins[1]);
    const digit3 = toArabicNumerals(secs[0]);
    const digit4 = toArabicNumerals(secs[1]);

    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', direction: 'ltr' }}>
        {/* First digit */}
        <div style={{ 
          width: '35px', 
          height: '35px', 
          background: '#E8A87C', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {digit1}
        </div>
        
        {/* Second digit */}
        <div style={{ 
          width: '35px', 
          height: '35px', 
          background: '#E8A87C', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {digit2}
        </div>
        
        {/* Colon (circle) */}
        <div style={{ 
          width: '38px', 
          height: '38px', 
          background: '#E8A87C', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          :
        </div>
        
        {/* Third digit */}
        <div style={{ 
          width: '35px', 
          height: '35px', 
          background: '#E8A87C', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {digit3}
        </div>
        
        {/* Fourth digit */}
        <div style={{ 
          width: '35px', 
          height: '35px', 
          background: '#E8A87C', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {digit4}
        </div>
      </div>
    );
  };

  // Use Countdown library
  if (inControlBar) {
    return (
      <Countdown
        date={Date.now() + duration * 1000}
        key={onReset}
        renderer={controlBarRenderer}
        onComplete={onTimeUp}
      />
    );
  }

  // Default: not used anymore
  return null;
};

export default Timer;
