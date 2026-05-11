import React, { memo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SkeletonBox } from './Skeleton';
import { getProductImage, getProductName } from '../utils/product';

interface Props {
  product: any;
  onPress: () => void;
}

export default memo(function TopCard({ product, onPress }: Props) {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const imageUri = getProductImage(product);
  const name = getProductName(product);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.circle}>
        {(imgLoading || imgError) && (
          <SkeletonBox width={100} height={100} borderRadius={50} style={styles.skeleton} />
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
      </View>
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { width: 130, marginRight: 16, alignItems: 'center' },
  circle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
  },
  image: { width: 90, height: 90 },
  hidden: { opacity: 0, position: 'absolute' },
  skeleton: { position: 'absolute' },
  name: {
    fontSize: 11,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
    textTransform: 'capitalize',
    lineHeight: 15,
  },
});
