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
import PendingCartService from '../utils/PendingCartService';

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

const formatGst = (value, fallback = "Not Available") => {
  if (!hasValue(value)) return fallback;
  if (typeof value === "number") {
    const percent = value <= 1 ? value * 100 : value;
    return `${Number.isInteger(percent) ? percent : percent.toFixed(2)}%`;
  }
  const text = String(value).trim();
  if (text.includes("%")) return text;
  const numericValue = Number(text);
  if (Number.isFinite(numericValue)) {
    const percent = numericValue <= 1 ? numericValue * 100 : numericValue;
    return `${Number.isInteger(percent) ? percent : percent.toFixed(2)}%`;
  }
  return text;
};

const getProductKind = (product) => {
  const categoryId = normalizeId(product?.category);
  const categoryName = typeof product?.category === "object" ? product?.category?.name || "" : "";
  const categorySlug = typeof product?.category === "object" ? product?.category?.slug || "" : "";
  const searchText = [product?.name, product?.slug, product?.model, categoryName, categorySlug]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (categoryId === PACKPRO_TAPE_CATEGORY_ID || /tape/i.test(searchText)) return "tape";
  if (CARRY_BAG_CATEGORY_IDS.has(categoryId) || /carry.*bag/i.test(searchText)) return "carry-bag";
  if (FOOD_WRAPPING_CATEGORY_IDS.has(categoryId) || /food.*wrapping|foil/.test(searchText)) return "foil-paper";
  if (categoryId === LABEL_CATEGORY_ID || /label/i.test(searchText)) return "label";
  if (categoryId === POLY_BAG_CATEGORY_ID || /poly.*bag/i.test(searchText)) return "polybag";
  if (categoryId === PAPER_BAG_CATEGORY_ID || /paper.*bag/i.test(searchText)) return "paperbag";
  if (categoryId === CORRUGATED_BOX_CATEGORY_ID || categoryId === "6926d7c0d53f3a772c6f08af" || /corrugated/i.test(searchText)) return "corrugated";
  return "generic";
};

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

const SPEC_FIELD_KEYS = [
  'length', 'width', 'height', 'length_inch', 'length_mm', 'breadth_inch',
  'breadth_mm', 'height_inch', 'height_mm', 'size_inch', 'size_mm', 'flap_mm',
  'thickness', 'thickness_micron', 'gusset', 'print', 'label_in_roll',
  'core_size', 'pouch_weight', 'adhesive', 'material', 'color', 'colour',
  'weight', 'size'
];

const getProductSpecification = (product) => {
  const source = product || {};
  const normalized = source.specification && typeof source.specification === 'object' ? source.specification : {};
  const attributes = normalized.attributes && typeof normalized.attributes === 'object' ? normalized.attributes : {};
  const specification = { ...attributes, ...normalized };

  delete specification._id;
  delete specification.product;
  delete specification.createdAt;
  delete specification.updatedAt;
  delete specification.attributes;

  SPEC_FIELD_KEYS.forEach((key) => {
    if (!hasValue(specification[key]) && hasValue(source[key])) {
      specification[key] = source[key];
    }
  });

  return specification;
};

