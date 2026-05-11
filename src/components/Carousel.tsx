import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, View, TouchableOpacity, Linking, useWindowDimensions } from 'react-native';
import { BannerSkeleton } from './Skeleton';

const BANNERS = [
  {
    id: '1',
    image: 'https://store.prempackaging.com/backgroundslider.png',
    url: 'https://prempackaging.com/innovation',
  },
  {
    id: '2',
    image: 'https://store.prempackaging.com/BannerBopp.jpg',
    url: null,
  },
  {
    id: '3',
    image: 'https://store.prempackaging.com/BannerPaperBagNew.jpg',
    url: null,
  },
  {
    id: '4',
    image: 'https://store.prempackaging.com/BannerCorugatedBox.jpg',
    url: null,
  },
];

export default function Carousel() {
  const { width } = useWindowDimensions();
  const flatRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % BANNERS.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const onScroll = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== activeIndex) setActiveIndex(idx);
  }, [width, activeIndex]);

  return (
    <View style={[styles.container, { height: width * 0.5 }]}>
      <FlatList
        ref={flatRef}
        data={BANNERS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={item.url ? 0.85 : 1}
            onPress={() => item.url && Linking.openURL(item.url)}
          >
            {imageErrors[item.id] ? (
              <BannerSkeleton />
            ) : (
              <Image
                source={{ uri: item.image }}
                style={{ width, height: width * 0.5 }}
                resizeMode="cover"
                onError={() => setImageErrors((prev) => ({ ...prev, [item.id]: true }))}
              />
            )}
          </TouchableOpacity>
        )}
      />
      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 10, position: 'relative' },
  dots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 9,
    height: 9,
  },
});
