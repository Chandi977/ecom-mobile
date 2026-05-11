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
import { Ionicons } from '@expo/vector-icons';
import { apiGet } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCartCount } from '../context/CartCountContext';
import { useWishlistCount } from '../context/WishlistCountContext';
import { formatPrice } from '../utils/product';
import AppHeader from '../components/AppHeader';
import {
  goToCart as navGoToCart,
  goToWishlist as navGoToWishlist,
} from '../utils/navigation';

interface Order {
  _id: string;
  orderId?: string;
  status?: string;
  paymentStatus?: string;
  totalOrderValue?: number;
  createdAt?: string;
  items?: any[];
  trackingId?: string;
  deliveryPartner?: string;
}

function statusColor(status?: string) {
  switch (status) {
    case 'placed':
      return '#F9A825';
    case 'Payment Done':
    case 'Payment Verified':
      return '#2E7D32';
    case 'Dispatched':
      return '#1976D2';
    case 'Delivered':
      return '#388E3C';
    case 'Cancelled':
    case 'Expired':
      return '#C62828';
    default:
      return '#666';
  }
}

function paymentColor(p?: string) {
  switch (p) {
    case 'Payment Verified':
      return '#2E7D32';
    case 'Payment Processed':
      return '#1976D2';
    case 'Payment Failed':
    case 'Payment Abandoned':
    case 'Cancelled':
      return '#C62828';
    case 'Not Paid':
      return '#F9A825';
    default:
      return '#666';
  }
}

export default function OrdersScreen({ navigation }: any) {
  const { user, token } = useAuth();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token || !user?.email_address) {
      setLoading(false);
      return;
    }
    setError(null);
    const res = await apiGet<Order[]>(`my/orders/${encodeURIComponent(user.email_address)}`);
    if (res.ok) {
      const data = Array.isArray(res.data) ? res.data : [];
      // Most recent first
      data.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setOrders(data);
    } else {
      setError(res.message);
    }
    setLoading(false);
    setRefreshing(false);
  }, [token, user?.email_address]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const renderItem = useCallback(({ item }: { item: Order }) => {
    const canPayUtr = item.paymentStatus === 'Not Paid' || item.paymentStatus === 'Payment Failed' || item.paymentStatus === 'Payment Abandoned';
    return (
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View>
            <Text style={styles.orderId}>{item.orderId || item._id.slice(-8)}</Text>
            {item.createdAt && (
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            )}
          </View>
          <Text style={styles.amount}>{formatPrice(item.totalOrderValue || 0)}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusPill, { backgroundColor: statusColor(item.status) + '22' }]}>
            <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status || 'placed'}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: paymentColor(item.paymentStatus) + '22' }]}>
            <Text style={[styles.statusText, { color: paymentColor(item.paymentStatus) }]}>{item.paymentStatus || 'Not Paid'}</Text>
          </View>
        </View>
        {item.trackingId && (
          <Text style={styles.tracking}>
            Tracking: {item.trackingId} {item.deliveryPartner ? `(${item.deliveryPartner})` : ''}
          </Text>
        )}
        {canPayUtr && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() =>
              navigation.navigate('UtrPayment', {
                orderId: item._id,
                displayId: item.orderId,
                amount: item.totalOrderValue,
              })
            }
          >
            <Ionicons name="cash-outline" size={14} color="#fff" />
            <Text style={styles.payText}>Complete Payment</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="utility"
        title="My Orders"
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onBack={() => (navigation.canGoBack?.() ? navigation.goBack() : navigation.navigate('Main'))}
        onWishlist={() => navGoToWishlist(navigation)}
        onCart={() => navGoToCart(navigation)}
      />

      {!token || !user?.email_address ? (
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color="#999" />
          <Text style={styles.emptyTitle}>Sign in to view orders</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#182C5A" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={fetchOrders}>
            <Text style={styles.primaryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="receipt-outline" size={64} color="#BBB" />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>Your past and current orders will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
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
  errorText: { color: '#C62828', fontSize: 13, marginBottom: 12 },
  primaryBtn: {
    backgroundColor: '#182C5A',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 14,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  list: { padding: 10, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: '700', color: '#111' },
  date: { fontSize: 11, color: '#777', marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700', color: '#182C5A' },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  tracking: { marginTop: 8, fontSize: 11, color: '#555' },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#182C5A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  payText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
