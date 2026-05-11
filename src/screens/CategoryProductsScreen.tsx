import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { apiGet } from '../services/api';
import { fetchFilteredProductsPage, PRODUCT_PAGE_SIZE } from '../services/catalog';
import AppHeader from '../components/AppHeader';
import { useCartCount } from '../context/CartCountContext';
import { useWishlistCount } from '../context/WishlistCountContext';
import {
  openAppDrawer,
  goToCart as navGoToCart,
  goToSearch as navGoToSearch,
  goToWishlist as navGoToWishlist,
} from '../utils/navigation';
import ProductGridCard from '../components/ProductGridCard';

let categoriesCache: any[] | null = null;
let cachePromise: Promise<any[]> | null = null;

async function fetchAllCategories(): Promise<any[]> {
  if (categoriesCache) return categoriesCache;
  if (cachePromise) return cachePromise;
  cachePromise = (async () => {
    try {
      const res = await apiGet<any>('category/all');
      if (res.ok && Array.isArray(res.data)) {
        categoriesCache = res.data;
        return res.data;
      }
      return [];
    } catch {
      return [];
    }
  })();
  const result = await cachePromise;
  return result;
}

function normalize(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function wordTokens(val: string): string[] {
  return val.toLowerCase().split(/[\s-]+/).filter(Boolean);
}

function resolveCategoryIds(rawFilter: any, allCategories: any[], catalogKey: string, title: string): any {
  if (!rawFilter.category) return rawFilter;
  const rawIds = Array.isArray(rawFilter.category) ? rawFilter.category : [rawFilter.category];
  const rawTerms = [catalogKey, title].filter(Boolean);
  const searchTerms = rawTerms.map((s) => normalize(s));
  const searchWords = rawTerms.flatMap((s) => wordTokens(s));
  const resolvedIds = rawIds.map((id: string) => {
    if (/^[0-9a-fA-F]{24}$/.test(id) && allCategories.some((c: any) => c._id === id)) {
      return id;
    }
    for (const term of searchTerms) {
      if (!term) continue;
      const byExact = allCategories.find((c: any) => {
        const cNorm = normalize((c.slug || '') + (c.name || ''));
        return cNorm === term;
      });
      if (byExact) return byExact._id;
    }
    for (const words of [searchWords, searchTerms.flatMap((t) => wordTokens(t))]) {
      for (const word of words) {
        if (!word || word.length < 3) continue;
        const byWord = allCategories.find((c: any) => {
          const cNorm = normalize((c.name || '') + ' ' + (c.slug || ''));
          const cWords = wordTokens(cNorm);
          return cWords.some((cw: string) => cw.includes(word) || word.includes(cw));
        });
        if (byWord) return byWord._id;
      }
    }
    return id;
  });
  return { ...rawFilter, category: resolvedIds.length === 1 ? resolvedIds[0] : resolvedIds };
}

export default function CategoryProductsScreen({ route, navigation }: any) {
  const legacyCategory = route.params?.category;
  const catalog = route.params?.catalog || legacyCategory;
  const title = catalog?.name || legacyCategory?.name || 'Products';
  const catalogKey: string = catalog?.key || '';
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();

  const [filter, setFilter] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const fetchCountRef = useRef(0);
  const productsLengthRef = useRef(0);
  const fetchingRef = useRef(false);

  useEffect(() => {
    productsLengthRef.current = products.length;
  }, [products.length]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rawFilter = catalog?.filter || (legacyCategory?._id ? { category: legacyCategory._id } : {});
      const allCategories = await fetchAllCategories();
      if (cancelled) return;
      const resolved = resolveCategoryIds(rawFilter, allCategories, catalogKey, title);
      if (!cancelled) setFilter(resolved);
    })();
    return () => { cancelled = true; };
  }, [catalog, legacyCategory, catalogKey]);

  const doFetch = useCallback(async (f: any, reset = true) => {
    if (!f || (fetchingRef.current && !reset)) return;
    fetchingRef.current = true;
    const count = fetchCountRef.current + 1;
    fetchCountRef.current = count;
    const skip = reset ? 0 : productsLengthRef.current;
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      const page = await fetchFilteredProductsPage(f, skip, PRODUCT_PAGE_SIZE);
      if (count !== fetchCountRef.current) return;
      setProducts((prev) => (reset ? page.items : [...prev, ...page.items]));
      setHasMore(Boolean(page.meta?.hasMore));
    } catch (e: any) {
      if (count !== fetchCountRef.current) return;
      setError(e?.message || 'Failed to load products. Tap to retry.');
    } finally {
      if (count === fetchCountRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (filter) {
      setProducts([]);
      setHasMore(true);
      productsLengthRef.current = 0;
      doFetch(filter, true);
    }
  }, [filter, doFetch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (filter) doFetch(filter, true);
  }, [filter, doFetch]);

  const openProduct = useCallback((product: any) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => <ProductGridCard product={item} onPress={openProduct} />,
    [openProduct],
  );

  const onEndReached = useCallback(() => {
    if (!loading && !loadingMore && hasMore && filter) {
      doFetch(filter, false);
    }
  }, [doFetch, filter, hasMore, loading, loadingMore]);

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
        title={title}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onBack={() => navigation.goBack()}
        onSearch={() => navGoToSearch(navigation)}
        onFilter={() => openAppDrawer(navigation)}
        onWishlist={() => navGoToWishlist(navigation)}
        onCart={() => navGoToCart(navigation)}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#182C5A" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No products found in {title}.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p: any) => p._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#C62828', marginBottom: 12 },
  emptyText: { color: '#666', fontSize: 14 },
  retryBtn: { backgroundColor: '#182C5A', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  list: { padding: 5, paddingBottom: 20 },
  footerLoader: { paddingVertical: 16, alignItems: 'center' },
});
