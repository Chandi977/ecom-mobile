import { Dimensions, Platform, StatusBar } from 'react-native';

// Screen Dimensions
const { width, height } = Dimensions.get('window');

// Base guideline (as per design spec mobile-first 375px) :contentReference[oaicite:0]{index=0}
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Scale Functions
const scale = (size) => (width / guidelineBaseWidth) * size;

const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const moderateVerticalScale = (size, factor = 0.5) =>
  size + (verticalScale(size) - size) * factor;

// Text Scaling (Simplified & Accurate)
const textScale = (size) => moderateScale(size, 0.3);

// Status Bar Height (Clean)
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android'
    ? StatusBar.currentHeight || 24
    : 44; // Safe default for iOS notch devices

// Device Helpers
const isSmallDevice = width < 360;
const isTablet = width >= 768;

// Slider / Item Width
const sliderWidth = width - scale(20);
const itemWidth = width - scale(20);

export {
  width,
  height,
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  textScale,
  STATUS_BAR_HEIGHT,
  sliderWidth,
  itemWidth,
  isSmallDevice,
  isTablet,
};