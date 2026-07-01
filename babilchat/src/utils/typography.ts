import * as Font from 'expo-font';
import { Platform } from 'react-native';
import { getCurrentLocale, isRTLLocale } from './i18n';
import { rf } from './responsive';

// Font family definitions
export const FontFamilies = {
  // Arabic fonts
  arabic: {
    regular: 'Amiri-Regular',
    bold: 'Amiri-Bold',
  },
  // Latin fonts (Turkish, English)
  latin: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  // iOS system fonts as fallback
  system: {
    regular: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },
} as const;

// Font loading configuration
export const fontAssets = {
  'Amiri-Regular': require('../../assets/fonts/Amiri-Regular.ttf'),
  'Amiri-Bold': require('../../assets/fonts/Amiri-Bold.ttf'),
  'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
  'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
  'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
  'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
};

// Load custom fonts
export const loadFonts = async (): Promise<void> => {
  try {
    await Font.loadAsync(fontAssets);
  } catch (error) {
    console.warn('Error loading fonts:', error);
  }
};

// Check if fonts are loaded
export const areFontsLoaded = (): boolean => {
  return Font.isLoaded('Amiri-Regular') && Font.isLoaded('Inter-Regular');
};

// Typography scale with responsive sizing
export const TypographyScale = {
  // Font sizes
  xs: rf(12),
  sm: rf(14),
  md: rf(16),
  lg: rf(18),
  xl: rf(20),
  xxl: rf(24),
  xxxl: rf(32),
  xxxxl: rf(40),
  xxxxxl: rf(48),

  // Line heights (relative to font size)
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// Typography weights
export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

// Get appropriate font family based on content type and locale
export const getFontFamily = (
  weight: keyof typeof FontWeights = 'normal',
  isArabic?: boolean
): string => {
  const locale = getCurrentLocale();
  const shouldUseArabic = isArabic || locale === 'ar' || isRTLLocale();
  
  if (shouldUseArabic) {
    // Arabic text
    if (weight === 'bold' || weight === 'semiBold') {
      return areFontsLoaded() ? FontFamilies.arabic.bold : FontFamilies.system.bold;
    }
    return areFontsLoaded() ? FontFamilies.arabic.regular : FontFamilies.system.regular;
  } else {
    // Latin text (Turkish, English, etc.)
    if (!areFontsLoaded()) {
      return FontFamilies.system.regular;
    }
    
    switch (weight) {
      case 'bold':
        return FontFamilies.latin.bold;
      case 'semiBold':
        return FontFamilies.latin.semiBold;
      case 'medium':
        return FontFamilies.latin.medium;
      default:
        return FontFamilies.latin.regular;
    }
  }
};

// Typography style presets
export const TypographyStyles = {
  // Headings
  h1: {
    fontSize: TypographyScale.xxxxxl,
    lineHeight: TypographyScale.xxxxxl * TypographyScale.lineHeights.tight,
    fontWeight: FontWeights.bold,
  },
  h2: {
    fontSize: TypographyScale.xxxxl,
    lineHeight: TypographyScale.xxxxl * TypographyScale.lineHeights.tight,
    fontWeight: FontWeights.bold,
  },
  h3: {
    fontSize: TypographyScale.xxxl,
    lineHeight: TypographyScale.xxxl * TypographyScale.lineHeights.normal,
    fontWeight: FontWeights.semiBold,
  },
  h4: {
    fontSize: TypographyScale.xxl,
    lineHeight: TypographyScale.xxl * TypographyScale.lineHeights.normal,
    fontWeight: FontWeights.semiBold,
  },
  h5: {
    fontSize: TypographyScale.xl,
    lineHeight: TypographyScale.xl * TypographyScale.lineHeights.normal,
    fontWeight: FontWeights.medium,
  },
  h6: {
    fontSize: TypographyScale.lg,
    lineHeight: TypographyScale.lg * TypographyScale.lineHeights.normal,
    fontWeight: FontWeights.medium,
  },

  // Body text
  body1: {
    fontSize: TypographyScale.md,
    lineHeight: TypographyScale.md * TypographyScale.lineHeights.relaxed,
    fontWeight: FontWeights.normal,
  },
  body2: {
    fontSize: TypographyScale.sm,
    lineHeight: TypographyScale.sm * TypographyScale.lineHeights.relaxed,
    fontWeight: FontWeights.normal,
  },

  // Special text types
  caption: {
    fontSize: TypographyScale.xs,
    lineHeight: TypographyScale.xs * TypographyScale.lineHeights.normal,
    fontWeight: FontWeights.normal,
  },
  overline: {
    fontSize: TypographyScale.xs,
    lineHeight: TypographyScale.xs * TypographyScale.lineHeights.normal,
    fontWeight: FontWeights.medium,
    textTransform: 'uppercase' as const,
    letterSpacing: TypographyScale.letterSpacing.wide,
  },
  button: {
    fontSize: TypographyScale.sm,
    lineHeight: TypographyScale.sm * TypographyScale.lineHeights.tight,
    fontWeight: FontWeights.semiBold,
    textTransform: 'uppercase' as const,
  },

  // Arabic specific styles
  arabicVerse: {
    fontSize: TypographyScale.xl,
    lineHeight: TypographyScale.xl * TypographyScale.lineHeights.loose,
    fontWeight: FontWeights.normal,
    textAlign: 'right' as const,
  },
  arabicTitle: {
    fontSize: TypographyScale.xxl,
    lineHeight: TypographyScale.xxl * TypographyScale.lineHeights.normal,
    fontWeight: FontWeights.bold,
    textAlign: 'right' as const,
  },
} as const;

// Helper function to create text style with proper font family
export const createTextStyle = (
  preset: keyof typeof TypographyStyles,
  options?: {
    isArabic?: boolean;
    color?: string;
    weight?: keyof typeof FontWeights;
  }
) => {
  const baseStyle = TypographyStyles[preset];
  const fontFamily = getFontFamily(
    options?.weight || (baseStyle.fontWeight as keyof typeof FontWeights),
    options?.isArabic
  );

  return {
    ...baseStyle,
    fontFamily,
    color: options?.color,
    writingDirection: options?.isArabic || isRTLLocale() ? 'rtl' : 'ltr',
  };
};

// RTL-aware text alignment
export const getTextAlign = (
  align: 'left' | 'center' | 'right' | 'auto' = 'auto',
  isArabic?: boolean
): 'left' | 'center' | 'right' => {
  if (align === 'center') return 'center';
  if (align !== 'auto') return align;
  
  const shouldRTL = isArabic || isRTLLocale();
  return shouldRTL ? 'right' : 'left';
};

// Get line height for Arabic text (typically needs more space)
export const getLineHeight = (fontSize: number, isArabic?: boolean): number => {
  const multiplier = isArabic || isRTLLocale() ? 
    TypographyScale.lineHeights.loose : 
    TypographyScale.lineHeights.relaxed;
  
  return fontSize * multiplier;
};

export default {
  FontFamilies,
  TypographyScale,
  FontWeights,
  TypographyStyles,
  getFontFamily,
  createTextStyle,
  getTextAlign,
  getLineHeight,
  loadFonts,
  areFontsLoaded,
}; 