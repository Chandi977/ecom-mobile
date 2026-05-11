import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import {
  formatPrice,
  getProductImage,
  getProductMRP,
  getProductName,
  getProductPrice,
} from '../utils/product';
import { showToast } from '../utils/toast';
import AppHeader from '../components/AppHeader';
import { goToCart as navGoToCart } from '../utils/navigation';

function getId(item: any): string {
  const p = item?.product;
  if (p && typeof p === 'object') return String(p._id || p.id || '');
  return String(p || '');
}

export default function WishlistScreen({ navigation }: any) {
  const { items, refresh, remove, loading, count: wishlistCount } = useWishlist();
  const { addItem, count: cartCount } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleRemove = useCallback(async (id: string) => {
    setBusyId(id);
    const r = await remove(id);
    setBusyId(null);
    showToast(r.message, r.ok ? 'info' : 'error');
  }, [remove]);

  const handleAddToCart = useCallback(async (productObj: any) => {
    if (!productObj?._id) return;
    const tier = Array.isArray(productObj?.priceList) ? productObj.priceList[0] : null;
    if (!tier) {
      showToast('Pack size unavailable. Open product to add to cart.', 'error');
      return;
    }
    setBusyId(String(productObj._id));
    const r = await addItem({
      product: productObj,
      quantity: 1,
      price: Number(tier.SP) || 0,
      packSize: Number(tier.number) || 1,
      packWeight: Number(tier.pack_weight) || 0,
      stock: Number(tier.stock_quantity) || 0,
    });
    setBusyId(null);
    showToast(r.message, r.ok ? 'success' : 'error');
  }, [addItem]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const productObj = typeof item.product === 'object' ? item.product : null;
    const id = getId(item);
    const img = productObj ? getProductImage(productObj) : undefined;
    const name = productObj ? getProductName(productObj) : 'Product';
    const price = productObj ? getProductPrice(productObj) : item.price || 0;
    const mrp = productObj ? getProductMRP(productObj) : 0;
    const isBusy = busyId === id;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => productObj && navigation.navigate('ProductDetail', { product: productObj })}
      >
        <View style={styles.imgBox}>
          {img ? (
            <Image source={{ uri: img }} style={styles.img} resizeMode="contain" />
          ) : (
            <View style={[styles.img, { backgroundColor: '#EEE' }]} />
          )}
        </View>
        <View style={styles.detail}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(price)}</Text>
            {mrp > price && <Text style={styles.mrp}>{formatPrice(mrp)}</Text>}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.addBtn, isBusy && styles.btnDisabled]}
              onPress={() => productObj && handleAddToCart(productObj)}
              disabled={isBusy}
            >
              {isBusy ? <ActivityIndicator color="#fff" size="small" /> : (
                <>
                  <Ionicons name="cart-outline" size={14} color="#fff" />
                  <Text style={styles.addText}>Add to Cart</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.delBtn} onPress={() => handleRemove(id)}>
              <Ionicons name="trash-outline" size={18} color="#C62828" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [busyId, handleAddToCart, handleRemove, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="utility"
        title={`My Wishlist${items.length > 0 ? ` (${items.length})` : ''}`}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onBack={() => (navigation.canGoBack?.() ? navigation.goBack() : navigation.navigate('Main'))}
        onWishlist={() => {}}
        onCart={() => navGoToCart(navigation)}
      />

      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#182C5A" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={64} color="#BBB" />
          <Text style={styles.emptyTitle}>No favourites yet</Text>
          <Text style={styles.emptySub}>Tap the heart on any product to save it for later.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it: any, i) => `${getId(it)}-${i}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#444', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center' },
  list: { padding: 10, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  imgBox: { width: 86, height: 86, backgroundColor: '#FAFAFA', borderRadius: 6, marginRight: 12, justifyContent: 'center' },
  img: { width: 86, height: 86, borderRadius: 6 },
  detail: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 13, color: '#111', fontWeight: '600', lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  price: { fontSize: 14, fontWeight: '700', color: '#182C5A' },
  mrp: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#182C5A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  addText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  delBtn: { marginLeft: 'auto', padding: 6 },
});
