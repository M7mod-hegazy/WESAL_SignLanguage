/**
 * Design System Configuration
 * Based on brand guidelines and style guide
 * Use this for all pages to maintain consistency
 */

export const colors = {
  // Primary Colors (رئيسي)
  primary: {
    orange: '#F18A21',      // Main brand color
    blue: '#005593',        // Primary blue
  },
  
  // Secondary Colors (ثانوي)
  secondary: {
    yellow: '#F8B817',      // Accent yellow
    darkBlue: '#05203D',    // Dark blue
    lightBlue: '#A4C8E2',   // Light blue
  },
  
  // Background Colors
  background: {
    lightGray: '#F5F5F0',   // Main background
    white: '#FFFFFF',       // Pure white
    cream: '#FFF9F0',       // Card backgrounds
  },
  
  // UI Colors (from current implementation)
  ui: {
    border: '#E8A87C',      // Tan/orange border
    controlBar: '#F5E6D3',  // Light tan
    timerBg: '#E8A87C',     // Timer background
  },
  
  // Status Colors
  status: {
    success: '#4CAF50',     // Correct answer
    error: '#FF4444',       // Wrong answer
    warning: '#F8B817',     // Warning state
  },
  
  // Text Colors
  text: {
    primary: '#333333',     // Main text
    secondary: '#666666',   // Secondary text
    white: '#FFFFFF',       // White text
    blue: '#005593',        // Blue text
    orange: '#F18A21',      // Orange text
  }
};

export const typography = {
  // Primary Font: Marhey (for headings and logo)
  fonts: {
    primary: "'Marhey', sans-serif",      // For headings
    secondary: "'Harmattan', sans-serif", // For body text
    fallback: "Arial, sans-serif",        // Fallback
  },
  
  // Font Weights
  weights: {
    regular: 200,
    medium: 300,
    semiBold: 400,
    bold: 500,
  },
  
  // Font Sizes
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  }
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '15px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '48px',
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '15px',
  xl: '20px',
  full: '50%',
};

export const shadows = {
  sm: '0 2px 4px rgba(0,0,0,0.1)',
  md: '0 4px 10px rgba(0,0,0,0.15)',
  lg: '0 4px 15px rgba(0,0,0,0.2)',
  xl: '0 8px 20px rgba(0,0,0,0.25)',
};

export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
};

// Icon/Logo Path
export const assets = {
  logo: '/icon.png',
  coin: '/coin.png',
  hint: '/hint.png',
};

// Common Component Styles
export const components = {
  // Button Styles
  button: {
    primary: {
      background: colors.primary.orange,
      color: colors.text.white,
      border: 'none',
      borderRadius: borderRadius.md,
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: shadows.md,
    },
    secondary: {
      background: colors.primary.blue,
      color: colors.text.white,
      border: 'none',
      borderRadius: borderRadius.md,
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: shadows.md,
    },
    outline: {
      background: 'transparent',
      color: colors.primary.blue,
      border: `2px solid ${colors.primary.blue}`,
      borderRadius: borderRadius.md,
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
  },
  
  // Card Styles
  card: {
    default: {
      background: colors.background.cream,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      border: `3px solid ${colors.ui.border}`,
      boxShadow: shadows.sm,
    },
    elevated: {
      background: colors.background.white,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      boxShadow: shadows.lg,
    },
  },
  
  // Input Styles
  input: {
    default: {
      background: colors.background.white,
      border: `2px solid ${colors.ui.border}`,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.sizes.base,
      color: colors.text.primary,
      fontFamily: typography.fonts.secondary,
    },
  },
  
  // Container Styles
  container: {
    mobile: {
      maxWidth: '400px',
      padding: `0 ${spacing.xl}`,
      margin: '0 auto',
    },
    tablet: {
      maxWidth: '768px',
      padding: `0 ${spacing['2xl']}`,
      margin: '0 auto',
    },
    desktop: {
      maxWidth: '1200px',
      padding: `0 ${spacing['3xl']}`,
      margin: '0 auto',
    },
  },
};

// RTL Configuration
export const rtl = {
  direction: 'rtl',
  textAlign: 'right',
};

// Arabic Numeral Converter
export const toArabicNumerals = (num) => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => {
    const parsed = parseInt(digit);
    return isNaN(parsed) ? digit : arabicNumerals[parsed];
  }).join('');
};

// Export default theme object
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  assets,
  components,
  rtl,
  toArabicNumerals,
};

export default theme;
