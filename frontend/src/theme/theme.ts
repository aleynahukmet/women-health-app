export const LightColors = {
  // Backgrounds
  background: '#FDFCFB', // Warm White / Cream
  card: '#FFFFFF',
  
  // Phase Colors (Terracotta & Earth Palette)
  menstrual: '#D66D75',   // Modern Rose / Berry
  follicular: '#F2CC8F',  // Peach / Sand
  ovulation: '#94A684',   // Sage Green
  luteal: '#3D405B',      // Earthy Navy / Dark Slate

  // Aliases for clarity
  period: '#D66D75',
  fertility: '#94A684',
  ovulatory: '#94A684',
  
  // Text
  text: '#3D405B',
  textSecondary: '#4A4E69',
  textLight: '#A8ABB3',
  
  // UI Elements
  primary: '#D66D75',     // Rose as primary
  accent: '#F2CC8F',      // Peach as accent
  border: '#F4F1DE',
  error: '#D66D75',
  success: '#94A684',
  
  // Discreet Palette (for neutral mode)
  neutral: '#F4F1DE',
  neutralDark: '#3D405B',

  // Glassmorphism / Overlays
  overlay: 'rgba(255, 255, 255, 0.8)',
  shadow: '#3D405B',
};

export const DarkColors = {
  // Backgrounds
  background: '#121212', // Deep Charcoal
  card: '#1E1E1E',      // Lighter Charcoal
  
  // Phase Colors (Slightly more vibrant for dark background)
  menstrual: '#E57373',
  follicular: '#FFD54F',
  ovulation: '#81C784',
  luteal: '#9FA8DA',

  // Aliases
  period: '#E57373',
  fertility: '#81C784',
  ovulatory: '#81C784',
  
  // Text
  text: '#F5F5F5',
  textSecondary: '#BDBDBD',
  textLight: '#757575',
  
  // UI Elements
  primary: '#E57373',
  accent: '#FFD54F',
  border: '#333333',
  error: '#E57373',
  success: '#81C784',
  
  // Discreet Palette
  neutral: '#333333',
  neutralDark: '#F5F5F5',

  // Glassmorphism / Overlays
  overlay: 'rgba(30, 30, 30, 0.8)',
  shadow: '#000000',
};

// Default export for backward compatibility
export const Colors = LightColors;

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
