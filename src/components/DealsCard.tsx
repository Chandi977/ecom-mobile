import React, { memo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SkeletonBox } from './Skeleton';
import {
  formatPrice,
  getDiscountPercent,
  getProductBrandKey,
  getProductImage,
  getProductMRP,
  getProductName,
  getProductPrice,
} from '../utils/product';

interface Props {
  product: any;
  onPress: () => void;
}

export default memo(function DealsCard({ product, onPress }: Props) {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const imageUri = getProductImage(product);
  const price = getProductPrice(product);
  const mrp = getProductMRP(product);
  const name = getProductName(product);
  const discount = getDiscountPercent(mrp, price);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrapper}>
        {(imgLoading || imgError) && (
          <SkeletonBox width="100%" height={110} borderRadius={6} style={styles.skeleton} />
        )}
        {imageUri && !imgError && (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, imgLoading && styles.hidden]}
            resizeMode="contain"
            onLoad={() => setImgLoading(false)}
            onError={() => { setImgLoading(false); setImgError(true); }}
          />
        )}
        {discount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{discount}%{'\n'}OFF</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatPrice(price)}</Text>
        {mrp > price && (
          <Text style={styles.mrp}>{formatPrice(mrp)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 148,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  imageWrapper: { height: 110, width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  image: { width: '100%', height: 110, borderRadius: 6 },
  hidden: { opacity: 0, position: 'absolute' },
  skeleton: { position: 'absolute' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E92227',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
  name: { fontSize: 11, color: '#333', marginTop: 6, lineHeight: 15 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  mrp: { fontSize: 11, color: '#999', textDecorationLine: 'line-through' },
});
