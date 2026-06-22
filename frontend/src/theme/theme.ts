export const LightColors = {
  // Backgrounds
  background: '#FAF6F6',    // Soft, easy-on-the-eyes off-white/cream
  card: '#FFFFFF',          // Pure white cards
  
  // Phase Colors (Muted Pastel & Deep Berry Palette)
  menstrual: '#C95A62',     // Soft, warm coral/red (instead of aggressive red)
  follicular: '#739574',    // Calming sage green
  ovulation: '#D99A4E',     // Noble mustard/amber tone
  luteal: '#7D76A6',        // Misty lavender blue
  
  // Aliases for clarity
  period: '#C95A62',
  fertility: '#D99A4E',
  ovulatory: '#D99A4E',
  
  // Text
  text: '#2C1A21',          // Deep berry/plum instead of pure black (softens text)
  textSecondary: '#8E7A82', // Secondary muted text
  textLight: '#A8ABB3',
  
  // UI Elements
  primary: '#B35B72',       // Mature, premium rose gold/berry
  primaryLight: '#F3E1E4',  // Transparent background tone for primary
  accent: '#D99B82',        // Warm terracotta/peach for action buttons
  border: '#F4F1DE',
  error: '#C95A62',
  success: '#739574',
  
  // Severity Levels (for symptoms)
  severity: {
    low: '#F7E7E9',
    medium: '#EBBEC3',
    high: '#C95A62',
  },

  // Discreet Palette
  neutral: '#F4F1DE',
  neutralDark: '#2C1A21',

  // Glassmorphism / Overlays
  overlay: 'rgba(255, 255, 255, 0.8)',
  shadow: '#2C1A21',
};

export const DarkColors = {
  // Backgrounds
  background: '#1A1416',    // Deep berry-tinted charcoal
  card: '#251C1F',          // Slightly lighter berry charcoal
  
  // Phase Colors (Adjusted for dark mode visibility)
  menstrual: '#E57373',
  follicular: '#81C784',
  ovulation: '#FFD54F',
  luteal: '#9FA8DA',

  // Aliases
  period: '#E57373',
  fertility: '#FFD54F',
  ovulatory: '#FFD54F',
  
  // Text
  text: '#FAF6F6',
  textSecondary: '#BDBDBD',
  textLight: '#757575',
  
  // UI Elements
  primary: '#B35B72',
  primaryLight: 'rgba(179, 91, 114, 0.2)',
  accent: '#D99B82',
  border: '#33282B',
  error: '#E57373',
  success: '#81C784',
  
  // Severity Levels
  severity: {
    low: '#2D1F22',
    medium: '#4A2B31',
    high: '#B35B72',
  },

  // Discreet Palette
  neutral: '#33282B',
  neutralDark: '#FAF6F6',

  // Glassmorphism / Overlays
  overlay: 'rgba(37, 28, 31, 0.8)',
  shadow: '#000000',
};

// Default export for backward compatibility
export const Colors = LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 24,
  xl: 32,
  round: 999,
};

import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkColors : LightColors;
  
  return {
    colors: theme,
    isDark,
    spacing: Spacing,
    borderRadius: BorderRadius,
  };
};
