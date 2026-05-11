import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width, height, borderRadius = 4, style }: SkeletonBoxProps) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ backgroundColor: '#D8D8D8', height, borderRadius, opacity: 1 }, { width } as any, style, animatedStyle]}
    />
  );
}

// Horizontal card skeleton (used in HomeScreen sections)
export function ProductCardSkeleton() {
  return (
    <View style={cardStyles.card}>
      <SkeletonBox width="100%" height={110} borderRadius={6} />
      <SkeletonBox width="70%" height={14} style={cardStyles.line1} />
      <SkeletonBox width="50%" height={12} style={cardStyles.line2} />
    </View>
  );
}

// Circular brand skeleton
export function BrandCardSkeleton() {
  return (
    <View style={brandStyles.card}>
      <SkeletonBox width={80} height={80} borderRadius={40} />
      <SkeletonBox width={60} height={10} style={brandStyles.label} />
    </View>
  );
}

// Full-width banner skeleton
export function BannerSkeleton() {
  return <SkeletonBox width="100%" height={200} borderRadius={0} />;
}

// Product detail skeleton
export function ProductDetailSkeleton() {
  return (
    <View style={detailStyles.container}>
      <SkeletonBox width="100%" height={300} borderRadius={0} />
      <View style={detailStyles.info}>
        <SkeletonBox width="80%" height={22} />
        <SkeletonBox width="40%" height={28} style={detailStyles.gap} />
        <SkeletonBox width="30%" height={16} style={detailStyles.gap} />
        <SkeletonBox width="100%" height={14} style={detailStyles.gap} />
        <SkeletonBox width="100%" height={14} style={detailStyles.gapSm} />
        <SkeletonBox width="90%" height={14} style={detailStyles.gapSm} />
        <SkeletonBox width="100%" height={48} borderRadius={8} style={detailStyles.btn} />
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: { width: 140, marginRight: 10, backgroundColor: '#fff', borderRadius: 8, padding: 8 },
  line1: { marginTop: 8 },
  line2: { marginTop: 6 },
});

const brandStyles = StyleSheet.create({
  card: { width: 100, marginRight: 10, alignItems: 'center' },
  label: { marginTop: 6 },
});

const detailStyles = StyleSheet.create({
  container: { flex: 1 },
  info: { padding: 15 },
  gap: { marginTop: 14 },
  gapSm: { marginTop: 8 },
  btn: { marginTop: 24 },
});