const getMobileSpecifications = (product) => {
  const specification = getProductSpecification(product);
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

const getOverviewFields = (product, packSize, weightValue) => {
  if (!product) return [];

  const adminManagedFields = Array.isArray(product?.overview_fields)
    ? product.overview_fields
        .map((field) => ({
          label: field?.label,
          value: field?.value,
        }))
        .filter((field) => field?.label && hasValue(field?.value))
    : [];

  if (adminManagedFields.length > 0) return adminManagedFields;

  const productKind = getProductKind(product);

  const brandName = product?.brand?.name || "";
  const prodName = product?.name || "";
  const prodModel = product?.model || "";
  const fullTitle = [brandName, prodName, prodModel].filter(Boolean).join(" ");

  const formatBoolean = (val) => {
    if (val === true || val === "true" || val === "Yes") return "Yes";
    return "No";
  };

  const commonFields = [
    { label: "Brand", value: brandName || "Not Available" },
    { label: "Model", value: prodModel || "Not Available" },
    { label: "Product Title", value: fullTitle || "Not Available" },
    { label: "Dimension (inch)", value: product?.size_inch || "Not Available" },
    { label: "Dimension (mm)", value: product?.size_mm || "Not Available" },
    { label: "HSN Code", value: product?.hsn_code || "Not Available" },
    { label: "GST", value: formatGst(product?.gst) },
    { label: "Pack Size", value: hasValue(packSize) ? packSize : "Not Available" },
    { label: "Weight", value: hasValue(weightValue) ? `${weightValue} kg` : "Not Available" },
    { label: "Colour", value: product?.color || "Not Available" },
    { label: "Material", value: product?.material || "Not Available" },
    { label: "Recyclable", value: product?.recyclable !== undefined ? formatBoolean(product?.recyclable) : "Not Available" },
    { label: "Biodegradable", value: product?.biodegradable !== undefined ? formatBoolean(product?.biodegradable) : "Not Available" },
    { label: "Delivery Time", value: product?.delivery_time || "Not Available" },
  ].filter((field) => field.value !== "Not Available");

  return commonFields;
};

const ProductDetails = ({ route }) => {
  const [webViewHeight, setWebViewHeight] = useState(100);
  const { item } = route.params;
  const autoAddExecutedRef = React.useRef(false);
  console.log(item, 'Line 31');
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

  const fetchCrossCategoryProducts = async () => {
    setIsCrossLoading(true);
    try {
      const response = await ApiService.GET_ALL_PRODUCTS();
      const allProducts = response?.data || [];
      const currentCategoryId = item?.category?._id;
      const targetCategoryIds = CROSS_CATEGORY_MAP[currentCategoryId] || [
        '6557df46301ec4f2f4266139',
        '6557df4f301ec4f2f426613d',
      ];
      const cross = [];
      for (const catId of targetCategoryIds) {
        const found = allProducts.find(
          p => p?.category?._id === catId && p?._id !== item?._id,
        );
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

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
      fetchSingleProduct();
      fetchCrossCategoryProducts();

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
        const wishlistData = {
          product: {
            brand: product?.brand?._id,
            product: product?._id,
            category: product?.category?._id,
            packSize: product?.priceList[0].number,
            price: product?.priceList[0].SP,
            quantity: 1,
            stock: 1000,
            totalWeight: product?.priceList[0].number,
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

    // Priority 2 (fallback): same category, exclude current product
    if (fetchedProducts.length === 0) {
      try {
        const response = await ApiService.GET_ALL_PRODUCTS();
        const allProducts = response?.data || [];
        const sameCat = allProducts.filter(
          p =>
            p?.category?._id === item?.category?._id && p?._id !== item?._id,
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

  const overviewFieldsData = getOverviewFields(
    item,
    number ? number : item?.priceList?.[0]?.number,
    packWeight ? packWeight : item?.priceList?.[0]?.pack_weight,
  );

  const handlePackSize = item => {
    console.log(item, 'Line 185');
    setShowPackSizeModal(true);
    setPackSizeData(item?.priceList);
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
    let user = await StorageService.getItem('user_data');
    if (user !== null) {
      const userData = parseStoredUser(user);
      const effectiveCount = overrideCount !== null ? overrideCount : count;
      let data = {
        product: {
          brand: product?.brand?._id,
          product: product?._id,
          category: product?.category?._id,
          packSize: number ? number : product?.priceList[0].number,
          price: sp ? sp : product?.priceList?.[0]?.SP,
          quantity: effectiveCount,
          stock: 1000,
          totalWeight: product?.priceList[0].number,
          totalPackWeight: 0,
        },
        user: userData?._id,
      };
      console.log(data, 'Line 212');
      try {
        const response = await ApiService.ADD_TO_CART(data);
        console.log('Add To Cart Response:', response);
        if (response?.success) {
          showMessage({
            message: 'Product Added to cart successfully',
            type: 'success',
            icon: 'success',
          });
          DeviceEventEmitter.emit('cartUpdated');
        }
      } catch (e) {
        console.log('Error:', e);
      }
    } else {
      PendingCartService.set(product, count);
      setShowLoginPopup(true);
    }
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
              <FastImage
                style={styles.imageStyle}
                source={{
                  uri: bigImage === null ? item?.images[0]?.image : bigImage,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.web,
                }}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                resizeMode={FastImage.resizeMode.stretch}
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
                  {item?.images.map((item, i) => {
                    return (
                      <TouchableOpacity
                        key={i}
                        style={styles.imageContainer}
                        onPress={() => setBigImage(item?.image)}
                      >
                        <Image
                          source={{ uri: item?.image }}
                          style={styles.catImg}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              <View
                style={{
                  marginVertical: moderateVerticalScale(10),
                  gap: moderateScale(10),
                }}
              >
                <Text
                  style={[
                    styles.name,
                    {
                      fontFamily: FontFamily.Montserrat_Bold,
                      fontSize: textScale(15),
                    },
                  ]}
                >
                  About the item
                </Text>
                <View style={styles.itemHolder}>
                  <Text style={styles.text2}>
                    1. Price per{' '}
                    {number ? number : item?.priceList?.[0]?.number} pcs + GST
                    18%
                  </Text>
                  <Text style={styles.text2}>
                    2. Brand : - {item?.brand?.name ? item?.brand?.name : 'N/A'}{' '}
                  </Text>
                  <Text style={styles.text2}>
                    3. Model : - {item?.model ? item?.model : 'N/A'}{' '}
                  </Text>
                  <Text style={styles.text2}>
                    4. Dimensions : -{' '}
                    {item?.size_inch ? item?.size_inch : 'N/A'}( inches)
                  </Text>
                  <Text style={styles.text2}>
                    5. Pack of {number ? number : item?.priceList?.[0]?.number}{' '}
                    Pcs
                  </Text>
                </View>
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
                    color:
                      item?.priceList[0]?.stock_quantity > 0
                        ? Colors.green
                        : Colors.red,
                  },
                ]}
              >
                {item?.priceList[0]?.stock_quantity > 0
                  ? 'In Stock'
                  : 'Out of Stock'}
              </Text>
            </View>
            <View style={styles.priceHolder}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: moderateScale(5),
                  marginBottom: moderateVerticalScale(10),
                }}
              >
                <Text
                  style={{
                    color: Colors.brandColor,
                    fontSize: textScale(14),
                    fontFamily: FontFamily.Montserrat_Regular,
                  }}
                >
                  M.R.P
                </Text>
                <Text style={styles.mrpText}>
                  Rs.{mrp ? mrp : item?.priceList?.[0]?.MRP}
                </Text>
              </View>
              {item?.priceList.length > 2 && (
                <Text style={styles.price}>
                  Rs.{sp ? sp : item?.priceList?.[0]?.SP}
                </Text>
              )}
              {item?.priceList.length > 2 ? (
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
                    onPress={() => handlePackSize(item)}
                  >
                    <Text style={styles.text2}>
                      {number ? number : item?.priceList[0]?.number}
                    </Text>
                    <AntDesign
                      name="down"
                      color={Colors.brandColor}
                      size={textScale(14)}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.price}>Rs.{item?.priceList?.[0]?.SP}</Text>
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
                // onPress={() => handleAddToCart(item)}
                onPress={() =>
                  item?.priceList[0]?.stock_quantity > 0
                    ? handleAddToCart(item)
                    : handleNotify(item)
                }
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      item?.priceList[0]?.stock_quantity > 0
                        ? Colors.brandColor
                        : Colors.brandColor,
                  },
                ]}
                // disabled={item?.priceList[0]?.stock_quantity > 0 ? false : true}
              >
                <Text style={styles.addText}>
                  {item?.priceList[0]?.stock_quantity > 0
                    ? 'ADD TO CART'
                    : 'Notify Me'}
                </Text>
                {/* <Text style={styles.addText}>ADD TO CART</Text> */}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heartHolder}
                onPress={() => handleSaveToWishList(item)}
              >
                <AntDesign
                  name={isItemInWishlist(item._id) ? 'heart' : 'heart'}
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

            {/* 4 Icons */}
            {(() => {
              const visibleBadges = [
                isFieldVisible(item, 'badge:free_delivery') && { id: 1, name: 'Free Delivery', image: ImagePath.delivery },
                isFieldVisible(item, 'badge:secure_transaction') && { id: 2, name: 'Secured Transaction', image: ImagePath.secure },
                isFieldVisible(item, 'badge:no_returns') && { id: 3, name: 'No Return', image: ImagePath.noReturn },
                isFieldVisible(item, 'badge:recyclable') && { id: 4, name: '100% Recyclable', image: ImagePath.recycle },
              ].filter(Boolean);

              if (visibleBadges.length === 0) return null;

              return (
                <View
                  style={{
                    marginVertical: moderateVerticalScale(10),
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    paddingHorizontal: moderateScale(10),
                  }}
                >
                  {visibleBadges.map(badge => (
                    <View
                      key={badge?.id}
                      style={{
                        alignItems: 'center',
                        width: `${Math.floor(92 / visibleBadges.length)}%`,
                        gap: moderateVerticalScale(5),
                      }}
                    >
                      <Image
                        source={badge?.image}
                        resizeMode="contain"
                        style={{
                          width: moderateScale(24),
                          height: moderateScale(24),
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: FontFamily.Montserrat_Medium,
                          color: Colors.black,
                          fontSize: textScale(9),
                          textAlign: 'center',
                        }}
                      >
                        {badge?.name}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })()}
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
          {/* Third Section: Quick Overview, Specifications & Details */}
          {(() => {
            const showQuickOverview = isFieldVisible(item, 'section:quick_overview');
            const showSpecifications = isFieldVisible(item, 'section:specifications');
            const showProductDetails = isFieldVisible(item, 'section:product_details');
            const specificationsData = getMobileSpecifications(item);

            const hasDescription = Boolean(item?.description && String(item?.description).trim());
            const hasAboutItem = Boolean(item?.aboutItem && String(item?.aboutItem).trim());

            if (!showQuickOverview && !showSpecifications && !showProductDetails) return null;

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

                {/* 2. Specifications */}
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

                {/* 3. Product Details */}
                {showProductDetails && (hasDescription || hasAboutItem) && (
                  <View>
                    <Text style={styles.sectionHeading}>Product Details</Text>
                    <View style={{ marginTop: moderateVerticalScale(5) }}>
                      {hasDescription ? (
                        <WebView
                          source={{
                            html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${item?.description}</body></html>`,
                          }}
                          injectedJavaScript={webViewScript}
                          onMessage={onWebViewMessage}
                          style={{ height: webViewHeight }}
                          originWhitelist={['*']}
                        />
                      ) : (
                        <Text style={styles.text2}>{item.aboutItem}</Text>
                      )}
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
    color: Colors.red,
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
