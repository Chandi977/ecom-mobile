import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiPost } from '../services/api';
import AppHeader from '../components/AppHeader';
import { useCartCount } from '../context/CartCountContext';
import { useWishlistCount } from '../context/WishlistCountContext';
import {
  openAppDrawer,
  goToCart as navGoToCart,
  goToWishlist as navGoToWishlist,
} from '../utils/navigation';
import {
  formatPrice,
  getDiscountPercent,
  getProductImage,
  getProductMRP,
  getProductName,
  getProductPrice,
} from '../utils/product';

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setTouched(true);
    const handle = setTimeout(async () => {
      setLoading(true);
      const res = await apiPost<any[]>('product/main/search', {
        search: query.trim(),
        skip: 0,
        limit: 30,
        includeMeta: true,
      });
      if (res.ok) setResults(Array.isArray(res.data) ? res.data : []);
      else setResults([]);
      setLoading(false);
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const imageUri = getProductImage(item);
      const price = getProductPrice(item);
      const mrp = getProductMRP(item);
      const name = getProductName(item);
      const discount = getDiscountPercent(mrp, price);
      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <View style={styles.imgBox}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.img} resizeMode="contain" />
            ) : (
              <View style={[styles.img, { backgroundColor: '#EEE' }]} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={2}>{name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(price)}</Text>
              {mrp > price && <Text style={styles.mrp}>{formatPrice(mrp)}</Text>}
              {discount > 0 && <Text style={styles.disc}>{discount}% off</Text>}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#BBB" />
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="listing"
        title="Search"
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onBack={() => navigation.goBack()}
        onFilter={() => openAppDrawer(navigation)}
        onWishlist={() => navGoToWishlist(navigation)}
        onCart={() => navGoToCart(navigation)}
        activeSearch
        searchValue={query}
        onChangeSearch={setQuery}
        onClearSearch={() => setQuery('')}
        searchPlaceholder="Search products…"
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#182C5A" />
        </View>
      ) : results.length === 0 && touched && query.trim() ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color="#BBB" />
          <Text style={styles.emptyTitle}>No products match "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(it: any, i) => `${it._id || i}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          windowSize={5}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={8}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 14, color: '#666', marginTop: 10 },
  list: { padding: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  imgBox: { width: 60, height: 60, backgroundColor: '#FAFAFA', borderRadius: 6 },
  img: { width: 60, height: 60, borderRadius: 6 },
  name: { fontSize: 13, color: '#111', fontWeight: '600', lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  price: { fontSize: 13, fontWeight: '700', color: '#182C5A' },
  mrp: { fontSize: 11, color: '#999', textDecorationLine: 'line-through' },
  disc: { fontSize: 11, color: '#E92227', fontWeight: '600' },
});
