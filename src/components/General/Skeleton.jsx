import React, { useEffect } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import Colors from '../../utils/Colors';
import { moderateScale, moderateVerticalScale } from '../../utils/responsiveSize';

/**
 * Skeleton buffering primitives.
 *
 * A single native-driven opacity pulse drives every skeleton block on screen so
 * they shimmer in sync and cost one animation loop total. The loop is ref
 * counted: it starts when the first block mounts and stops once the last one
 * unmounts, so nothing animates while real content is showing.
 */

const pulse = new Animated.Value(0);
let mountedCount = 0;
let loop = null;

const acquirePulse = () => {
  mountedCount += 1;
  if (loop) return;
  loop = Animated.loop(
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1,
        duration: 750,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 0,
        duration: 750,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]),
  );
  loop.start();
};

const releasePulse = () => {
  mountedCount = Math.max(0, mountedCount - 1);
  if (mountedCount === 0 && loop) {
    loop.stop();
    loop = null;
    pulse.setValue(0);
  }
};

/**
 * A single shimmering placeholder block.
 * @param {number|string} width
 * @param {number|string} height
 * @param {number} [borderRadius]
 * @param {object} [style]
 */
export const Skeleton = ({
  width,
  height,
  borderRadius = moderateScale(6),
  style,
}) => {
  useEffect(() => {
    acquirePulse();
    return releasePulse;
  }, []);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.85],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.border_grey,
          opacity,
        },
        style,
      ]}
    />
  );
};

/** Placeholder that mirrors a single product card in the home rails. */
export const ProductCardSkeleton = () => (
  <View style={styles.card}>
    <Skeleton width={'100%'} height={moderateScale(120)} />
    <Skeleton
      width={'85%'}
      height={moderateScale(12)}
      style={styles.line}
    />
    <Skeleton
      width={'55%'}
      height={moderateScale(12)}
      style={styles.lineTight}
    />
    <Skeleton
      width={'40%'}
      height={moderateScale(18)}
      style={styles.price}
    />
  </View>
);

/** A horizontal rail of product-card placeholders (matches HomePopularProduct). */
export const ProductRowSkeleton = ({ count = 4 }) => (
  <ScrollView
    horizontal
    scrollEnabled={false}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}
  >
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </ScrollView>
);

/** Placeholder that mirrors a single cart line item. */
export const CartItemSkeleton = () => (
  <View>
    <View style={styles.cartRow}>
      <Skeleton width={moderateScale(64)} height={moderateScale(80)} />
      <View style={styles.cartTextBlock}>
        <Skeleton width={'80%'} height={moderateScale(12)} />
        <Skeleton
          width={'45%'}
          height={moderateScale(12)}
          style={styles.lineTight}
        />
      </View>
      <Skeleton width={moderateScale(50)} height={moderateScale(14)} />
    </View>
    <View style={styles.divider} />
  </View>
);

/** Full cart screen placeholder: a few line items plus a totals block. */
export const CartSkeleton = ({ rows = 3 }) => (
  <View style={styles.cartWrap}>
    {Array.from({ length: rows }).map((_, i) => (
      <CartItemSkeleton key={i} />
    ))}
    <Skeleton
      width={'92%'}
      height={moderateScale(110)}
      borderRadius={moderateScale(8)}
      style={styles.totals}
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: moderateScale(160),
    padding: moderateScale(10),
    margin: moderateScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: Colors.border_grey,
    backgroundColor: Colors.white,
  },
  line: {
    marginTop: moderateVerticalScale(12),
    alignSelf: 'center',
  },
  lineTight: {
    marginTop: moderateVerticalScale(6),
    alignSelf: 'center',
  },
  price: {
    marginTop: moderateVerticalScale(10),
    alignSelf: 'center',
  },
  row: {
    paddingHorizontal: moderateScale(8),
    alignItems: 'center',
  },
  cartRow: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(20),
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
  },
  cartTextBlock: {
    flex: 1,
    gap: moderateScale(4),
  },
  divider: {
    borderWidth: moderateScale(0.3),
    borderColor: Colors.border_grey,
    alignSelf: 'center',
    width: '90%',
  },
  cartWrap: {
    paddingTop: moderateVerticalScale(10),
  },
  totals: {
    alignSelf: 'center',
    marginTop: moderateVerticalScale(20),
    marginBottom: moderateVerticalScale(10),
  },
});

export default Skeleton;
