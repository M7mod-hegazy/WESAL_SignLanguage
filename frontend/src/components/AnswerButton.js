import React from 'react';

const AnswerButton = ({ text, onClick, disabled, isCorrect, isWrong, isSelected, isHintHighlight }) => {
  let backgroundColor = '#FFF9F0';
  let borderColor = '#E8A87C';
  let textColor = '#333333';

  if (isCorrect && !isHintHighlight) {
    // Full green background for correct answer after submission
    backgroundColor = '#4CAF50';
    borderColor = '#45a049';
    textColor = '#FFFFFF';
  } else if (isHintHighlight) {
    // Only green border for hint (keep white background, thicker border)
    backgroundColor = '#FFF9F0';
    borderColor = '#4CAF50';
    textColor = '#333333';
  } else if (isWrong) {
    backgroundColor = '#f44336';
    borderColor = '#da190b';
    textColor = '#FFFFFF';
  } else if (isSelected) {
    backgroundColor = '#F5E6D3';
    borderColor = '#E8A87C';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        minHeight: '60px',
        padding: '15px 20px',
        fontSize: '16px',
        fontWeight: '500',
        color: textColor,
        backgroundColor: backgroundColor,
        border: isHintHighlight ? `4px solid ${borderColor}` : `2px solid ${borderColor}`,
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        opacity: disabled && !isCorrect && !isWrong && !isHintHighlight ? 0.6 : 1,
        transform: isSelected && !isCorrect && !isWrong ? 'scale(0.98)' : 'scale(1)',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isCorrect && !isWrong) {
          e.target.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isCorrect && !isWrong) {
          e.target.style.transform = 'translateY(0)';
        }
      }}
    >
      {text}
    </button>
  );
};

export default AnswerButton;
