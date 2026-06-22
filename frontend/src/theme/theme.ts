export const LightColors = {
  // Global Arka Plan ve Kart Tonları
  background: '#FAF8F5',    // Yumuşak, gözü yormayan keten/krem beyazı
  card: '#FFFFFF',          // Net beyaz kartlar
  
  // Birbiriyle Kusursuz Uyumlu Mat Geçişli Faz Renkleri
  menstrual: '#C97A83',     // Çiğ kırmızı yerine olgun gül kurusu
  follicular: '#E6BA94',    // Parlak sarı yerine soft pastel şeftali/kum
  ovulation: '#8FAA96',     // Canlı yeşil yerine sakinleştirici adaçayı yeşili
  luteal: '#5D637A',        // Sert lacivert yerine puslu dumanlı mavi

  // Takma İsimler (Alias)
  period: '#C97A83',
  fertility: '#8FAA96',
  ovulatory: '#8FAA96',
  
  // Tipografi (Yazı Renkleri)
  text: '#2D2B3A',          // Saf siyah yerine yazıları yumuşatan derin mürdüm kömürü
  textSecondary: '#524F66', // İkincil başlıklar için dumanlı mürdüm
  textLight: '#BAB7C3',     // Silik açıklama metinleri
  
  // UI Elementleri
  primary: '#C97A83',       // Gül kurusu ana renk
  primaryLight: '#F7E7E9',  // Transparent background tone for primary
  accent: '#E6BA94',        // Şeftali vurgu rengi
  border: '#EFECE6',        // Kart sınırları için çok soft gri-krem
  error: '#C97A83',
  success: '#8FAA96',
  
  // Severity Levels (for symptoms)
  severity: {
    low: '#F7E7E9',
    medium: '#EBBEC3',
    high: '#C97A83',
  },

  // Discreet Palette
  neutral: '#EFECE6',
  neutralDark: '#2D2B3A',

  overlay: 'rgba(255, 255, 255, 0.8)',
  shadow: '#2D2B3A',
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
  primary: '#C97A83',
  primaryLight: 'rgba(201, 122, 131, 0.2)',
  accent: '#E6BA94',
  border: '#33282B',
  error: '#E57373',
  success: '#81C784',
  
  // Severity Levels
  severity: {
    low: '#2D1F22',
    medium: '#4A2B31',
    high: '#C97A83',
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
