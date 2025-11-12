import React from 'react';
import theme from '../../theme/designSystem';

/**
 * Reusable Logo Component
 * Uses the brand icon from design system
 */
const Logo = ({ 
  size = 'medium',
  style = {},
  ...props 
}) => {
  
  const sizes = {
    small: '24px',
    medium: '40px',
    large: '64px',
    hero: '120px',
  };

  const logoStyle = {
    width: sizes[size],
    height: sizes[size],
    display: 'block',
    ...style
  };

  return (
    <img 
      src={theme.assets.logo}
      alt="Logo"
      style={logoStyle}
      {...props}
    />
  );
};

export default Logo;
