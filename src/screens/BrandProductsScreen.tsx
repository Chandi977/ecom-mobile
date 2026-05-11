import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchBrandProductsPage, PRODUCT_PAGE_SIZE } from '../services/catalog';
import AppHeader from '../components/AppHeader';
import { useCartCount } from '../context/CartCountContext';
import { useWishlistCount } from '../context/WishlistCountContext';
import {
  openAppDrawer,
  goToCart as navGoToCart,
  goToSearch as navGoToSearch,
  goToWishlist as navGoToWishlist,
} from '../utils/navigation';
import { SkeletonBox } from '../components/Skeleton';
import ProductGridCard from '../components/ProductGridCard';

function ProductGridSkeleton() {
  return (
    <View style={gridStyles.card}>
      <SkeletonBox width="100%" height={120} borderRadius={6} />
      <SkeletonBox width="60%" height={14} style={gridStyles.line1} />
      <SkeletonBox width="40%" height={12} style={gridStyles.line2} />
    </View>
  );
}

const gridStyles = StyleSheet.create({
  card: { flex: 1, margin: 5, backgroundColor: '#fff', borderRadius: 8, padding: 8 },
  line1: { marginTop: 8 },
  line2: { marginTop: 5 },
});

export default function BrandProductsScreen({ route, navigation }: any) {
  const { brand } = route.params;
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const productsLengthRef = React.useRef(0);
  const fetchingRef = React.useRef(false);
  const fetchCountRef = React.useRef(0);

  useEffect(() => {
    productsLengthRef.current = products.length;
  }, [products.length]);

  const fetchProducts = useCallback(async (reset = true, force = false) => {
    if (!brand?._id || (fetchingRef.current && !reset)) return;
    fetchingRef.current = true;
    const count = fetchCountRef.current + 1;
    fetchCountRef.current = count;
    const skip = reset ? 0 : productsLengthRef.current;
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      const page = await fetchBrandProductsPage(
        String(brand._id),
        skip,
        PRODUCT_PAGE_SIZE,
        force,
      );
      if (count !== fetchCountRef.current) return;
      setProducts((prev) => (reset ? page.items : [...prev, ...page.items]));
      setHasMore(Boolean(page.meta?.hasMore));
    } catch (e: any) {
      if (count !== fetchCountRef.current) return;
      setError('Failed to load products. Tap to retry.');
      console.error('BrandProductsScreen fetch error:', e?.message || e);
    } finally {
      if (count === fetchCountRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
      fetchingRef.current = false;
    }
  }, [brand._id]);

  useEffect(() => {
    setProducts([]);
    setHasMore(true);
    productsLengthRef.current = 0;
    fetchProducts(true);
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(true, true);
  }, [fetchProducts]);

  const onEndReached = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchProducts(false);
    }
  }, [fetchProducts, hasMore, loading, loadingMore]);

  const renderSkeletons = () => (
    <FlatList
      data={Array.from({ length: 6 })}
      keyExtractor={(_, i) => `sk-${i}`}
      numColumns={2}
      renderItem={() => (
        <View style={{ flex: 1, margin: 5 }}>
          <ProductGridSkeleton />
        </View>
      )}
      scrollEnabled={false}
      style={{ paddingTop: 8 }}
    />
  );

  const openProduct = useCallback(
    (product: any) => navigation.navigate('ProductDetail', { product }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => <ProductGridCard product={item} onPress={openProduct} />,
    [openProduct],
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#182C5A" />
      </View>
    );
  }, [loadingMore]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="listing"
        title={brand.name}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onBack={() => navigation.goBack()}
        onSearch={() => navGoToSearch(navigation)}
        onFilter={() => openAppDrawer(navigation)}
        onWishlist={() => navGoToWishlist(navigation)}
        onCart={() => navGoToCart(navigation)}
      />

      {error && !loading && (
        <TouchableOpacity style={styles.errorBox} onPress={() => fetchProducts(true, true)}>
          <Text style={styles.errorText}>{error}</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        renderSkeletons()
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No products found for {brand.name}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item: any) => item._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.45}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          initialNumToRender={8}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  list: { padding: 5, paddingBottom: 20 },
  footerLoader: { paddingVertical: 16, alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 15, color: '#999', textAlign: 'center' },
  errorBox: {
    margin: 14,
    padding: 12,
    backgroundColor: '#FFF3F3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    alignItems: 'center',
  },
  errorText: { fontSize: 13, color: '#C62828' },
});
