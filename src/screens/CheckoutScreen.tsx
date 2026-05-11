import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlistCount } from '../context/WishlistCountContext';
import { apiPost } from '../services/api';
import { formatPrice } from '../utils/product';
import { showToast } from '../utils/toast';
import AppHeader from '../components/AppHeader';
import {
  goToCart as navGoToCart,
  goToWishlist as navGoToWishlist,
} from '../utils/navigation';

interface Form {
  name: string;
  phone: string;
  email: string;
  address: string;
  landmark: string;
  town: string;
  state: string;
  pincode: string;
  gstin: string;
}

export default function CheckoutScreen({ navigation }: any) {
  const { user, token } = useAuth();
  const { cart, emptyCart, count: cartCount } = useCart();
  const wishlistCount = useWishlistCount();
  const [form, setForm] = useState<Form>({
    name: [user?.first_name, user?.last_name].filter(Boolean).join(' '),
    phone: user?.mobile_number || '',
    email: user?.email_address || '',
    address: '',
    landmark: '',
    town: '',
    state: '',
    pincode: '',
    gstin: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !user?._id) {
      navigation.replace('Login', { redirectTo: 'Checkout' });
    }
  }, [token, user?._id]);

  const set = (k: keyof Form) => (v: string) => setForm((s) => ({ ...s, [k]: v }));

  const items = cart?.products || [];
  const subtotal = items.reduce(
    (t: number, x: any) => t + (Number(x.price) || 0) * (Number(x.quantity) || 0),
    0,
  );

  const validate = (): string | null => {
    if (!items.length) return 'Your cart is empty.';
    if (!form.name.trim()) return 'Name is required.';
    if (!/^\d{10}$/.test(form.phone.trim())) return 'Enter a valid 10-digit phone.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Enter a valid email.';
    if (!form.address.trim()) return 'Address is required.';
    if (!form.town.trim()) return 'Town/City is required.';
    if (!form.state.trim()) return 'State is required.';
    if (!/^\d{6}$/.test(form.pincode.trim())) return 'Enter a valid 6-digit pincode.';
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      showToast(err, 'error');
      return;
    }
    setSubmitting(true);
    const payload = {
      items: items.map((x: any) => ({
        product: typeof x.product === 'object' ? x.product?._id : x.product,
        packSize: Number(x.packSize) || 1,
        quantity: Number(x.quantity) || 1,
        price: Number(x.price) || 0,
      })),
      name: form.name.trim(),
      phone: form.phone.trim(),
      mobile: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      landmark: form.landmark.trim(),
      town: form.town.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      gstin: form.gstin.trim(),
      user: user?._id,
      totalOrderValue: subtotal,
      totalCartValue: subtotal,
      paymentStatus: 'Not Paid',
      utrNumber: '0',
    };
    const res = await apiPost<any>('order/create', payload);
    setSubmitting(false);
    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }
    const order = res.data || {};
    Alert.alert(
      'Order placed',
      `Order ID: ${order.orderId || order._id || 'pending'}\nWould you like to enter UTR to mark payment?`,
      [
        {
          text: 'Pay later',
          style: 'cancel',
          onPress: async () => {
            await emptyCart();
            navigation.replace('Orders');
          },
        },
        {
          text: 'Enter UTR',
          onPress: async () => {
            await emptyCart();
            navigation.replace('UtrPayment', {
              orderId: order._id,
              displayId: order.orderId,
              amount: subtotal,
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="utility"
        title="Checkout"
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onBack={() => navigation.goBack()}
        onWishlist={() => navGoToWishlist(navigation)}
        onCart={() => navGoToCart(navigation)}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.section}>Shipping Details</Text>
          <Field label="Full Name *" value={form.name} onChange={set('name')} />
          <Field label="Phone *" value={form.phone} onChange={set('phone')} keyboardType="phone-pad" />
          <Field label="Email *" value={form.email} onChange={set('email')} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Address *" value={form.address} onChange={set('address')} multiline />
          <Field label="Landmark" value={form.landmark} onChange={set('landmark')} />
          <Field label="Town/City *" value={form.town} onChange={set('town')} />
          <Field label="State *" value={form.state} onChange={set('state')} />
          <Field label="Pincode *" value={form.pincode} onChange={set('pincode')} keyboardType="number-pad" />
          <Field label="GSTIN (optional)" value={form.gstin} onChange={set('gstin')} autoCapitalize="characters" />

          <Text style={styles.section}>Order Summary</Text>
          <View style={styles.summary}>
            {items.map((it: any, i: number) => (
              <View key={i} style={styles.summaryItem}>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {(typeof it.product === 'object' ? it.product?.name : '') || 'Product'} × {it.quantity}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  {formatPrice((Number(it.price) || 0) * (Number(it.quantity) || 0))}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
            </View>
            <Text style={styles.note}>
              Shipping is calculated based on pincode and may be added by the seller. You will receive an updated invoice.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.btn, submitting && styles.btnDisabled]}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Place Order</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboardType,
  multiline,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: any;
  multiline?: boolean;
  autoCapitalize?: any;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { minHeight: 60, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="#999"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 14 },
  section: { fontSize: 14, fontWeight: '700', color: '#182C5A', marginBottom: 10, marginTop: 6 },
  label: { fontSize: 12, color: '#555', fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 14,
    color: '#111',
    backgroundColor: '#FAFAFA',
  },
  summary: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
    marginTop: 6,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryItemName: { flex: 1, fontSize: 13, color: '#333' },
  summaryItemPrice: { fontSize: 13, color: '#111', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#111' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#182C5A' },
  note: { fontSize: 11, color: '#777', marginTop: 8 },
  bottomBar: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  btn: { backgroundColor: '#182C5A', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#9AA0B5' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
