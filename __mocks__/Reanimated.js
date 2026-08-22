const React = require('react');
const { View, Text, Image, ScrollView } = require('react-native');

const passthrough = value => value;

const Animated = {
  View,
  Text,
  Image,
  ScrollView,
  createAnimatedComponent: component => component,
};

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  Easing: {
    linear: passthrough,
    ease: passthrough,
    out: passthrough,
    inOut: passthrough,
  },
  FadeIn: { duration: () => ({ delay: () => ({}) }) },
  FadeInUp: { duration: () => ({ delay: () => ({}) }) },
  FadeOut: { duration: () => ({}) },
  Layout: { springify: () => ({}) },
  interpolate: () => 0,
  interpolateColor: () => '#000000',
  runOnJS: fn => fn,
  useAnimatedGestureHandler: () => ({}),
  useAnimatedRef: () => React.createRef(),
  useAnimatedScrollHandler: () => ({}),
  useAnimatedStyle: updater => (typeof updater === 'function' ? updater() : {}),
  useDerivedValue: updater => ({ value: typeof updater === 'function' ? updater() : updater }),
  useSharedValue: value => ({ value }),
  withDelay: (_delay, value) => value,
  withRepeat: value => value,
  withSequence: (...values) => values[values.length - 1],
  withSpring: value => value,
  withTiming: value => value,
};
