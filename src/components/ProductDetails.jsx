import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Colors from '../utils/Colors';
import { useNavigation } from '@react-navigation/core';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import InternalHeader from './Header/InternalHeader';
import Feather from 'react-native-vector-icons/Feather';
import ApiService from '../service/APIService';
import LoginPopup from './General/loginPopup';
import { WebView } from 'react-native-webview';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  textScale,
} from '../utils/responsiveSize';
import FontFamily from '../utils/FontFamily';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import BottomModalForPackSize from './General/BottomModalForPackSize';
import FastImage from 'react-native-fast-image';
import HomePopularProduct from './Home/HomePopularProduct';
import { ImagePath } from '../utils/ImagePath';
import WrapperContainer from '../utils/WrapperContainer';
import StorageService from '../utils/storageService';
import {
  parseStoredUser,
  showErrorMessage,
  showSuccessMessage,
} from '../utils/HelperFunction';
import CartService from '../service/CartService';
import ProductImage from './product/ProductImage';
import {
  getPriceTiers,
  getPrimaryPriceTier,
  getProductImageUri,
  getProductImages,
  isInStock,
} from '../utils/productCatalog';
import { getOverviewFields, getProductKind } from '../utils/overviewFields';
import { findLabelVariants, parseLabelModel } from '../utils/labelVariants';

// ─── Category constants (mirrors web Info.tsx) ───
const PACKPRO_TAPE_CATEGORY_ID = "6557df64301ec4f2f4266141";
const CARRY_BAG_CATEGORY_IDS = new Set([
  "6557df71301ec4f2f4266145",
  "689d73214687bb4e437542e0",
]);
const FOOD_WRAPPING_CATEGORY_IDS = new Set([
  "69dcb22e733b8ba056529a9f",
  "679ca70f2833ca433fa0aa9c",
]);
const LABEL_CATEGORY_ID = "6557deb6301ec4f2f4266135";
const POLY_BAG_CATEGORY_ID = "6557df4f301ec4f2f426613d";
const PAPER_BAG_CATEGORY_ID = "6557df46301ec4f2f4266139";
const CORRUGATED_BOX_CATEGORY_ID = "6557deab301ec4f2f4266131";

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const FIELD_VISIBILITY_KEYS = {
  sectionQuickOverview: "section:quick_overview",
  sectionSpecifications: "section:specifications",
  sectionProductDetails: "section:product_details",
  aboutItem: "field:about_item",
  noteGst: "note:gst",
  noteDelivery: "note:delivery",
  badgeFreeDelivery: "badge:free_delivery",
  badgeSecureTransaction: "badge:secure_transaction",
  badgeNoReturns: "badge:no_returns",
  badgeRecyclable: "badge:recyclable",
  priceMrp: "price:mrp",
  priceSavings: "price:savings",
  pricePackWeight: "price:pack_weight",
};

const isFieldVisible = (product, key) => {
  const asVisibilityMap = (value) =>
    value && typeof value === 'object' && !Array.isArray(value) ? value : {};

  const productMap = asVisibilityMap(product?.field_visibility);
  if (productMap[key] !== undefined) return productMap[key] !== false;

  const category = product?.category;
  const categoryMap = asVisibilityMap(
    category && typeof category === 'object'
      ? category.field_visibility
      : undefined,
  );
  if (categoryMap[key] !== undefined) return categoryMap[key] !== false;

  return true;
};

const getMobileSpecifications = (product) => {
  const source = product || {};
  const normalized = source.specification && typeof source.specification === 'object' ? source.specification : {};
  const attributes = normalized.attributes && typeof normalized.attributes === 'object' ? normalized.attributes : {};
  const specification = { ...attributes, ...normalized };

  delete specification._id;
  delete specification.product;
  delete specification.createdAt;
  delete specification.updatedAt;
  delete specification.attributes;

  const SPEC_FIELD_KEYS = [
    'length', 'width', 'height', 'length_inch', 'length_mm', 'breadth_inch',
    'breadth_mm', 'height_inch', 'height_mm', 'size_inch', 'size_mm', 'flap_mm',
    'thickness', 'thickness_micron', 'gusset', 'print', 'label_in_roll',
    'core_size', 'pouch_weight', 'adhesive', 'material', 'color', 'colour',
    'weight', 'size'
  ];

  SPEC_FIELD_KEYS.forEach((key) => {
    if (!hasValue(specification[key]) && hasValue(source[key])) {
      specification[key] = source[key];
    }
  });

  const HIDDEN_KEYS = new Set(['_id', 'product', 'createdAt', 'updatedAt', '__v']);

  const specSchema = product?.category?.spec_schema || [];
  const schemaByKey = new Map(specSchema.map((field) => [field.key, field]));
  const schemaOrder = new Map(specSchema.map((field, index) => [field.key, index]));

  const labelFromKey = (key) =>
    key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const labelFor = (key) => {
    const def = schemaByKey.get(key);
    if (!def) return labelFromKey(key);
    const label = def.label || labelFromKey(key);
    return def.unit ? `${label} (${def.unit})` : label;
  };

  const orderFor = (key, encounterIndex) =>
    schemaOrder.has(key) ? schemaOrder.get(key) : specSchema.length + encounterIndex;

  const formatValue = (value) => {
    if (typeof value === 'boolean') return value ? "Yes" : "No";
    return String(value);
  };

  return Object.entries(specification)
    .filter(([key, value]) => !HIDDEN_KEYS.has(key) && hasValue(value))
    .filter(([key]) => isFieldVisible(product, `spec:${key}`))
    .map(([key, value], encounterIndex) => ({
      key,
      label: labelFor(key),
      value: formatValue(value),
      order: orderFor(key, encounterIndex),
    }))
    .sort((a, b) => a.order - b.order);
};

