import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { textScale } from '../../../utils/responsiveSize';

const FILLED = '#f59e0b';
const EMPTY = '#d1d5db';

/**
 * StarRating — read-only when `onRate` is omitted (renders rounded stars for a
 * fractional average), interactive (whole stars) when `onRate` is provided.
 */
const StarRating = ({ value = 0, onRate, size = 16, style }) => {
  const interactive = typeof onRate === 'function';
  const rounded = Math.round(Number(value) || 0);

  return (
    <View style={[styles.row, style]}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= rounded;
        const star_el = (
          <Text style={{ color: filled ? FILLED : EMPTY, fontSize: textScale(size), marginRight: 2 }}>
            ★
          </Text>
        );
        if (!interactive) return <View key={star}>{star_el}</View>;
        return (
          <TouchableOpacity key={star} onPress={() => onRate(star)} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
            {star_el}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});

export default StarRating;
