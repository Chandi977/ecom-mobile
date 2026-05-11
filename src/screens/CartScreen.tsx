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
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice, getProductImage, getProductName } from '../utils/product';
import { showToast } from '../utils/toast';
import AppHeader from '../components/AppHeader';
import { goToWishlist as navGoToWishlist } from '../utils/navigation';

function getId(line: any): string {
  const p = line?.product;
  if (p && typeof p === 'object') return String(p._id || p.id || '');
  return String(p || '');
}

export default function CartScreen({ navigation }: any) {
  const { cart, refresh, alterQuantity, removeItem, loading, count: cartCount } = useCart();
  const { token } = useAuth();
  const { count: wishlistCount } = useWishlist();
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

  const handleInc = async (line: any) => {
    const id = getId(line);
    if (!id) return;
    setBusyId(id);
    const r = await alterQuantity(id, (line.quantity || 1) + 1, line.packSize);
    setBusyId(null);
    if (!r.ok) showToast(r.message, 'error');
  };
  const handleDec = async (line: any) => {
    const id = getId(line);
    if (!id || (line.quantity || 1) <= 1) return;
    setBusyId(id);
    const r = await alterQuantity(id, (line.quantity || 1) - 1, line.packSize);
    setBusyId(null);
    if (!r.ok) showToast(r.message, 'error');
  };
  const handleRemove = async (line: any) => {
    const id = getId(line);
    if (!id) return;
    setBusyId(id);
    const r = await removeItem(id);
    setBusyId(null);
    showToast(r.message, r.ok ? 'info' : 'error');
  };

  const items = cart?.products || [];
  const subtotal = useMemo(
    () => items.reduce(
      (t: number, x: any) => t + (Number(x.price) || 0) * (Number(x.quantity) || 0),
      0,
    ),
    [items],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const id = getId(item);
      const productObj = typeof item.product === 'object' ? item.product : null;
      const img = productObj ? getProductImage(productObj) : undefined;
      const name = productObj ? getProductName(productObj) : item?.name || 'Product';
      const isBusy = busyId === id;
      return (
        <View style={styles.card}>
          <View style={styles.imgBox}>
            {img ? (
              <Image source={{ uri: img }} style={styles.img} resizeMode="contain" />
            ) : (
              <View style={[styles.img, { backgroundColor: '#EEE' }]} />
            )}
          </View>
          <View style={styles.detail}>
            <Text style={styles.name} numberOfLines={2}>{name}</Text>
            {item.packSize ? <Text style={styles.pack}>Pack of {item.packSize}</Text> : null}
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={[styles.qtyBtn, (isBusy || (item.quantity || 1) <= 1) && styles.qtyBtnDisabled]}
                onPress={() => handleDec(item)}
                disabled={isBusy || (item.quantity || 1) <= 1}
              >
                <Ionicons name="remove" size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, isBusy && styles.qtyBtnDisabled]}
                onPress={() => handleInc(item)}
                disabled={isBusy}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item)}>
                <Ionicons name="trash-outline" size={18} color="#C62828" />
              </TouchableOpacity>
            </View>
          </View>
          {isBusy && (
            <View style={styles.busyOverlay}>
              <ActivityIndicator color="#182C5A" />
            </View>
          )}
        </View>
      );
    },
    [busyId, handleDec, handleInc, handleRemove],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="utility"
        title={`My Cart${items.length > 0 ? ` (${items.length})` : ''}`}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onBack={() => (navigation.canGoBack?.() ? navigation.goBack() : navigation.navigate('HomeTab'))}
        onWishlist={() => navGoToWishlist(navigation)}
        onCart={() => {}}
      />

      {loading && !cart ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#182C5A" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cart-outline" size={64} color="#BBB" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Browse products and add them to your cart.</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('HomeTab' as never)}
          >
            <Text style={styles.primaryBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(it: any, i) => `${getId(it)}-${it.packSize || i}`}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            windowSize={5}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            initialNumToRender={8}
          />
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <Text style={styles.summaryNote}>Shipping & taxes are calculated at checkout.</Text>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => {
                if (!token) {
                  navigation.navigate('Login', { redirectTo: 'Checkout' });
                } else {
                  navigation.navigate('Checkout');
                }
              }}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#444', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: '#182C5A',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 18,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  list: { padding: 10, paddingBottom: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  imgBox: { width: 86, height: 86, backgroundColor: '#FAFAFA', borderRadius: 6, marginRight: 12, justifyContent: 'center' },
  img: { width: 86, height: 86, borderRadius: 6 },
  detail: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 13, color: '#111', fontWeight: '600', lineHeight: 18 },
  pack: { fontSize: 11, color: '#666', marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', color: '#182C5A', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#182C5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: { backgroundColor: '#BFC4D6' },
  qty: { minWidth: 24, textAlign: 'center', fontSize: 14, fontWeight: '700' },
  removeBtn: { marginLeft: 'auto', padding: 6 },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  summary: {
    backgroundColor: '#fff',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryLabel: { fontSize: 13, color: '#666' },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#111' },
  summaryNote: { fontSize: 11, color: '#888' },
  checkoutBtn: {
    backgroundColor: '#182C5A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.4 },
});