const renderMultilineTextMobile = (text) => {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return (
      <View style={{ gap: moderateVerticalScale(4), marginTop: moderateVerticalScale(2) }}>
        {lines.map((line, idx) => {
          const cleanedLine = line.replace(/^[-*•]\s*/, "");
          return (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={[styles.detailText, { marginRight: moderateScale(6) }]}>•</Text>
              <Text style={[styles.detailText, { flex: 1 }]}>{cleanedLine}</Text>
            </View>
          );
        })}
      </View>
    );
  }
  return <Text style={styles.detailText}>{text}</Text>;
};

const ProductDetails = ({ route }) => {
  const [webViewHeight, setWebViewHeight] = useState(100);
  // `item` starts from the (possibly partial) list object handed over in nav
  // params, then is replaced with a freshly-fetched, fully-populated product so
  // the detail screen never renders stale/incomplete data — mirroring the web
  // app's SSR-by-slug fetch.
  const [item, setItem] = useState(route.params?.item);
  const autoAddExecutedRef = React.useRef(false);
  const [buyItWithProduct, setBuyItWithProduct] = useState([]);
  const [count, setCount] = useState(1);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [webViewLoader, setWebViewLoader] = useState(true);
  const [showTermsAndConditionModal, setShowTermsAndCondition] =
    useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isRelatedProductsLoading, setIsRelatedProductsLoading] =
    useState(false);
  const [wishlist, setWishlist] = useState([]);
  const navigation = useNavigation();
  const [packSizeModal, setShowPackSizeModal] = useState(false);
  const [packSizeData, setPackSizeData] = useState([]);
  const [mrp, setMrp] = useState('');
  const [sp, setSp] = useState('');
  const [number, setNumber] = useState('');
  const [packWeight, setPackWeight] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [bigImage, setBigImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [localWishlistUpdates, setLocalWishlistUpdates] = useState({});
  const [wishListValueChanged, setWishListValueChanged] = useState(0);
  const [crossCategoryProducts, setCrossCategoryProducts] = useState([]);
  const [isCrossLoading, setIsCrossLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [labelVariants, setLabelVariants] = useState([]);
  const [selectedLabelVariant, setSelectedLabelVariant] = useState(null);

  const CROSS_CATEGORY_MAP = {
    '6557df46301ec4f2f4266139': [
      '6557df4f301ec4f2f426613d',
      '6557df64301ec4f2f4266141',
    ], // Paper Bag → Poly Bag, BOPP Tape
    '6557df4f301ec4f2f426613d': [
      '6557df46301ec4f2f4266139',
      '6557df64301ec4f2f4266141',
    ], // Poly Bag → Paper Bag, BOPP Tape
  };

  // Fetch a fresh, fully-populated copy of the product (by slug, falling back to
  // id) so the screen renders complete data even when opened from a card that
  // only carried a card-signed, partial list object.
  const fetchFreshProduct = async () => {
    const base = route.params?.item;
    if (!base) return;
    try {
      let response;
      if (base?.slug) {
        response = await ApiService.GET_PRODUCT_BY_SLUG(base.slug);
      } else if (base?._id) {
        response = await ApiService.GET_SINGLE_PRODUCT(base._id);
      }
      if (response?.data) {
        setItem(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.log('Error refreshing product detail:', error?.message);
    }
  };

  const fetchCrossCategoryProducts = async () => {
    setIsCrossLoading(true);
    try {
      const currentCategoryId = item?.category?._id;
      const targetCategoryIds = CROSS_CATEGORY_MAP[currentCategoryId] || [
        '6557df46301ec4f2f4266139',
        '6557df4f301ec4f2f426613d',
      ];
      const cross = [];
      for (const catId of targetCategoryIds) {
        // One small server-side page per target category instead of pulling the
        // whole catalog and filtering on the client.
        const response = await ApiService.FILTER_PRODUCTS({
          category: catId,
          limit: 4,
        });
        const found = (response?.data || []).find(p => p?._id !== item?._id);
        if (found) cross.push(found);
      }
      setCrossCategoryProducts(cross);
    } catch (error) {
      console.log('Error fetching cross category products:', error);
    }
    setIsCrossLoading(false);
  };

  const loadWishlist = async () => {
    try {
      const storedWishlist = await StorageService.getItem('wishlist');
      if (storedWishlist) {
        setWishlist(parseStoredUser(storedWishlist));
      }
    } catch (error) {
      console.log('Error loading wishlist', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const user = await StorageService.getItem('user_data');

      if (user) {
        const userData = parseStoredUser(user);
        const response = await ApiService.GET_WISHLIST_PRODUCTS(userData?._id);
        if (response?.success) {
          setWishlist(response?.data?.products || []);
          setLocalWishlistUpdates({});
        }
      }
    } catch (error) {
      console.log('Error fetching wishlist', error);
    }
  };

  const fetchLabelVariants = async () => {
    if (!item || !parseLabelModel(item?.model) || getProductKind(item) !== 'label') {
      setLabelVariants([]);
      setSelectedLabelVariant(null);
      return;
    }
    const subCategoryId =
      typeof item?.sub_category === 'object'
        ? item?.sub_category?._id
        : item?.sub_category;
    if (!subCategoryId) return;
    try {
      const response = await ApiService.FILTER_PRODUCTS({
        subcategory: String(subCategoryId),
        limit: 200,
      });
      const variants = findLabelVariants(item, response?.data ?? []);
      setLabelVariants(variants);
      if (selectedLabelVariant === null || !variants.find(v => v.slug === selectedLabelVariant?.slug)) {
        setSelectedLabelVariant(variants.length > 0 ? variants[0] : null);
      }
    } catch (error) {
      console.log('Error fetching label variants:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
      fetchFreshProduct();
      fetchSingleProduct();
      fetchCrossCategoryProducts();
      fetchLabelVariants();

      if (route?.params?.autoAddToCart && !autoAddExecutedRef.current) {
        autoAddExecutedRef.current = true;
        navigation.setParams({ autoAddToCart: false });
        const pendingCount = route?.params?.pendingCount || 1;
        handleAddToCart(item, pendingCount);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const isItemInWishlist = productId => {
    // First check local updates
    if (localWishlistUpdates[productId] !== undefined) {
      return localWishlistUpdates[productId];
    }
    // Then check the actual wishlist
    return wishlist.some(item => item.product?._id === productId);
  };

  const fetchSingleProduct = async () => {
    // console.log(buyItWithProductId, "Line 96");
    setIsLoading(true);
    const buyItProducts = [];
    if (item?.buyItWith?.length > 0) {
      for (const buyItProduct of item?.buyItWith) {
        console.log(buyItProduct?._id, 'Line 121');
        try {
          const response = await ApiService.GET_SINGLE_PRODUCT(buyItProduct);
          buyItProducts.push(response?.data);
        } catch (error) {
          console.log(error, 'Line 106');
        }
      }
      setBuyItWithProduct(buyItProducts);
    }
    setIsLoading(false);
  };

  const handleSaveToWishList = async product => {
    console.log(product, 'line 187');
    const user = await StorageService.getItem('user_data');
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    try {
      const userData = parseStoredUser(user);
      const currentStatus = isItemInWishlist(product._id);

      // Immediately update local state for instant UI feedback
      setLocalWishlistUpdates(prev => ({
        ...prev,
        [product._id]: !currentStatus,
      }));

      if (currentStatus) {
        // Remove from wishlist
        const response = await ApiService.REMOVE_FROM_WISHLIST({
          product: product._id,
          user: userData._id,
        });

        if (!response?.success) {
          // Revert if API call fails
          setLocalWishlistUpdates(prev => ({
            ...prev,
            [product._id]: currentStatus,
          }));
          throw new Error('Failed to remove from wishlist');
        }
        showSuccessMessage('Product removed from wishlist');
      } else {
        // Add to wishlist
        const tier = getPrimaryPriceTier(product);
        const wishlistData = {
          product: {
            brand: product?.brand?._id,
            product: product?._id,
            category: product?.category?._id,
            packSize: tier.number,
            price: tier.SP,
            quantity: 1,
            stock: 1000,
            totalWeight: tier.number,
            totalPackWeight: 0,
          },
          user: userData?._id,
        };

        const response = await ApiService.ADD_TO_WISHLIST(wishlistData);
        if (!response?.success) {
          // Revert if API call fails
          setLocalWishlistUpdates(prev => ({
            ...prev,
            [product._id]: currentStatus,
          }));
          throw new Error('Failed to add to wishlist');
        }
        showSuccessMessage('Product added to wishlist');
      }
      DeviceEventEmitter.emit('wishlistUpdated');
      setWishListValueChanged(prev => prev + 1);
      // Refresh wishlist to sync with server
      await fetchWishlist();
    } catch (error) {
      console.log('Error updating wishlist', error);
      showErrorMessage('Error updating wishlist');
    }
  };

  const fetchSpecificProductAndStore = async () => {
    setIsRelatedProductsLoading(true);
    let fetchedProducts = [];

    // Priority 1: curated relatedProducts from the product record
    if (item?.relatedProducts?.length > 0) {
      for (const relatedProduct of item.relatedProducts) {
        try {
          const response = await ApiService.GET_RELATED_PRODUCT_DETAILS_BY_ID(
            relatedProduct,
          );
          if (response?.data) fetchedProducts.push(response.data);
        } catch (error) {
          console.log('Error fetching related product:', error);
        }
      }
    }

    // Priority 2 (fallback): same category, exclude current product — via a
    // small server-side page instead of pulling the whole catalog.
    if (fetchedProducts.length === 0 && item?.category?._id) {
      try {
        const response = await ApiService.FILTER_PRODUCTS({
          category: item.category._id,
          limit: 6,
        });
        const sameCat = (response?.data || []).filter(
          p => p?._id !== item?._id,
        );
        fetchedProducts = sameCat.slice(0, 5);
      } catch (error) {
        console.log('Error fetching fallback related products:', error);
      }
    }

    setRelatedProducts(fetchedProducts.slice(0, 5));
    setIsRelatedProductsLoading(false);
  };

  useEffect(() => {
    fetchSpecificProductAndStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalized pricing/media derived once, so render reads never touch raw
  // `priceList`/`images` arrays that may be empty or absent.
  const priceTiers = getPriceTiers(item);
  const primaryTier = getPrimaryPriceTier(item);
  const productImages = getProductImages(item);
  const inStock = isInStock(item);
  const selectedPackSize = number ? number : primaryTier.number;
  const selectedPrice = sp ? sp : primaryTier.SP;

  const overviewFieldsData = getOverviewFields(
    item,
    selectedPackSize,
    packWeight ? packWeight : primaryTier.pack_weight,
  );

  const getCartLineProductId = line => {
    const lineProduct = line?.product;
    if (typeof lineProduct === 'string') return lineProduct;
    return lineProduct?._id || line?.productId || line?.product_id || '';
  };

  const isMatchingCartLine = line => {
    if (getCartLineProductId(line) !== item?._id) return false;
    if (selectedPackSize === undefined || selectedPackSize === null) return true;
    return String(line?.packSize) === String(selectedPackSize);
  };

  const checkCartLineStatus = useCallback(async () => {
    if (!item?._id) {
      setIsAddedToCart(false);
      return;
    }
    try {
      const cart = await CartService.getCart();
      setIsAddedToCart((cart || []).some(isMatchingCartLine));
    } catch (error) {
      console.log('Error checking cart status:', error?.message);
      setIsAddedToCart(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?._id, selectedPackSize]);

  useEffect(() => {
    checkCartLineStatus();
  }, [checkCartLineStatus]);

  const handlePackSize = () => {
    setShowPackSizeModal(true);
    setPackSizeData(priceTiers);
  };

  const handleNotify = async product => {
    const user = await StorageService.getItem('user_data');
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    const userData = parseStoredUser(user);
    try {
      setIsLoading(true);
      const payload = {
        product_id: product?._id,
        name: userData?.first_name + userData?.last_name,
        email_address: userData?.email_address,
        mobile_number: userData?.mobile_number,
      };
      const response = await ApiService.NOTIFY_PRODUCT(payload);
      if (response?.success) {
        showSuccessMessage(response.message);
      } else {
        showErrorMessage(response.message);
      }
    } catch (error) {
      showErrorMessage('Unable to create the notification');
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddToCart = async (product, overrideCount = null) => {
    // CartService decides guest (local storage) vs. logged-in (server API)
    // automatically, so a logged-out shopper can build a cart without being
    // forced to sign in first. packSize/price honour the on-screen selection
    // (`number` / `sp`), falling back to the product's first price tier.
    const effectiveCount = overrideCount !== null ? overrideCount : count;
    const productTier = getPrimaryPriceTier(product);
    try {
      setIsAddingToCart(true);
      const result = await CartService.addToCart(product, {
        packSize: selectedPackSize || productTier.number,
        price: selectedPrice || productTier.SP,
        quantity: effectiveCount,
        brand: product?.brand?._id,
        category: product?.category?._id,
      });

      if (result?.success) {
        showMessage({
          message: 'Product Added to cart successfully',
          type: 'success',
          icon: 'success',
        });
        DeviceEventEmitter.emit('cartUpdated');
        setIsAddedToCart(true);
      } else {
        showErrorMessage('Unable to add product to cart. Please try again.');
      }
    } catch (e) {
      console.log('Error adding to cart:', e?.message);
      showErrorMessage('Unable to add product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCartAction = () => {
    if (!inStock) {
      handleNotify(item);
      return;
    }

    if (isAddedToCart) {
      navigation.navigate('Cart');
      return;
    }

    handleAddToCart(item);
  };

  const handleDecreaseItemQuantity = async () => {
    console.log('Clicked on the Decrease Button');
    count > 1 ? setCount(count - 1) : null;
  };

  const handleIncreaseItemQuantity = async () => {
    console.log('Clicked on the Increase Button');
    setCount(count + 1);
  };

  const onWebViewMessage = event => {
    // Get the height from the message from WebView
    setWebViewHeight(Number(event.nativeEvent.data));
  };

  const webViewScript = `
    setTimeout(function() {
      window.ReactNativeWebView.postMessage(
        document.documentElement.scrollHeight
      );
    }, 500);
  `;

  const data = [
    { id: 1, name: 'Free Delivery', image: ImagePath.delivery },
    { id: 2, name: 'Secured Transaction', image: ImagePath.secure },
    { id: 3, name: 'No Return', image: ImagePath.noReturn },
    { id: 4, name: '100% Recyclable', image: ImagePath.recycle },
  ];

  return (
    <WrapperContainer isLoading={isLoading}>
      <View style={styles.main}>
        <InternalHeader
          title={'Product Details'}
          heart={'productDetails'}
          wishlistValueChanged={wishListValueChanged}
        />
        <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
          <View style={styles.firstSection}>
            <View style={styles.innerView}>
              <View style={{ marginVertical: moderateVerticalScale(10) }}>
                <Text style={[styles.name, { textTransform: 'capitalize' }]}>
                  {item?.brand?.name ? `${item.brand.name} ` : ''}{item?.name} {item?.model || ''}
                </Text>
              </View>
              {imageLoading && (
                <ActivityIndicator
                  size="large"
                  color={Colors.brandColor}
                  style={styles.activityIndicator}
                />
              )}
              <ProductImage
                product={item}
                uri={bigImage || getProductImageUri(item)}
                style={styles.imageStyle}
                resizeMode={FastImage.resizeMode.contain}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
              <TouchableOpacity
                style={styles.iconHolder2}
                onPress={() =>
                  Share.share({
                    message: `Check this product https://www.store.prempackaging.com/${item?.slug} `,
                  })
                }
              >
                <Feather
                  name="share-2"
                  size={moderateScale(25)}
                  color={Colors.iconColor}
                />
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: moderateScale(15),
                  }}
                  style={styles.otherPics}
                >
                  {productImages.map((img, i) => {
                    return (
                      <TouchableOpacity
                        key={i}
                        style={styles.imageContainer}
                        onPress={() => setBigImage(img?.image)}
                      >
                        <ProductImage
                          uri={img?.image}
                          style={styles.catImg}
                          resizeMode={FastImage.resizeMode.contain}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

            </View>
          </View>
          {/* Second Sections */}
          <View style={styles.firstSection}>
            <View style={styles.innerView2}>
              <Text style={[styles.name, { fontSize: textScale(16) }]}>
                Price
              </Text>
              <Text
                style={[
                  styles.name,
                  {
                    color: inStock ? Colors.green : Colors.red,
                  },
                ]}
              >
                {inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
            <View style={styles.priceHolder}>
              {/* MRP with inflation (matches web ProductPricing.tsx:54) */}
              {(mrp ? Number(mrp) : Number(primaryTier.MRP || 0)) > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: moderateScale(5),
                    marginBottom: moderateVerticalScale(5),
                  }}
                >
                  <Text
                    style={{
                      color: Colors.brandColor,
                      fontSize: textScale(14),
                      fontFamily: FontFamily.Montserrat_Regular,
                    }}
                  >
                    MRP
                  </Text>
                  <Text style={styles.mrpText}>
                    Rs.{mrp ? Math.round(Number(mrp) * 1.124) : primaryTier.MRP ? Math.round(Number(primaryTier.MRP) * 1.124) : 0}
                  </Text>
                </View>
              )}
              {/* New MRP row (matches web) */}
              {(mrp ? Number(mrp) : Number(primaryTier.MRP || 0)) > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: moderateScale(5),
                    marginBottom: moderateVerticalScale(5),
                  }}
                >
                  <Text
                    style={{
                      color: Colors.brandColor,
                      fontSize: textScale(14),
                      fontFamily: FontFamily.Montserrat_Regular,
                    }}
                  >
                    New MRP
                  </Text>
                  <Text style={styles.mrpText}>
                    Rs.{mrp ? mrp : primaryTier.MRP}
                  </Text>
                </View>
              )}
              <Text style={styles.price}>
                Rs.{sp ? sp : primaryTier.SP}
              </Text>
              {Number.isFinite(Number(sp ? sp : primaryTier.SP)) && Number.isFinite(Number(mrp ? mrp : primaryTier.MRP)) && Number(mrp ? mrp : primaryTier.MRP) > Number(sp ? sp : primaryTier.SP) && (
                <Text style={{ color: '#16a34a', fontSize: textScale(14), fontFamily: FontFamily.Montserrat_SemiBold, marginTop: moderateVerticalScale(2) }}>
                  {Math.round(((Number(mrp ? mrp : primaryTier.MRP) - Number(sp ? sp : primaryTier.SP)) / Number(mrp ? mrp : primaryTier.MRP)) * 100)}% off
                </Text>
              )}
              <View
                style={{
                  marginVertical: moderateVerticalScale(5),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={styles.text2}>Select Pack Size</Text>
                <TouchableOpacity
                  style={{
                    width: '45%',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderRadius: moderateScale(5),
                    backgroundColor: Colors.border_grey,
                    borderColor: Colors.border_grey,
                    padding: moderateScale(5),
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    gap: moderateScale(5),
                  }}
                  onPress={handlePackSize}
                >
                  <Text style={styles.text2}>
                    {number ? number : primaryTier.number}
                  </Text>
                  <AntDesign
                    name="down"
                    color={Colors.brandColor}
                    size={textScale(14)}
                  />
                </TouchableOpacity>
              </View>
              {/* Label variants dropdown (Labels per Roll) — matches web ProductPricing */}
              {labelVariants.length > 1 && (
                <View
                  style={{
                    marginVertical: moderateVerticalScale(5),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={styles.text2}>Labels per Roll</Text>
                  <TouchableOpacity
                    style={{
                      width: '45%',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderRadius: moderateScale(5),
                      backgroundColor: Colors.border_grey,
                      borderColor: Colors.border_grey,
                      padding: moderateScale(5),
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      gap: moderateScale(5),
                    }}
                    onPress={() => {
                      // Cycle through variants
                      const currentIndex = labelVariants.findIndex(v => v.slug === selectedLabelVariant?.slug);
                      const nextIndex = (currentIndex + 1) % labelVariants.length;
                      const next = labelVariants[nextIndex];
                      setSelectedLabelVariant(next);
                      if (next?.slug && next.slug !== item?.slug) {
                        navigation.replace('ProductDetails', { item: next.product || item });
                      }
                    }}
                  >
                    <Text style={styles.text2}>
                      {selectedLabelVariant?.labelQty || labelVariants[0]?.labelQty || ''}
                    </Text>
                    <AntDesign
                      name="down"
                      color={Colors.brandColor}
                      size={textScale(14)}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.divider} />
            {/* Increase and Decrease the count */}
            <View style={styles.quantityHolder}>
              <TouchableOpacity
                style={styles.iconHolder}
                onPress={handleDecreaseItemQuantity}
              >
                <MaterialCommunityIcons
                  name="minus"
                  size={textScale(25)}
                  color={Colors.black}
                />
              </TouchableOpacity>
              <Text style={styles.countText}>{count}</Text>
              <TouchableOpacity
                onPress={handleIncreaseItemQuantity}
                style={[
                  styles.iconHolder,
                  { backgroundColor: Colors.forgetPassword },
                ]}
              >
                <MaterialIcons
                  name="add"
                  size={textScale(25)}
                  color={Colors.white}
                />
              </TouchableOpacity>
            </View>
            {/* Button and heart Icon */}
            <View style={styles.buttonHolder2}>
              <TouchableOpacity
                disabled={isAddingToCart}
                onPress={handleCartAction}
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      inStock && isAddedToCart
                        ? Colors.success || '#138A43'
                        : Colors.brandColor,
                  },
                  isAddingToCart && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.addText}>
                  {!inStock
                    ? 'Notify Me'
                    : isAddingToCart
                      ? 'ADDING...'
                      : isAddedToCart
                        ? 'GO TO CART'
                        : 'ADD TO CART'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heartHolder}
                onPress={() => handleSaveToWishList(item)}
              >
                <AntDesign
                  name={isItemInWishlist(item._id) ? 'heart' : 'hearto'}
                  size={moderateScale(30)}
                  color={
                    isItemInWishlist(item._id) ? Colors.red : Colors.text_grey
                  }
                />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            {/* GST and Delivery Notes */}
            {(isFieldVisible(item, 'note:gst') || isFieldVisible(item, 'note:delivery')) && (
              <View style={styles.notesContainer}>
                {isFieldVisible(item, 'note:gst') && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>Price is excluding GST</Text>
                  </View>
                )}
                {isFieldVisible(item, 'note:delivery') && (
                  <View style={styles.noteBox}>
                    <MaterialCommunityIcons
                      name="truck"
                      color={Colors.red}
                      size={moderateScale(24)}
                    />
                    <Text style={styles.noteText}>
                      Delivery Within{' '}
                      {item?.delivery_time ? item?.delivery_time : '7 Working Days'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 4 Icons — matches web: always-visible static badges */}
            <View
              style={{
                marginVertical: moderateVerticalScale(10),
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingHorizontal: moderateScale(10),
              }}
            >
              <View style={{ alignItems: 'center', width: '23%', gap: moderateVerticalScale(5) }}>
                <Image source={ImagePath.delivery} resizeMode="contain" style={{ width: moderateScale(24), height: moderateScale(24) }} />
                <Text style={{ fontFamily: FontFamily.Montserrat_Medium, color: Colors.black, fontSize: textScale(9), textAlign: 'center' }}>Free Delivery</Text>
              </View>
              <View style={{ alignItems: 'center', width: '23%', gap: moderateVerticalScale(5) }}>
                <Image source={ImagePath.secure} resizeMode="contain" style={{ width: moderateScale(24), height: moderateScale(24) }} />
                <Text style={{ fontFamily: FontFamily.Montserrat_Medium, color: Colors.black, fontSize: textScale(9), textAlign: 'center' }}>Secure Packaging</Text>
              </View>
              <View style={{ alignItems: 'center', width: '23%', gap: moderateVerticalScale(5) }}>
                <Image source={ImagePath.noReturn} resizeMode="contain" style={{ width: moderateScale(24), height: moderateScale(24) }} />
                <Text style={{ fontFamily: FontFamily.Montserrat_Medium, color: Colors.black, fontSize: textScale(9), textAlign: 'center' }}>Bulk Order</Text>
              </View>
              <View style={{ alignItems: 'center', width: '23%', gap: moderateVerticalScale(5) }}>
                <Image source={ImagePath.recycle} resizeMode="contain" style={{ width: moderateScale(24), height: moderateScale(24) }} />
                <Text style={{ fontFamily: FontFamily.Montserrat_Medium, color: Colors.black, fontSize: textScale(9), textAlign: 'center' }}>Eco Friendly</Text>
              </View>
            </View>
            {/* Return Days */}
            {/* <View style={styles.returnHolder}>
            <View style={styles.innerView4}>
              <Feather
                name="refresh-ccw"
                color={Colors.red}
                size={textScale(25)}
              />
              <Text style={styles.text2}>7 Days Return. </Text>
            </View>
            <TouchableOpacity
              style={styles.tcHolder}
              onPress={() => setShowTermsAndCondition(true)}
            >
              <Text style={styles.tcText}>T&C</Text>
            </TouchableOpacity>
          </View> */}
          </View>
          {/* Third Section */}
          {/* Third Section: Quick Overview, About the Item, Specifications, Product Description, Usage & Care Instructions */}
          {(() => {
            const showQuickOverview = isFieldVisible(item, 'section:quick_overview');
            const showSpecifications = isFieldVisible(item, 'section:specifications');
            const showProductDetails = isFieldVisible(item, 'section:product_details');
            const showAboutItem = isFieldVisible(item, 'field:about_item');
            const specificationsData = getMobileSpecifications(item);

            const isPaperBagProduct = getProductKind(item) === 'paperbag';

            const aboutItemText = (() => {
              if (item?.aboutItem && String(item.aboutItem).trim() !== "" && String(item.aboutItem).trim().toLowerCase() !== "text pending") {
                return item.aboutItem;
              }
              if (isPaperBagProduct) {
                return `- Made from high-quality kraft paper for durability.
- Eco-friendly, recyclable, and biodegradable.
- Strong handles for comfortable carrying.
- Available in multiple sizes, colors, and GSM options.
- Suitable for retail, gifting, grocery, and takeaway packaging.
- Can be customized with brand logo and printing.`;
              }
              return "";
            })();
            const hasAboutItem = Boolean(aboutItemText);

            const usageText = (() => {
              if (item?.usage && String(item.usage).trim() !== "" && String(item.usage).trim().toLowerCase() !== "text pending") {
                return item.usage;
              }
              if (isPaperBagProduct) {
                return `- Keep away from direct water contact or excessive moisture.
- Store in a cool, dry place.
- Do not exceed the recommended load capacity.
- Reusable multiple times under normal handling.`;
              }
              return "";
            })();
            const hasUsage = Boolean(usageText);
            const hasDescription = Boolean(item?.description && String(item?.description).trim());

            const showDescriptionDetails = showProductDetails && hasDescription;
            const showUsageDetails = showProductDetails && hasUsage;

            const hasAnyVisibleSection =
              (showQuickOverview && overviewFieldsData.length > 0) ||
              (showAboutItem && hasAboutItem) ||
              (showSpecifications && specificationsData.length > 0) ||
              showDescriptionDetails ||
              showUsageDetails;

            if (!hasAnyVisibleSection) return null;

            return (
              <View style={[styles.firstSection, { padding: moderateScale(15), gap: moderateVerticalScale(20) }]}>
                {/* 1. Quick Overview */}
                {showQuickOverview && overviewFieldsData.length > 0 && (
                  <View>
                    <Text style={styles.sectionHeading}>Quick Overview</Text>
                    <View style={{ marginTop: moderateVerticalScale(5) }}>
                      {overviewFieldsData.map((field, index) => (
                        <View style={styles.tableRow} key={field.label}>
                          <Text style={styles.productText}>{field.label}</Text>
                          <Text style={styles.tableValue}>{field.value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 2. About the Item / Highlights */}
                {showAboutItem && hasAboutItem && (
                  <View>
                    <Text style={styles.sectionHeading}>About the Item / Highlights</Text>
                    <View style={{ marginTop: moderateVerticalScale(5) }}>
                      {renderMultilineTextMobile(aboutItemText)}
                    </View>
                  </View>
                )}

                {/* 3. Specifications */}
                {showSpecifications && specificationsData.length > 0 && (
                  <View>
                    <Text style={styles.sectionHeading}>Specifications</Text>
                    <View style={{ marginTop: moderateVerticalScale(5) }}>
                      {specificationsData.map((field, index) => (
                        <View style={styles.tableRow} key={field.key}>
                          <Text style={styles.productText}>{field.label}</Text>
                          <Text style={styles.tableValue}>{field.value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 4. Product Description */}
                {showDescriptionDetails && (
                  <View>
                    <Text style={styles.sectionHeading}>Product Description</Text>
                    <View style={{ marginTop: moderateVerticalScale(5) }}>
                      <WebView
                        source={{
                          html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${item?.description}</body></html>`,
                        }}
                        injectedJavaScript={webViewScript}
                        onMessage={onWebViewMessage}
                        style={{ height: webViewHeight }}
                        originWhitelist={['*']}
                      />
                    </View>
                  </View>
                )}

                {/* 5. Usage & Care Instructions */}
                {showUsageDetails && (
                  <View>
                    <Text style={styles.sectionHeading}>Usage & Care Instructions</Text>
                    <View style={{ marginTop: moderateVerticalScale(5) }}>
                      {renderMultilineTextMobile(usageText)}
                    </View>
                  </View>
                )}
              </View>
            );
          })()}
          {/* Buy with it Option */}
          {/* <View style={styles.relatedView}>
            <Text
              style={[
                styles.loaderText,
                { textAlign: 'left', fontSize: textScale(17) },
              ]}
            >
              Buy it With
            </Text>
            {buyItWithProduct.length > 0 ? (
              <View>
                {isLoading === true ? (
                  <View>
                    <ActivityIndicator size="large" color={Colors.brandColor} />
                    <Text style={styles.loaderText}>
                      Please wait product is loading...
                    </Text>
                  </View>
                ) : (
                  <HomePopularProduct
                    data={buyItWithProduct}
                    width={250}
                    comingFrom={'buyItWith'}
                    setWishListValueChanged={setWishListValueChanged}
                  />
                )}
              </View>
            ) : (
              <Text style={styles.nanText}>No Buy it product Available</Text>
            )}
          </View> */}
          {/* Frequently Bought Together */}
          <View style={styles.relatedView}>
            <Text
              style={[
                styles.loaderText,
                { textAlign: 'left', fontSize: textScale(17) },
              ]}
            >
              Buy it With
            </Text>
            {isCrossLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={Colors.brandColor} />
                <Text style={styles.loaderText}>Loading please wait...</Text>
              </View>
            ) : crossCategoryProducts.length > 0 ? (
              <HomePopularProduct
                data={[item, ...crossCategoryProducts]}
                comingFrom={'buyItWith'}
                setWishListValueChanged={setWishListValueChanged}
              />
            ) : (
              <Text style={styles.nanText}>No suggestions available</Text>
            )}
          </View>
          <View style={styles.relatedView}>
            <Text
              style={[
                styles.loaderText,
                { textAlign: 'left', fontSize: textScale(17) },
              ]}
            >
              Related Products
            </Text>
            {isRelatedProductsLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={Colors.brandColor} />
                <Text style={styles.loaderText}>Loading please wait...</Text>
              </View>
            ) : relatedProducts.length > 0 ? (
              <View>
                <HomePopularProduct
                  data={relatedProducts}
                  width={250}
                  setWishListValueChanged={setWishListValueChanged}
                />
              </View>
            ) : (
              <Text style={styles.nanText}>No Related Products</Text>
            )}
          </View>
          <BottomModalForPackSize
            visible={packSizeModal}
            data={packSizeData}
            message={'Choose Pack Size'}
            hideModal={() => setShowPackSizeModal(false)}
            selectedValue={text => {
              console.log(text, 'Line 546');
              setMrp(text?.MRP);
              setSp(text?.SP);
              setNumber(text?.number);
              setPackWeight(text?.pack_weight);
              setStockQuantity(text?.stock_quantity);
              setShowPackSizeModal(false);
            }}
          />
        </ScrollView>
        {showLoginPopup && (
          <LoginPopup
            showLoginPopup={showLoginPopup}
            setShowLoginPopup={setShowLoginPopup}
            fromProductDetails={true}
          />
        )}
        <Modal
          transparent={true}
          animationType="slide"
          visible={showTermsAndConditionModal}
          statusBarTranslucent
          onRequestClose={() => setShowTermsAndCondition(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowTermsAndCondition(false)}
              >
                <Feather name="x" size={textScale(25)} color={Colors.black} />
              </TouchableOpacity>
              {/* {webViewLoader && (
              <View style={styles.loaderView}>
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size={"large"} color={Colors.brandColor} />
                  <Text style={styles.loaderText}>Please wait...</Text>
                </View>
              </View>
            )} */}
              <WebView
                source={{
                  uri: 'https://www.store.prempackaging.com/terms-of-sale',
                }}
                onLoadStart={() => setWebViewLoader(true)}
                onLoadEnd={() => setWebViewLoader(false)}
                // style={webViewLoader ? { display: "none" } : { flex: 1 }}
              />
            </View>
          </View>
        </Modal>
      </View>
    </WrapperContainer>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.back,
  },
  imageContainer: {
    padding: 10,
    marginLeft: moderateScale(10),
    borderColor: Colors.border_grey,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateVerticalScale(10),
  },
  catImg: {
    width: moderateScale(75),
    height: moderateScale(75),
  },
  firstSection: {
    width: '95%',
    borderWidth: moderateScale(1),
    alignSelf: 'center',
    marginVertical: moderateVerticalScale(10),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(5),
    borderColor: Colors.border_grey,
  },
  text2: {
    fontSize: textScale(14),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  stateText: {
    fontSize: textScale(20),
    fontWeight: '400',
    color: Colors.border_color,
  },
  innerView: {
    width: '100%',
    padding: moderateScale(10),
  },
  innerView2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(25),
    padding: moderateScale(10),
  },
  imageStyle: {
    height: moderateScale(275),
    width: moderateScale(350),
    alignSelf: 'center',
    marginVertical: moderateVerticalScale(10),
  },
  priceHolder: {
    paddingHorizontal: moderateScale(25),
  },
  mrpText: {
    fontSize: textScale(14),
    color: Colors.text_grey,
    textDecorationLine: 'line-through',
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  imageView: {
    alignSelf: 'center',
    marginVertical: moderateScale(10),
  },
  detailsHolder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  itemHolder: {
    width: '90%',
    alignSelf: 'center',
  },
  heartHolder: {
    // borderWidth: 2,
    width: '15%',
    alignItems: 'center',
    padding: moderateScale(5),
    borderRadius: moderateScale(5),
    borderColor: Colors.border_color,
  },
  quantityHolder: {
    width: '50%',
    borderWidth: 1,
    borderColor: Colors.forgetPassword,
    marginHorizontal: moderateScale(25),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(5),
    overflow: 'hidden',
    marginBottom: moderateVerticalScale(25),
  },
  name: {
    color: Colors.brandColor,
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_SemiBold,
    lineHeight: scale(22),
    letterSpacing: scale(0.3),
  },
  price: {
    color: Colors.brandColor,
    fontSize: textScale(20),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  viwHolder: {
    borderWidth: moderateScale(1),
    width: '95%',
    alignSelf: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
    borderColor: Colors.text_grey,
    gap: moderateScale(5),
    backgroundColor: Colors.white,
    elevation: 5,
  },
  divider: {
    width: '100%',
    borderWidth: moderateScale(1),
    borderColor: Colors.border_grey,
    marginVertical: moderateVerticalScale(15),
  },
  rating: {
    color: Colors.text_grey,
    fontWeight: '700',
    fontSize: textScale(18),
  },
  dText: {
    fontSize: textScale(14),
    color: Colors.black,
    textAlign: 'center',
    fontFamily: FontFamily.Montserrat_Medium,
  },
  innerView3: {
    borderWidth: 2,
    borderColor: Colors.border_color,
    borderRadius: textScale(5),
    width: '60%',
    padding: moderateScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateHolder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: textScale(15),
    width: '80%',
    alignSelf: 'center',
    marginVertical: moderateScale(10),
  },
  textValue: {
    color: Colors.black,
    fontSize: textScale(18),
    marginHorizontal: moderateScale(10),
    fontWeight: '600',
  },
  otherPics: {
    flexDirection: 'row',
    marginHorizontal: moderateScale(10),
    gap: moderateScale(10),
  },
  button: {
    width: '75%',
    backgroundColor: Colors.forgetPassword,
    alignItems: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  productText: {
    color: Colors.forgetPassword,
    fontSize: textScale(15),
    fontWeight: 'bold',
    // padding: moderateScale(10),
  },
  buttonHolder2: {
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  productHolder: {
    borderWidth: moderateScale(1),
    marginVertical: moderateScale(10),
    width: '95%',
    alignSelf: 'center',
    borderRadius: moderateScale(5),
    borderColor: Colors.text_grey,
    padding: moderateScale(10),
    backgroundColor: Colors.white,
  },
  tcHolder: {
    width: '25%',
    alignItems: 'center',
  },
  tcText: {
    fontSize: textScale(14),
    color: Colors.blue,
    fontFamily: FontFamily.Montserrat_SemiBold,
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
  },
  innerView4: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: textScale(15),
    marginHorizontal: textScale(10),
  },
  returnHolder: {
    borderWidth: moderateScale(1),
    width: '80%',
    alignSelf: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
    borderColor: Colors.border_color,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(20),
  },
  subView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconHolder: {
    borderWidth: moderateScale(0.5),
    width: '30%',
    padding: moderateScale(10),
    alignItems: 'center',
    borderColor: Colors.text_grey,
    backgroundColor: Colors.white,
  },
  iconHolder2: {
    borderWidth: 2,
    position: 'absolute',
    top: moderateScale(75),
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(10),
    borderColor: Colors.backGround_grey,
    backgroundColor: Colors.backGround_grey,
    right: moderateScale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonHolder: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
  },
  unitHolder: {
    width: '50%',
    borderWidth: moderateScale(2),
    padding: moderateScale(15),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 25,
    borderColor: Colors.forgetPassword,
    backgroundColor: Colors.white,
  },
  countText: {
    color: Colors.forgetPassword,
    fontSize: textScale(22),
    width: '40%',
    textAlign: 'center',
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  addText: {
    color: Colors.white,
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  descriptionView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(10),
    backgroundColor: Colors.back,
  },
  touch: {
    width: '50%',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: moderateScale(2),
    borderColor: Colors.red,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: moderateVerticalScale(1),
    borderColor: Colors.text_grey,
    paddingVertical: moderateVerticalScale(10),
  },
  tableLabel: {
    color: Colors.text_grey,
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(15),
  },
  tableValue: {
    color: Colors.black,
    fontSize: textScale(14),
    marginHorizontal: moderateScale(10),
    fontFamily: FontFamily.Montserrat_Medium,
  },
  relatedProductsHolder: {
    borderWidth: 2,
    width: '95%',
    padding: moderateScale(10),
    alignSelf: 'center',
    borderRadius: moderateScale(5),
    backgroundColor: 'white',
    marginVertical: moderateScale(10),
    borderColor: Colors.border_grey,
  },
  loaderContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: textScale(15),
    color: Colors.brandColor,
    textAlign: 'center',
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  nanText: {
    fontSize: textScale(16),
    color: Colors.border_color,
    fontFamily: FontFamily.Montserrat_Bold,
    textAlign: 'center',
    padding: moderateScale(20),
  },
  webView: {
    width: '95%',
    alignSelf: 'center',
    height: moderateScale(350),
    borderColor: Colors.border_grey,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(5),
    marginBottom: moderateVerticalScale(10),
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    padding: moderateScale(20),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    gap: moderateScale(10),
    flex: 0.65,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  loaderView: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: 'center',
  },
  activityIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  notesContainer: {
    marginHorizontal: moderateScale(25),
    marginVertical: moderateVerticalScale(10),
    gap: moderateScale(10),
  },
  noteBox: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: moderateScale(5),
    padding: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    justifyContent: 'center',
  },
  noteText: {
    color: Colors.black,
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(12),
    textAlign: 'center',
  },
  sectionHeading: {
    color: Colors.brandColor,
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_Bold,
    borderBottomWidth: 2,
    borderBottomColor: Colors.brandColor,
    paddingBottom: moderateVerticalScale(5),
    alignSelf: 'flex-start',
    marginBottom: moderateVerticalScale(10),
  },
  detailText: {
    fontSize: textScale(13),
    color: '#444444',
    fontFamily: FontFamily.Montserrat_Medium,
    lineHeight: scale(18),
  },
  relatedView: {
    borderWidth: 2,
    borderColor: Colors.white,
    marginBottom: moderateVerticalScale(10),
    width: '95%',
    alignSelf: 'center',
    padding: moderateScale(10),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(5),
  },
});
