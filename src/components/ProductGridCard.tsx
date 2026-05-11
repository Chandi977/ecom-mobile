import React, { memo, useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SkeletonBox } from './Skeleton';
import {
  formatPrice,
  getDiscountPercent,
  getProductImage,
  getProductMRP,
  getProductName,
  getProductPrice,
} from '../utils/product';

interface Props {
  product: any;
  onPress: (product: any) => void;
}

function ProductGridCard({ product, onPress }: Props) {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const imageUri = getProductImage(product);
  const imageSource = useMemo(() => (imageUri ? { uri: imageUri } : null), [imageUri]);
  const price = getProductPrice(product);
  const mrp = getProductMRP(product);
  const name = getProductName(product);
  const discount = getDiscountPercent(mrp, price);

  useEffect(() => {
    setImgLoading(Boolean(imageUri));
    setImgError(false);
  }, [imageUri]);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress(product)}
    >
      <View style={styles.imageWrapper}>
        {(imgLoading || imgError || !imageSource) && (
          <SkeletonBox width="100%" height={120} borderRadius={6} style={styles.skeleton} />
        )}
        {imageSource && !imgError && (
          <Image
            source={imageSource}
            style={[styles.image, imgLoading && styles.hidden]}
            resizeMode="contain"
            fadeDuration={80}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgLoading(false);
              setImgError(true);
            }}
          />
        )}
        {discount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{discount}% OFF</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatPrice(price)}</Text>
        {mrp > price && <Text style={styles.mrp}>{formatPrice(mrp)}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default memo(ProductGridCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ECEFF4',
  },
  imageWrapper: {
    height: 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: 120, borderRadius: 6 },
  hidden: { opacity: 0, position: 'absolute' },
  skeleton: { position: 'absolute' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E92227',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  name: { fontSize: 12, color: '#333', marginTop: 6, lineHeight: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#182C5A' },
  mrp: { fontSize: 11, color: '#999', textDecorationLine: 'line-through' },
});

