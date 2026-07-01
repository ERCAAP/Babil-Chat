import { Dimensions, PixelRatio } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 14 Pro as reference)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Responsive width and height functions
export const widthPercentageToDP = (widthPercent: number): number => {
  const elemWidth = parseFloat(widthPercent.toString());
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

export const heightPercentageToDP = (heightPercent: number): number => {
  const elemHeight = parseFloat(heightPercent.toString());
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / 100);
};

// Shorthand functions
export const wp = widthPercentageToDP;
export const hp = heightPercentageToDP;

// Responsive font size
export const responsiveFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const rf = responsiveFontSize;

// Device type detection
export const isTablet = (): boolean => {
  return SCREEN_WIDTH >= 768;
};

export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < 375;
};

export const isLargeDevice = (): boolean => {
  return SCREEN_WIDTH > 414;
};

// Breakpoints
export const breakpoints = {
  xs: 0,     // iPhone SE
  sm: 375,   // iPhone 14/15
  md: 390,   // iPhone 14/15 Pro  
  lg: 430,   // iPhone 14/15 Pro Max
  xl: 768,   // iPad Mini
  xxl: 1024, // iPad
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Check if screen width is above a breakpoint
export const isAbove = (breakpoint: Breakpoint): boolean => {
  return SCREEN_WIDTH >= breakpoints[breakpoint];
};

// Check if screen width is below a breakpoint
export const isBelow = (breakpoint: Breakpoint): boolean => {
  return SCREEN_WIDTH < breakpoints[breakpoint];
};

// Get current breakpoint
export const getCurrentBreakpoint = (): Breakpoint => {
  if (SCREEN_WIDTH >= breakpoints.xxl) return 'xxl';
  if (SCREEN_WIDTH >= breakpoints.xl) return 'xl';
  if (SCREEN_WIDTH >= breakpoints.lg) return 'lg';
  if (SCREEN_WIDTH >= breakpoints.md) return 'md';
  if (SCREEN_WIDTH >= breakpoints.sm) return 'sm';
  return 'xs';
};

// Spacing system
export const spacing = {
  xs: wp(1),    // ~4px
  sm: wp(2),    // ~8px  
  md: wp(3),    // ~12px
  lg: wp(4),    // ~16px
  xl: wp(5),    // ~20px
  xxl: wp(6),   // ~24px
  xxxl: wp(8),  // ~32px
} as const;

// Typography scale
export const typography = {
  xs: rf(12),
  sm: rf(14),
  md: rf(16),
  lg: rf(18),
  xl: rf(20),
  xxl: rf(24),
  xxxl: rf(32),
  xxxxl: rf(40),
} as const;

// Safe area padding (for notched devices)
export const getSafeAreaPadding = () => {
  const topPadding = hp(5); // Approximate notch height
  const bottomPadding = hp(3); // Home indicator area
  
  return {
    paddingTop: topPadding,
    paddingBottom: bottomPadding,
  };
};

// Responsive card dimensions
export const getCardDimensions = (columns: number = 2) => {
  const padding = wp(4); // 16px equivalent
  const gap = wp(2); // 8px equivalent
  const totalPadding = padding * 2;
  const totalGaps = gap * (columns - 1);
  const availableWidth = SCREEN_WIDTH - totalPadding - totalGaps;
  const cardWidth = availableWidth / columns;
  
  return {
    width: cardWidth,
    height: cardWidth * 1.2, // 5:6 aspect ratio
  };
};

// Get grid item dimensions
export const getGridDimensions = (
  itemsPerRow: number,
  aspectRatio: number = 1,
  horizontalPadding: number = wp(4)
) => {
  const gap = wp(2);
  const totalHorizontalPadding = horizontalPadding * 2;
  const totalGaps = gap * (itemsPerRow - 1);
  const availableWidth = SCREEN_WIDTH - totalHorizontalPadding - totalGaps;
  const itemWidth = availableWidth / itemsPerRow;
  const itemHeight = itemWidth * aspectRatio;
  
  return {
    width: itemWidth,
    height: itemHeight,
    gap,
  };
};

// Device orientation
export const getOrientation = () => {
  return SCREEN_WIDTH > SCREEN_HEIGHT ? 'landscape' : 'portrait';
};

// Screen dimensions
export const screenData = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isPortrait: SCREEN_HEIGHT > SCREEN_WIDTH,
  isLandscape: SCREEN_WIDTH > SCREEN_HEIGHT,
  devicePixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

export default {
  wp,
  hp,
  rf,
  spacing,
  typography,
  breakpoints,
  isAbove,
  isBelow,
  getCurrentBreakpoint,
  isTablet,
  isSmallDevice,
  isLargeDevice,
  getSafeAreaPadding,
  getCardDimensions,
  getGridDimensions,
  getOrientation,
  screenData,
}; 