import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useWishlistCount } from '../context/WishlistCountContext';
import { useCartCount } from '../context/CartCountContext';
import AppHeader from '../components/AppHeader';
import {
  openAppDrawer,
  goToCart as navGoToCart,
  goToWishlist as navGoToWishlist,
} from '../utils/navigation';

export default function ProfileScreen({ navigation }: any) {
  const { user, token, logout } = useAuth();
  const wishCount = useWishlistCount();
  const cartCount = useCartCount();

  const signedIn = Boolean(token && user?._id);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="utility"
        title="My Account"
        cartCount={cartCount}
        wishlistCount={wishCount}
        onBack={() => (navigation.canGoBack?.() ? navigation.goBack() : openAppDrawer(navigation))}
        onWishlist={() => navGoToWishlist(navigation)}
        onCart={() => navGoToCart(navigation)}
      />
      <ScrollView style={styles.container}>
        {!signedIn ? (
          <View style={styles.guestBox}>
            <Ionicons name="person-circle-outline" size={64} color="#182C5A" />
            <Text style={styles.guestTitle}>You are not signed in</Text>
            <Text style={styles.guestSub}>Sign in to view orders, save addresses and sync your cart & wishlist.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.secondaryBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.userBox}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>
                  {(user?.first_name?.[0] || user?.email_address?.[0] || '?').toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName} numberOfLines={1}>
                  {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>{user?.email_address}</Text>
                {user?.mobile_number ? (
                  <Text style={styles.userMobile}>{user.mobile_number}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.row}>
              <Row icon="bag-handle-outline" label="My Orders" onPress={() => navigation.navigate('Orders')} />
              <Row icon="heart-outline" label={`Wishlist (${wishCount})`} onPress={() => navigation.navigate('Wishlist')} />
              <Row icon="cart-outline" label={`Cart (${cartCount})`} onPress={() => navigation.navigate('CartTab' as never)} />
            </View>

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#C62828' }]} onPress={handleLogout}>
              <Text style={styles.primaryBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.rowItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={22} color="#182C5A" />
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#AAA" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1 },
  guestBox: { alignItems: 'center', padding: 28, marginTop: 30 },
  guestTitle: { fontSize: 18, fontWeight: '700', color: '#182C5A', marginTop: 10 },
  guestSub: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 6, paddingHorizontal: 20 },
  primaryBtn: {
    backgroundColor: '#182C5A',
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 220,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 10,
    minWidth: 220,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#182C5A',
  },
  secondaryBtnText: { color: '#182C5A', fontWeight: '600', fontSize: 14 },
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 10,
    gap: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#182C5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontSize: 22, fontWeight: '700' },
  userName: { fontSize: 16, fontWeight: '700', color: '#111' },
  userEmail: { fontSize: 13, color: '#666', marginTop: 2 },
  userMobile: { fontSize: 13, color: '#666', marginTop: 2 },
  row: { backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 10, overflow: 'hidden' },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 14,
  },
  rowLabel: { flex: 1, fontSize: 14, color: '#222', fontWeight: '500' },
});
