import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonBox } from '../components/Skeleton';
import {
  formatPrice,
  getDiscountPercent,
  getProductImage,
  getProductMRP,
  getProductName,
  getProductPrice,
} from '../utils/product';
import { apiGet } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { showToast } from '../utils/toast';
import AppHeader from '../components/AppHeader';
import { goToCart as navGoToCart, goToWishlist as navGoToWishlist } from '../utils/navigation';

interface PriceTier {
  number: number;
  SP: number;
  MRP: number;
  pack_weight?: number;
  stock_quantity?: number;
}

export default function ProductDetailScreen({ route, navigation }: any) {
  const initial = route.params?.product || {};
  const slug = route.params?.slug || initial?.slug;
  const id = route.params?.id || initial?._id;

  const [product, setProduct] = useState<any>(initial);
  const [loading, setLoading] = useState(!initial?._id && (Boolean(slug) || Boolean(id)));
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [busy, setBusy] = useState(false);

  const { addItem, count: cartCount } = useCart();
  const { has, add, remove, count: wishlistCount } = useWishlist();

  useEffect(() => {
    (async () => {
      if (product?._id && product?.priceList) return;
      if (slug) {
        setLoading(true);
        const res = await apiGet<any>(`product/get/${slug}`);
        if (res.ok && res.data?._id) setProduct(res.data);
        setLoading(false);
      } else if (id) {
        setLoading(true);
        const res = await apiGet<any>(`product/get/id/${id}`);
        if (res.ok && res.data?._id) setProduct(res.data);
        setLoading(false);
      }
    })();
  }, [slug, id]);

  const priceList: PriceTier[] = Array.isArray(product?.priceList) ? product.priceList : [];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = priceList[selectedIdx] || priceList[0];
  const [qty, setQty] = useState(1);

  // Reset selection when the product data settles
  useEffect(() => {
    setSelectedIdx(0);
    setQty(1);
  }, [product?._id]);

  const imageUri = getProductImage(product);
  const name = getProductName(product);
  const price = selected?.SP ?? getProductPrice(product);
  const mrp = selected?.MRP ?? getProductMRP(product);
  const stock = Number(selected?.stock_quantity ?? 0);
  const discount = getDiscountPercent(mrp, price);
  const wished = product?._id ? has(String(product._id)) : false;

  const canDecrement = qty > 1;
  const canIncrement = stock > 0 ? qty < stock : true;

  const handleAdd = async () => {
    if (!product?._id) return;
    if (!priceList.length) {
      showToast('No pack sizes available for this product.', 'error');
      return;
    }
    if (stock <= 0) {
      showToast('Out of stock.', 'error');
      return;
    }
    setBusy(true);
    const res = await addItem({
      product,
      quantity: qty,
      price: Number(price),
      packSize: Number(selected.number),
      packWeight: Number(selected.pack_weight) || 0,
      stock,
    });
    setBusy(false);
    showToast(res.message, res.ok ? 'success' : 'error');
  };

  const toggleWish = async () => {
    if (!product?._id) return;
    if (wished) {
      const r = await remove(String(product._id));
      showToast(r.message, r.ok ? 'info' : 'error');
    } else {
      const r = await add(product);
      showToast(r.message, r.ok ? 'success' : 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="utility"
        title="Product Details"
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onBack={() => navigation.goBack()}
        onWishlist={() => navGoToWishlist(navigation)}
        onCart={() => navGoToCart(navigation)}
      />

      {loading && !product?._id ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#182C5A" />
        </View>
      ) : !product?._id ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Product not found.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            {imageUri && !imgError ? (
              <Image
                source={{ uri: imageUri }}
                style={[styles.image, imgLoading && styles.hidden]}
                resizeMode="contain"
                onLoad={() => setImgLoading(false)}
                onError={() => { setImgLoading(false); setImgError(true); }}
              />
            ) : null}
            {(imgLoading || imgError) && (
              <SkeletonBox width="100%" height={300} borderRadius={0} style={styles.imgSkeleton} />
            )}
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            )}
          </View>

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { flex: 1 }]}>{name}</Text>
              <TouchableOpacity onPress={toggleWish} style={styles.wishBtn} activeOpacity={0.7}>
                <Ionicons
                  name={wished ? 'heart' : 'heart-outline'}
                  size={24}
                  color={wished ? '#E92227' : '#182C5A'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(price)}</Text>
              {mrp > price && <Text style={styles.mrp}>{formatPrice(mrp)}</Text>}
              {stock > 0 ? (
                <Text style={styles.stockOk}>In Stock</Text>
              ) : (
                <Text style={styles.stockOut}>Out of Stock</Text>
              )}
            </View>

            {priceList.length > 0 && (
              <View style={styles.packSection}>
                <Text style={styles.packLabel}>Pack Size</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {priceList.map((pl, idx) => {
                    const active = idx === selectedIdx;
                    return (
                      <TouchableOpacity
                        key={`${pl.number}-${idx}`}
                        style={[styles.packChip, active && styles.packChipActive]}
                        onPress={() => { setSelectedIdx(idx); setQty(1); }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.packChipText, active && styles.packChipTextActive]}>
                          Pack of {pl.number}
                        </Text>
                        <Text style={[styles.packChipPrice, active && styles.packChipPriceActive]}>
                          {formatPrice(pl.SP)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={styles.qtySection}>
              <Text style={styles.packLabel}>Quantity</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[styles.qtyBtn, !canDecrement && styles.qtyBtnDisabled]}
                  onPress={() => canDecrement && setQty((q) => q - 1)}
                  disabled={!canDecrement}
                >
                  <Ionicons name="remove" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.qtyVal}>{qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, !canIncrement && styles.qtyBtnDisabled]}
                  onPress={() => canIncrement && setQty((q) => q + 1)}
                  disabled={!canIncrement}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
                {stock > 0 && (
                  <Text style={styles.stockHint}>{stock} available</Text>
                )}
              </View>
            </View>

            {product?.description ? (
              <View style={styles.descSection}>
                <Text style={styles.descLabel}>Description</Text>
                <Text style={styles.desc}>{product.description}</Text>
              </View>
            ) : null}

            {Array.isArray(product?.overview_fields) && product.overview_fields.length > 0 && (
              <View style={styles.specsSection}>
                <Text style={styles.descLabel}>Specifications</Text>
                {product.overview_fields.map((f: any, i: number) => (
                  <View key={i} style={styles.specRow}>
                    <Text style={styles.specKey}>{f.label || f.key}</Text>
                    <Text style={styles.specVal}>{f.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {(product?.material || product?.size_inch || product?.size_mm || product?.thickness) && (
              <View style={styles.specsSection}>
                <Text style={styles.descLabel}>Quick Info</Text>
                {product.material && (
                  <Spec label="Material" value={product.material} />
                )}
                {product.size_inch && <Spec label="Size (inch)" value={product.size_inch} />}
                {product.size_mm && <Spec label="Size (mm)" value={product.size_mm} />}
                {product.thickness && <Spec label="Thickness" value={product.thickness} />}
              </View>
            )}

            <View style={styles.bottomPad} />
          </View>
        </ScrollView>
      )}

      {product?._id && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.btn, (busy || stock <= 0) && styles.btnDisabled]}
            activeOpacity={0.85}
            onPress={handleAdd}
            disabled={busy || stock <= 0}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function Spec({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specKey}>{label}</Text>
      <Text style={styles.specVal}>{String(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start' },
  wishBtn: { padding: 4, marginLeft: 8 },
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 15, color: '#666' },
  retryBtn: { marginTop: 12, padding: 10, backgroundColor: '#182C5A', borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  imageContainer: { width: '100%', height: 300, backgroundColor: '#F9F9F9', position: 'relative' },
  image: { width: '100%', height: 300 },
  hidden: { opacity: 0, position: 'absolute' },
  imgSkeleton: { position: 'absolute' },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#E92227',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  discountText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  info: { padding: 16 },
  name: { fontSize: 18, fontWeight: '700', color: '#111', lineHeight: 24 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#182C5A' },
  mrp: { fontSize: 16, color: '#999', textDecorationLine: 'line-through' },
  stockOk: { fontSize: 12, color: '#2E7D32', fontWeight: '600', marginLeft: 'auto' },
  stockOut: { fontSize: 12, color: '#C62828', fontWeight: '600', marginLeft: 'auto' },
  packSection: { marginTop: 16 },
  packLabel: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 8 },
  packChip: {
    borderWidth: 1,
    borderColor: '#CCD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#FAFAFB',
  },
  packChipActive: { borderColor: '#182C5A', backgroundColor: '#182C5A' },
  packChipText: { fontSize: 11, color: '#182C5A', fontWeight: '700' },
  packChipTextActive: { color: '#fff' },
  packChipPrice: { fontSize: 12, color: '#333', marginTop: 2 },
  packChipPriceActive: { color: '#fff' },
  qtySection: { marginTop: 16 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#182C5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: { backgroundColor: '#BFC4D6' },
  qtyVal: { minWidth: 28, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#111' },
  stockHint: { marginLeft: 'auto', fontSize: 12, color: '#666' },
  descSection: { marginTop: 16 },
  descLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 6 },
  desc: { fontSize: 13, color: '#555', lineHeight: 20 },
  specsSection: { marginTop: 16 },
  specRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  specKey: { flex: 1, fontSize: 13, color: '#777', fontWeight: '500' },
  specVal: { flex: 1.5, fontSize: 13, color: '#333', textAlign: 'right' },
  bottomPad: { height: 80 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  btn: {
    backgroundColor: '#182C5A',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#9AA0B5' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 },
});
