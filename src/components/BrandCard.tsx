import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SkeletonBox } from './Skeleton';

interface Props {
  brand: any;
  onPress: () => void;
}

const LOCAL_BRAND_IMAGES: Record<string, ImageSourcePropType> = {
  amazon: require('../../assets/brand-amazon.jpg'),
  flipkart: require('../../assets/brand-flipkart.jpg'),
  myntra: require('../../assets/brand-myntra.png'),
  ajio: require('../../assets/brand-ajio.png'),
  rollabel: require('../../assets/brand-rollabel.jpg'),
  packsecure: require('../../assets/brand-pack-secure.jpg'),
};

const normaliseBrandKey = (value?: string) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const getLocalBrandImage = (brand: any) => {
  const candidates = [brand?.slug, brand?.name, brand?.brand_id].map(normaliseBrandKey);

  if (candidates.some((key) => key.includes('packsecure'))) {
    return LOCAL_BRAND_IMAGES.packsecure;
  }

  const match = candidates.find((key) => LOCAL_BRAND_IMAGES[key]);
  return match ? LOCAL_BRAND_IMAGES[match] : undefined;
};

const getBrandImageSource = (brand: any): ImageSourcePropType | undefined => {
  if (typeof brand?.image === 'string' && brand.image.trim()) {
    return { uri: brand.image.trim() };
  }

  return getLocalBrandImage(brand);
};

export default memo(function BrandCard({ brand, onPress }: Props) {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const imageSource = useMemo(() => getBrandImageSource(brand), [brand]);
  const fallbackInitial = (brand?.name || '?').trim().charAt(0).toUpperCase();

  useEffect(() => {
    setImgLoading(Boolean(imageSource));
    setImgError(false);
  }, [imageSource]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.circle}>
        {imageSource && imgLoading && !imgError && (
          <SkeletonBox width={72} height={72} borderRadius={36} style={styles.skeleton} />
        )}
        {imageSource && !imgError ? (
          <Image
            source={imageSource}
            style={[styles.image, imgLoading && styles.hidden]}
            resizeMode="contain"
            onLoad={() => setImgLoading(false)}
            onError={() => { setImgLoading(false); setImgError(true); }}
          />
        ) : (
          <Text style={styles.initial}>{fallbackInitial}</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{brand?.name}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { width: 100, marginRight: 12, alignItems: 'center' },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: { width: 72, height: 72 },
  hidden: { opacity: 0, position: 'absolute' },
  skeleton: { position: 'absolute' },
  initial: {
    color: '#182C5A',
    fontSize: 24,
    fontWeight: '700',
  },
  name: {
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
});
