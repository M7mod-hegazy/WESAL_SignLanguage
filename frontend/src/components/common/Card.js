import React from 'react';
import theme from '../../theme/designSystem';

/**
 * Reusable Card Component
 * Based on design system standards
 */
const Card = ({ 
  children, 
  variant = 'default',
  style = {},
  ...props 
}) => {
  
  const variants = {
    default: theme.components.card.default,
    elevated: theme.components.card.elevated,
  };

  const cardStyle = {
    ...variants[variant],
    ...style
  };

  return (
    <div style={cardStyle} {...props}>
      {children}
    </div>
  );
};

export default Card;
