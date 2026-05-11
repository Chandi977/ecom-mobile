import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiPut } from '../services/api';
import { formatPrice } from '../utils/product';
import { showToast } from '../utils/toast';
import { useCartCount } from '../context/CartCountContext';
import { useWishlistCount } from '../context/WishlistCountContext';
import AppHeader from '../components/AppHeader';
import {
  goToCart as navGoToCart,
  goToWishlist as navGoToWishlist,
} from '../utils/navigation';

export default function UtrPaymentScreen({ route, navigation }: any) {
  const { orderId, displayId, amount } = route.params || {};
  const [utr, setUtr] = useState('');
  const [busy, setBusy] = useState(false);
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();

  const submit = async () => {
    if (!utr.trim() || utr.trim().length < 8) {
      showToast('Enter a valid UTR / Transaction reference.', 'error');
      return;
    }
    setBusy(true);
    const res = await apiPut<any>('order/update/utr', {
      _id: orderId,
      utrNumber: utr.trim(),
    });
    setBusy(false);
    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }
    showToast('Payment marked as processed. Awaiting verification.', 'success');
    navigation.replace('Orders');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="utility"
        title="Submit Payment"
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onBack={() => navigation.goBack()}
        onWishlist={() => navGoToWishlist(navigation)}
        onCart={() => navGoToCart(navigation)}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.orderBox}>
            <Text style={styles.orderLabel}>Order</Text>
            <Text style={styles.orderId}>{displayId || orderId}</Text>
            {typeof amount === 'number' && (
              <Text style={styles.amount}>Amount: {formatPrice(amount)}</Text>
            )}
          </View>

          <Text style={styles.note}>
            Pay manually via UPI / bank transfer and enter the UTR / transaction reference number below.
            Your order will move to <Text style={{ fontWeight: '700' }}>Payment Processed</Text> and our team
            will verify the payment.
          </Text>

          <Text style={styles.label}>UTR / Transaction Reference</Text>
          <TextInput
            style={styles.input}
            value={utr}
            onChangeText={setUtr}
            placeholder="e.g. UTR1234567890"
            autoCapitalize="characters"
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={[styles.btn, busy && styles.btnDisabled]} disabled={busy} onPress={submit}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit UTR</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  orderBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  orderLabel: { fontSize: 12, color: '#666' },
  orderId: { fontSize: 17, fontWeight: '700', color: '#111', marginTop: 4 },
  amount: { fontSize: 14, color: '#182C5A', marginTop: 6, fontWeight: '600' },
  note: { fontSize: 12, color: '#555', marginTop: 14, lineHeight: 18 },
  label: { fontSize: 13, color: '#444', fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#FAFAFA',
  },
  btn: {
    backgroundColor: '#182C5A',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  btnDisabled: { backgroundColor: '#9AA0B5' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
