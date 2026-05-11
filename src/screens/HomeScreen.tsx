import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchHomeCatalog } from '../services/catalog';
import { getProductBrandKey } from '../utils/product';
import { useCartCount } from '../context/CartCountContext';
import { useWishlistCount } from '../context/WishlistCountContext';
import AppHeader from '../components/AppHeader';
import {
  openAppDrawer,
  goToCart as navGoToCart,
  goToWishlist as navGoToWishlist,
} from '../utils/navigation';
import BrandCard from '../components/BrandCard';
import DealsCard from '../components/DealsCard';
import TopCard from '../components/TopCard';
import Carousel from '../components/Carousel';
import {
  BrandCardSkeleton,
  ProductCardSkeleton,
} from '../components/Skeleton';

const BRAND_SECTIONS = [
  { key: 'amazon', label: 'Amazon Packaging' },
  { key: 'flipkart', label: 'Flipkart Packaging' },
  { key: 'myntra', label: 'Myntra Packaging' },
  { key: 'ajio', label: 'Ajio Packaging' },
];
const HOME_ROW_LIMIT = 12;
const HOME_BRANDS_LIMIT = 10;

type Section =
  | { type: 'carousel' }
  | { type: 'error'; message: string; onRetry: () => void }
  | { type: 'brands'; items: any[]; loading: boolean; onPress: (b: any) => void }
  | { type: 'topProducts'; items: any[]; loading: boolean; onPress: (p: any) => void }
  | { type: 'deals'; items: any[]; loading: boolean; onPress: (p: any) => void }
  | { type: 'brandSection'; key: string; label: string; items: any[]; loading: boolean; onPress: (p: any) => void };

function SectionSkeletons({ count = 4 }: { count?: number }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ScrollView>
  );
}

function BrandSkeletons() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {Array.from({ length: 5 }).map((_, i) => (
        <BrandCardSkeleton key={i} />
      ))}
    </ScrollView>
  );
}

const BrandsRow = memo(function BrandsRow({ items, onPress }: { items: any[]; onPress: (b: any) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {items.map((brand: any) => (
        <BrandCard key={brand._id} brand={brand} onPress={() => onPress(brand)} />
      ))}
    </ScrollView>
  );
});

const ProductsRow = memo(function ProductsRow({ items, onPress }: { items: any[]; onPress: (p: any) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {items.map((item: any) => (
        <DealsCard key={item._id} product={item} onPress={() => onPress(item)} />
      ))}
    </ScrollView>
  );
});

const TopProductsRow = memo(function TopProductsRow({ items, onPress }: { items: any[]; onPress: (p: any) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {items.map((item: any) => (
        <TopCard key={item._id} product={item} onPress={() => onPress(item)} />
      ))}
    </ScrollView>
  );
});

function renderSection({ item }: { item: Section }) {
  switch (item.type) {
    case 'carousel':
      return <Carousel />;
    case 'error':
      return (
        <TouchableOpacity style={styles.errorBox} onPress={item.onRetry}>
          <Text style={styles.errorText}>{item.message}</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      );
    case 'brands':
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Brands</Text>
          {item.loading ? <BrandSkeletons /> : <BrandsRow items={item.items} onPress={item.onPress} />}
        </View>
      );
    case 'topProducts':
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop From Top Products</Text>
          {item.loading ? <SectionSkeletons /> : <TopProductsRow items={item.items} onPress={item.onPress} />}
        </View>
      );
    case 'deals':
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best Deals on Featured Products</Text>
          {item.loading ? <SectionSkeletons /> : <ProductsRow items={item.items} onPress={item.onPress} />}
        </View>
      );
    case 'brandSection':
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{item.label}</Text>
          {item.loading ? <SectionSkeletons /> : <ProductsRow items={item.items} onPress={item.onPress} />}
        </View>
      );
    default:
      return null;
  }
}



export default function HomeScreen({ navigation }: any) {
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    try {
      setError(null);
      const catalog = await fetchHomeCatalog(force);
      setBrands(catalog.brands.slice(0, HOME_BRANDS_LIMIT));
      setProducts(catalog.products);
    } catch (e: any) {
      setError('Failed to load. Please check your connection.');
      console.error('HomeScreen fetch error:', e?.message || e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    const task = InteractionManager.runAfterInteractions(() => {
      fetchData();
    });
    return () => task.cancel();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  const topProducts = useMemo(
    () => products.filter((p: any) => p?.top_product === true).slice(0, HOME_ROW_LIMIT),
    [products],
  );
  const dealProducts = useMemo(
    () => products.filter((p: any) => p?.deal_product === true).slice(0, HOME_ROW_LIMIT),
    [products],
  );
  const byBrand = useCallback(
    (key: string) => products.filter((p: any) => getProductBrandKey(p) === key).slice(0, HOME_ROW_LIMIT),
    [products],
  );

  const navigateToProduct = useCallback(
    (product: any) => navigation.navigate('ProductDetail', { product }),
    [navigation],
  );
  const navigateToBrand = useCallback(
    (brand: any) => navigation.navigate('BrandProducts', { brand }),
    [navigation],
  );
  const onMenu = useCallback(() => openAppDrawer(navigation), [navigation]);
  const onSearch = useCallback(() => navigation.navigate('Search'), [navigation]);
  const onFilter = useCallback(() => openAppDrawer(navigation), [navigation]);
  const onWishlist = useCallback(() => navGoToWishlist(navigation), [navigation]);
  const onCart = useCallback(() => navGoToCart(navigation), [navigation]);

  const sections: Section[] = useMemo(() => {
    const list: Section[] = [{ type: 'carousel' }];
    if (error) list.push({ type: 'error', message: error, onRetry: fetchData });
    list.push({
      type: 'brands',
      items: brands,
      loading,
      onPress: navigateToBrand,
    });
    if (loading || topProducts.length > 0) {
      list.push({
        type: 'topProducts',
        items: topProducts,
        loading,
        onPress: navigateToProduct,
      });
    }
    if (loading || dealProducts.length > 0) {
      list.push({
        type: 'deals',
        items: dealProducts,
        loading,
        onPress: navigateToProduct,
      });
    }
    const brandSections = BRAND_SECTIONS.map(({ key, label }) => ({
      key,
      label,
      items: loading ? [] : byBrand(key),
    }));

    for (const { key, label, items } of brandSections) {
      if (!loading && items.length === 0) continue;
      list.push({
        type: 'brandSection',
        key,
        label,
        items,
        loading,
        onPress: navigateToProduct,
      });
    }
    return list;
  }, [brands, topProducts, dealProducts, loading, error, fetchData, navigateToBrand, navigateToProduct, byBrand]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="home"
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onMenu={onMenu}
        onSearch={onSearch}
        onFilter={onFilter}
        onWishlist={onWishlist}
        onCart={onCart}
      />
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item: Section, index: number) => item.type === 'brandSection' ? `bs-${item.key}` : `${item.type}-${index}`}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        initialNumToRender={3}
        windowSize={3}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  section: { marginTop: 14, paddingHorizontal: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#182C5A',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  row: { flexDirection: 'row' },
  errorBox: {
    margin: 16,
    padding: 14,
    backgroundColor: '#FFF3F3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    alignItems: 'center',
  },
  errorText: { fontSize: 14, color: '#C62828', fontWeight: '500' },
  retryText: { fontSize: 12, color: '#E53935', marginTop: 4 },
});
