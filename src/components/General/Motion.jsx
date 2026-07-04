import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable } from 'react-native';

/**
 * Motion toolkit — a small set of premium, reusable animation primitives built
 * on React Native's native-driven Animated API (no Reanimated/worklet setup
 * required). Every animation runs with `useNativeDriver` so it stays at 60fps
 * off the JS thread.
 *
 *  - FadeInUp       : content glides up + fades in on mount (staggerable).
 *  - PressableScale : tactile press-in scale with a springy release.
 *  - Pop            : springy pop whenever a watched value changes (e.g. a
 *                     cart badge count), skipping the very first render.
 */

/**
 * Fade + rise entrance. Pass an incremental `delay` per item to cascade a list.
 */
export const FadeInUp = ({
  children,
  delay = 0,
  duration = 420,
  offset = 18,
  style,
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay, duration]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [offset, 0],
  });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

/**
 * A drop-in touchable that scales down while pressed and springs back on
 * release, giving buttons and cards a tactile, physical feel.
 */
export const PressableScale = ({
  children,
  onPress,
  onLongPress,
  disabled,
  style,
  activeScale = 0.96,
  hitSlop,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = toValue =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => animateTo(activeScale)}
      onPressOut={() => animateTo(1)}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

/**
 * Springy pop whenever `trigger` changes. Perfect for a cart/wishlist badge or
 * a favourited heart. The initial mount is skipped so it only celebrates
 * genuine updates, not the first paint.
 */
export const Pop = ({ children, trigger, style, peak = 1.5 }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    Animated.sequence([
      Animated.spring(scale, {
        toValue: peak,
        useNativeDriver: true,
        speed: 50,
        bounciness: 14,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 10,
      }),
    ]).start();
  }, [trigger, scale, peak]);

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
};

export default { FadeInUp, PressableScale, Pop };
