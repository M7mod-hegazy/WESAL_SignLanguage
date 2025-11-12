import React from 'react';
import theme from '../../theme/designSystem';

/**
 * Reusable Container Component
 * Provides consistent max-width and padding across pages
 */
const Container = ({ 
  children, 
  size = 'mobile',
  rtl = true,
  style = {},
  ...props 
}) => {
  
  const containerStyle = {
    ...theme.components.container[size],
    direction: rtl ? theme.rtl.direction : 'ltr',
    textAlign: rtl ? theme.rtl.textAlign : 'left',
    ...style
  };

  return (
    <div style={containerStyle} {...props}>
      {children}
    </div>
  );
};

export default Container;
