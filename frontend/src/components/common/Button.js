import React from 'react';
import theme from '../../theme/designSystem';

/**
 * Reusable Button Component
 * Based on design system standards
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick, 
  disabled = false,
  style = {},
  ...props 
}) => {
  
  const baseStyle = {
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.3s ease',
    fontFamily: theme.typography.fonts.secondary,
    border: 'none',
    outline: 'none',
    ...style
  };

  const variants = {
    primary: {
      ...theme.components.button.primary,
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows.lg,
      }
    },
    secondary: {
      ...theme.components.button.secondary,
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows.lg,
      }
    },
    outline: {
      ...theme.components.button.outline,
      ':hover': {
        background: theme.colors.primary.blue,
        color: theme.colors.text.white,
      }
    }
  };

  const sizes = {
    small: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.typography.sizes.sm,
    },
    medium: {
      padding: `${theme.spacing.md} ${theme.spacing.xl}`,
      fontSize: theme.typography.sizes.base,
    },
    large: {
      padding: `${theme.spacing.lg} ${theme.spacing['2xl']}`,
      fontSize: theme.typography.sizes.lg,
    }
  };

  const buttonStyle = {
    ...baseStyle,
    ...variants[variant],
    ...sizes[size],
  };

  return (
    <button
      style={buttonStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
