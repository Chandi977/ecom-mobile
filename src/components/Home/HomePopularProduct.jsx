import {
  DeviceEventEmitter,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Colors from '../../utils/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ApiService from '../../service/APIService';
import LoginPopup from '../General/loginPopup';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
  width,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import { showMessage } from 'react-native-flash-message';
import Entypo from 'react-native-vector-icons/Entypo';
import StorageService from '../../utils/storageService';
import {
  parseStoredUser,
  showErrorMessage,
  showSuccessMessage,
} from '../../utils/HelperFunction';
import CartService from '../../service/CartService';
import { FadeInUp, PressableScale, Pop } from '../General/Motion';
import ProductImage from '../product/ProductImage';
import {
  formatCardPrice,
  getPrimaryPriceTier,
  getProductCardBadge,
  getProductCardSummary,
  getProductDisplayName,
  isInStock,
} from '../../utils/productCatalog';

const getLineProductId = line => {
  const lineProduct = line?.product;
  if (typeof lineProduct === 'string') return lineProduct;
  return lineProduct?._id || line?.productId || line?.product_id || '';
};

const HomePopularProduct = ({
  data,
  comingFrom,
  brandNameById = {},
  wishlistValueChanged,
  cartValueChanged,
  setCartValueChanged,
  setWishListValueChanged,
}) => {
  const navigation = useNavigation();
  const [wishlist, setWishlist] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [localWishlistUpdates, setLocalWishlistUpdates] = useState({});
  const [cartProductIds, setCartProductIds] = useState(new Set());
  const [totalPrice, setTotalPrice] = useState(0);
  const isBuyItWith = comingFrom === 'buyItWith';
  const visibleProducts = useMemo(
    () => (isBuyItWith ? (data || []).slice(0, 3) : data || []),
    [data, isBuyItWith],
  );

  useEffect(() => {
    const total = visibleProducts.reduce(
      (sum, item) => sum + (getPrimaryPriceTier(item).SP || 0),
      0,
    );
    setTotalPrice(total);
  }, [visibleProducts]);

  useEffect(() => {
    (async () => {
      const savedWishlist = await StorageService.getItem('wishlist');
      savedWishlist && setWishlist(parseStoredUser(savedWishlist));
    })();
  }, []);

  const handleAddToCartBuyItWith = bundleProducts => {
    bundleProducts.forEach(item => {
      if (isInStock(item)) {
        handleAddToCart(item);
      }
    });
  };

  const fetchCartProducts = useCallback(async () => {
    try {
      const cart = await CartService.getCart();
      setCartProductIds(
        new Set((cart || []).map(getLineProductId).filter(Boolean)),
      );
    } catch (error) {
      console.log('Error fetching cart products', error?.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCartProducts();
    }, [fetchCartProducts]),
  );

  const isItemInCart = productId => cartProductIds.has(productId);

  const goToCart = () => {
    navigation.navigate('Cart');
  };

  const handleAddToCart = async product => {
    const tier = getPrimaryPriceTier(product);
    try {
      const result = await CartService.addToCart(product, {
        packSize: tier.number,
        price: tier.SP,
        quantity: 1,
      });
      if (result?.success) {
        setCartProductIds(prev => new Set([...prev, product?._id].filter(Boolean)));
        showSuccessMessage('Product Added to cart successfully');
        DeviceEventEmitter.emit('cartUpdated');
        setCartValueChanged && setCartValueChanged(prev => prev + 1);
      } else {
        showErrorMessage('Unable to add product to cart. Please try again.');
      }
    } catch (e) {
      console.log('Error adding to cart:', e);
      showErrorMessage('Unable to add product to cart. Please try again.');
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

  const handleSaveToWishList = async product => {
    const tier = getPrimaryPriceTier(product);
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
        showMessage({
          message: 'Product removed from wishlist',
          type: 'info',
          icon: 'success',
          color: Colors.white,
          backgroundColor: Colors.red,
        });
      } else {
        // Add to wishlist
        const wishlistData = {
          product: {
            product: product?._id,
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
      setWishListValueChanged && setWishListValueChanged(prev => prev + 1);
      // Refresh wishlist to sync with server
      await fetchWishlist();
    } catch (error) {
      console.log('Error updating wishlist', error);
      showErrorMessage(
        error.message ? error.message : 'Error updating wishlist',
      );
    }
  };

  const renderBadge = badge => {
    if (!badge) return null;
    return (
      <View
        style={[
          styles.badge,
          badge === 'SALE' ? styles.badgeSale : styles.badgePopular,
        ]}
      >
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollViewStyle}
        contentContainerStyle={[
          styles.productContentContainer,
          isBuyItWith && styles.buyItWithContentContainer,
        ]}
        horizontal={!isBuyItWith}
        showsHorizontalScrollIndicator={false}
      >
        {visibleProducts.map((item, index) => {
          const tier = getPrimaryPriceTier(item);
          const badge = getProductCardBadge(item);
          const showMrp = tier.MRP > tier.SP;
          const title = getProductDisplayName(item, { brandNameById });
          const summary = getProductCardSummary(item);
          const inStock = isInStock(item);
          const inCart = isItemInCart(item?._id);

          if (isBuyItWith) {
            return (
              <React.Fragment key={item?._id || index}>
                <FadeInUp delay={Math.min(index, 6) * 70}>
                  <PressableScale
                    style={[styles.item, styles.buyItWithItem]}
                    onPress={() => navigation.push('ProductDetails', { item })}
                  >
                    <View style={[styles.imageHolder, styles.buyItWithImageHolder]}>
                      <ProductImage product={item} style={styles.image} />
                    </View>
                    <View style={[styles.textHolder, styles.buyItWithTextHolder]}>
                      <Text
                        numberOfLines={2}
                        style={[styles.title, styles.buyItWithTitle]}
                      >
                        {title || item?.name}
                      </Text>
                      <View style={styles.priceRow}>
                        {showMrp && (
                          <Text style={styles.mrpText}>
                            {formatCardPrice(tier.MRP)}
                          </Text>
                        )}
                        <Text style={[styles.priceText, styles.buyItWithPriceText]}>
                          {formatCardPrice(tier.SP)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.heartIconHolder, styles.buyItWithHeartIconHolder]}
                      onPress={() => handleSaveToWishList(item)}
                    >
                      <Pop trigger={isItemInWishlist(item?._id)} peak={1.35}>
                        <AntDesign
                          name={isItemInWishlist(item?._id) ? 'heart' : 'hearto'}
                          size={moderateScale(16)}
                          color={
                            isItemInWishlist(item?._id)
                              ? Colors.red
                              : Colors.text_grey
                          }
                        />
                      </Pop>
                    </TouchableOpacity>
                  </PressableScale>
                </FadeInUp>
                {index < visibleProducts.length - 1 && (
                  <View style={styles.plusIconHolder}>
                    <Entypo
                      name="plus"
                      size={textScale(22)}
                      color={Colors.brandColor}
                    />
                  </View>
                )}
              </React.Fragment>
            );
          }

          return (
            <FadeInUp key={item?._id || index} delay={Math.min(index, 6) * 70}>
              <PressableScale
                style={styles.item}
                onPress={() => navigation.push('ProductDetails', { item })}
              >
                {renderBadge(badge)}
                <TouchableOpacity
                  style={styles.heartIconHolder}
                  onPress={() => handleSaveToWishList(item)}
                >
                  <Pop trigger={isItemInWishlist(item?._id)} peak={1.35}>
                    <AntDesign
                      name={isItemInWishlist(item?._id) ? 'heart' : 'hearto'}
                      size={moderateScale(20)}
                      color={
                        isItemInWishlist(item?._id) ? Colors.red : Colors.text_grey
                      }
                    />
                  </Pop>
                </TouchableOpacity>

                <View style={styles.imageHolder}>
                  <ProductImage product={item} style={styles.image} />
                </View>

                <View style={styles.textHolder}>
                  <Text numberOfLines={2} style={styles.title}>
                    {title || item?.name}
                  </Text>
                  {!!summary && (
                    <Text numberOfLines={1} style={styles.summary}>
                      {summary}
                    </Text>
                  )}
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, styles.productPriceText]}>
                      {formatCardPrice(tier.SP)}
                    </Text>
                    {showMrp && (
                      <Text style={styles.mrpText}>{formatCardPrice(tier.MRP)}</Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    !inStock
                      ? navigation.push('ProductDetails', { item })
                      : inCart
                      ? goToCart()
                      : handleAddToCart(item)
                  }
                  style={[styles.button, !inStock && styles.buttonDisabled]}
                >
                  <Text style={styles.buttonText}>
                    {!inStock
                      ? 'VIEW PRODUCT'
                      : inCart
                      ? 'GO TO CART'
                      : 'ADD TO CART'}
                  </Text>
                </TouchableOpacity>
              </PressableScale>
            </FadeInUp>
          );
        })}
      </ScrollView>
      {isBuyItWith && (
        <View
          style={{
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            gap: moderateVerticalScale(10),
          }}
        >
          <Text style={styles.totalPriceText}>
            Total Price :{' '}
            <Text style={{ color: Colors.green }}>
              {Math.ceil(totalPrice.toFixed(2))}
            </Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.buttonHolder,
              {
                backgroundColor: visibleProducts.some(item => !isInStock(item))
                  ? Colors.outOfStock
                  : Colors.brandColor,
                borderColor: visibleProducts.some(item => !isInStock(item))
                  ? Colors.outOfStock
                  : Colors.brandColor,
              },
            ]}
            disabled={visibleProducts.some(item => !isInStock(item))}
            onPress={() => handleAddToCartBuyItWith(visibleProducts)}
          >
            <Text style={styles.buttonText2}>
              Add all {visibleProducts.length} to cart
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {showLoginPopup && (
        <LoginPopup
          showLoginPopup={showLoginPopup}
          setShowLoginPopup={setShowLoginPopup}
        />
      )}
    </View>
  );
};

export default HomePopularProduct;

const SCREEN_GUTTER = moderateScale(20);
const CARD_GAP = moderateScale(12);
const TWO_COLUMN_CARD_WIDTH = Math.floor((width - SCREEN_GUTTER * 2 - CARD_GAP) / 2);
const CARD_WIDTH = Math.max(moderateScale(150), TWO_COLUMN_CARD_WIDTH);

const styles = StyleSheet.create({
  item: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    marginVertical: moderateScale(8),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: Colors.border_grey,
    overflow: 'hidden',
    paddingBottom: 0,
  },
  buyItWithItem: {
    width: Math.floor((width - moderateScale(78)) / 3),
    margin: 0,
    marginVertical: moderateScale(6),
  },
  imageHolder: {
    width: '100%',
    height: moderateScale(128),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingTop: moderateScale(22),
    paddingHorizontal: moderateScale(12),
    paddingBottom: moderateScale(8),
  },
  buyItWithImageHolder: {
    height: moderateScale(82),
    paddingTop: moderateScale(8),
  },
  image: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  textHolder: {
    width: '100%',
    paddingHorizontal: moderateScale(12),
    paddingTop: moderateScale(4),
    gap: moderateVerticalScale(3),
  },
  buyItWithTextHolder: {
    paddingHorizontal: moderateScale(8),
    paddingBottom: moderateScale(8),
  },
  title: {
    fontSize: textScale(12.5),
    color: Colors.brandColor,
    textAlign: 'left',
    textTransform: 'capitalize',
    fontFamily: FontFamily.Montserrat_Bold,
    lineHeight: textScale(17),
    minHeight: textScale(34),
  },
  buyItWithTitle: {
    fontSize: textScale(11),
    minHeight: textScale(30),
  },
  summary: {
    fontSize: textScale(10.5),
    color: Colors.text_grey,
    textAlign: 'left',
    fontFamily: FontFamily.Montserrat_Medium,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: moderateScale(6),
    marginTop: moderateVerticalScale(2),
  },
  priceText: {
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_ExtraBold,
  },
  productPriceText: {
    fontSize: textScale(17),
  },
  buyItWithPriceText: {
    fontSize: textScale(13),
  },
  mrpText: {
    fontSize: textScale(11),
    color: Colors.text_grey,
    textDecorationLine: 'line-through',
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  badge: {
    position: 'absolute',
    top: moderateScale(8),
    left: moderateScale(8),
    zIndex: 2,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(3),
  },
  badgeSale: {
    backgroundColor: Colors.red,
  },
  badgePopular: {
    backgroundColor: Colors.brandColor,
  },
  badgeText: {
    color: Colors.white,
    fontSize: textScale(9),
    fontFamily: FontFamily.Montserrat_ExtraBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heartIconHolder: {
    position: 'absolute',
    top: moderateScale(6),
    right: moderateScale(6),
    zIndex: 2,
    padding: moderateScale(5),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.white,
  },
  buyItWithHeartIconHolder: {
    padding: moderateScale(3),
    top: moderateScale(3),
    right: moderateScale(3),
  },
  button: {
    width: '100%',
    marginTop: moderateVerticalScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brandColor,
    paddingVertical: moderateScale(10),
  },
  buttonDisabled: {
    backgroundColor: Colors.outOfStock,
  },
  buttonText: {
    fontSize: textScale(11),
    textAlign: 'center',
    fontFamily: FontFamily.Montserrat_ExtraBold,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  plusIconHolder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: moderateScale(18),
  },
  scrollViewStyle: {
    marginVertical: moderateVerticalScale(10),
    width: '100%',
  },
  productContentContainer: {
    paddingLeft: SCREEN_GUTTER,
    paddingRight: SCREEN_GUTTER - CARD_GAP,
    alignItems: 'stretch',
    flexGrow: 1,
  },
  buyItWithContentContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(4),
  },
  totalPriceText: {
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
    fontSize: textScale(17),
  },
  buttonHolder: {
    borderWidth: 2,
    borderColor: Colors.brandColor,
    backgroundColor: Colors.brandColor,
    width: '60%',
    padding: moderateScale(10),
    alignItems: 'center',
    borderRadius: moderateScale(10),
  },
  buttonText2: {
    fontFamily: FontFamily?.Montserrat_Medium,
    fontSize: textScale(15),
    color: Colors.white,
    paddingHorizontal: moderateScale(10),
  },
});
