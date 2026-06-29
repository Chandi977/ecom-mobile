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
import FastImage from 'react-native-fast-image';
import { showMessage } from 'react-native-flash-message';
import Entypo from 'react-native-vector-icons/Entypo';
import StorageService from '../../utils/storageService';
import {
  parseStoredUser,
  showErrorMessage,
  showSuccessMessage,
} from '../../utils/HelperFunction';
import GuestCartService from '../../utils/GuestCartService';

const HomePopularProduct = ({
  data,
  comingFrom,
  wishlistValueChanged,
  cartValueChanged,
  setCartValueChanged,
  setWishListValueChanged,
}) => {
  const navigation = useNavigation();
  const [wishlist, setWishlist] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [localWishlistUpdates, setLocalWishlistUpdates] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const isBuyItWith = comingFrom === 'buyItWith';
  const visibleProducts = useMemo(
    () => (isBuyItWith ? data.slice(0, 3) : data),
    [data, isBuyItWith],
  );

  useEffect(() => {
    const total = visibleProducts.reduce((sum, item) => {
      return sum + (item?.priceList?.[0]?.SP || 0);
    }, 0);
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
      if (item?.priceList?.[0]?.stock_quantity > 0) {
        handleAddToCart(item);
      }
    });
  };

  const handleAddToCart = async product => {
    // console.log("hii Add to cart");
    const user = await StorageService.getItem('user_data');
    if (user) {
      const userData = parseStoredUser(user);
      const cartData = {
        product: {
          product: product?._id,
          packSize: product?.priceList[0].number,
          price: product?.priceList[0].SP,
          quantity: 1,
          stock: 1000,
          totalWeight: product?.priceList[0].number,
          totalPackWeight: 0,
        },
        user: userData?._id,
      };

      try {
        const response = await ApiService.ADD_TO_CART(cartData);
        if (response?.success) {
          showSuccessMessage('Product Added to cart successfully');
          DeviceEventEmitter.emit('cartUpdated');
        }
      } catch (e) {
        console.log('Error adding to cart:', e);
      }
    } else {
      // Guest user: persist locally; merged into the server cart on login.
      try {
        await GuestCartService.addItem({
          product,
          packSize: product?.priceList?.[0]?.number,
          price: product?.priceList?.[0]?.SP,
          quantity: 1,
        });
        showSuccessMessage('Product Added to cart successfully');
        DeviceEventEmitter.emit('cartUpdated');
      } catch (e) {
        console.log('Error adding to guest cart:', e);
      }
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
    console.log(product, 'line 141');
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
            packSize: product?.priceList[0].number,
            price: product?.priceList[0].SP,
            quantity: 1,
            stock: 1000,
            totalWeight: product?.priceList[0].number,
            totalPackWeight: 0,
          },
          user: userData?._id,
        };
        console.log(wishlistData, 'wishlistData');
        const response = await ApiService.ADD_TO_WISHLIST(wishlistData);
        console.log(response, 'line 198');
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
      showErrorMessage(
        error.message ? error.message : 'Error updating wishlist',
      );
    }
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
        {visibleProducts.map((item, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              key={index}
              style={[styles.item, isBuyItWith && styles.buyItWithItem]}
              onPress={() => navigation.push('ProductDetails', { item })}
            >
              <View
                style={[
                  styles.imageHolder3,
                  isBuyItWith && styles.buyItWithImageHolder,
                ]}
              >
                <FastImage
                  style={styles.image}
                  source={{
                    uri: item?.images[0]?.image,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.web,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <View
                style={[
                  styles.itemTextHolder,
                  isBuyItWith && styles.buyItWithTextHolder,
                ]}
              >
                <Text
                  numberOfLines={2}
                  style={[
                    styles.nameText,
                    isBuyItWith && styles.buyItWithNameText,
                    { textTransform: 'capitalize' },
                  ]}
                >
                  {item?.name}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: moderateScale(5),
                    width: '100%',
                  }}
                >
                  <Text style={styles.mrpText}>
                    ₹{Math.round(item?.priceList?.[0]?.MRP)}
                  </Text>
                  <Text
                    style={[
                      styles.priceText,
                      isBuyItWith
                        ? styles.buyItWithPriceText
                        : styles.productPriceText,
                    ]}
                  >
                    ₹{Math.round(item?.priceList[0]?.SP || '0')}
                  </Text>
                </View>
              </View>
              <View style={styles.discountHolder}>
                <View style={styles.offerView}>
                  <Text style={styles.offerText}>
                    {parseInt(
                      ((item?.priceList[0]?.MRP - item?.priceList[0]?.SP) /
                        item?.priceList[0]?.MRP) *
                        100,
                      10,
                    )}
                    %{'\n'}
                    OFF
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.heartIconHolder,
                  isBuyItWith && styles.buyItWithHeartIconHolder,
                ]}
                onPress={() => {
                  handleSaveToWishList(item);
                }}
              >
                <AntDesign
                  name={isItemInWishlist(item?._id) ? 'heart' : 'heart'}
                  size={isBuyItWith ? moderateScale(18) : moderateScale(25)}
                  color={
                    isItemInWishlist(item?._id) ? Colors.red : Colors.text_grey
                  }
                />
              </TouchableOpacity>
              {isBuyItWith ? null : (
                <TouchableOpacity
                  // onPress={() => handleAddToCart(item)}
                  onPress={() => navigation.push('ProductDetails', { item })}
                  // disabled={item?.priceList[0]?.stock_quantity <= 0}
                  style={[styles.button]}
                >
                  <Text style={[styles.buttonText]}>VIEW PRODUCT</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            {/* Display "+" icon if comingFrom is 'buyItWith' and it's not the last product */}
            {isBuyItWith && index < visibleProducts.length - 1 && (
              <View style={styles.plusIconHolder}>
                <Entypo
                  name="plus"
                  size={textScale(22)}
                  color={Colors.brandColor}
                />
              </View>
            )}
          </React.Fragment>
        ))}
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
                backgroundColor: visibleProducts.some(
                  item => item?.priceList?.[0]?.stock_quantity <= 0,
                )
                  ? Colors.outOfStock
                  : Colors.brandColor,
                borderColor: visibleProducts.some(
                  item => item?.priceList?.[0]?.stock_quantity <= 0,
                )
                  ? Colors.outOfStock
                  : Colors.brandColor,
              },
            ]}
            disabled={visibleProducts.some(
              item => item?.priceList?.[0]?.stock_quantity <= 0,
            )}
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

const styles = StyleSheet.create({
  item: {
    padding: moderateScale(10),
    backgroundColor: Colors.white,
    // elevation: moderateScale(10),
    gap: moderateScale(5),
    width: moderateScale(160),
    margin: moderateScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: Colors.border_grey,
  },
  buyItWithItem: {
    width: Math.floor((width - moderateScale(78)) / 3),
    marginHorizontal: 0,
    marginVertical: moderateScale(6),
    padding: moderateScale(6),
    gap: moderateScale(3),
  },
  imageHolder3: {
    width: '100%',
    height: moderateScale(120),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  buyItWithImageHolder: {
    height: moderateScale(78),
  },
  image: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  itemTextHolder: {
    width: '100%',
    height: moderateScale(60),
    gap: moderateScale(3),
    alignItems: 'center',
  },
  buyItWithTextHolder: {
    height: moderateScale(52),
  },
  priceText: {
    fontSize: textScale(16),
    color: Colors.green,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  productPriceText: {
    fontSize: textScale(18),
  },
  buyItWithPriceText: {
    fontSize: textScale(12),
  },
  nameText: {
    fontSize: textScale(15),
    color: Colors.black,
    textAlign: 'center',
    fontFamily: FontFamily.Montserrat_Medium,
  },
  buyItWithNameText: {
    fontSize: textScale(11),
  },
  discountHolder: {
    position: 'absolute',
    top: '0%',
    right: '0%',
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(50),
    // borderRadius: moderateScale(5),
    width: '25%',
  },
  offerView: {
    backgroundColor: Colors.red,
    padding: moderateScale(5),
    width: '100%',
    borderBottomLeftRadius: moderateScale(10),
    // borderRadius: moderateScale(5),
  },
  outOfStock: {
    backgroundColor: Colors.red,
    padding: moderateScale(5),
    borderTopRightRadius: moderateScale(5),
    borderBottomEndRadius: moderateScale(5),
    // borderRadius: moderateScale(5),
  },
  outOfStockText: {
    fontSize: textScale(14),
    color: Colors.white,
  },
  offerText: {
    fontSize: textScale(12),
    color: Colors.white,
    fontFamily: FontFamily.Montserrat_Medium,
  },
  heartIconHolder: {
    position: 'absolute',
    top: '0%',
    left: '0%',
    padding: moderateScale(5),
    borderRadius: moderateScale(10),
    backgroundColor: Colors.white,
    borderColor: Colors.border_color,
    // borderWidth: 1,
    overflow: 'hidden',
  },
  buyItWithHeartIconHolder: {
    padding: moderateScale(3),
  },
  button: {
    marginHorizontal: moderateScale(-10),
    marginBottom: moderateScale(-10),
    alignItems: 'center',
    backgroundColor: Colors.brandColor,
  },
  buttonText: {
    fontSize: textScale(14),
    textAlign: 'center',
    padding: moderateScale(10),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.white,
  },
  productHolder: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(15),
    alignSelf: 'center',
    // justifyContent: "center",
    marginVertical: moderateVerticalScale(10),
  },
  scrollViewStyle: {
    marginVertical: moderateVerticalScale(10),
    width: '100%',
  },
  productContentContainer: {
    paddingHorizontal: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  buyItWithContentContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(4),
  },
  loaderContainer: {
    width: '90%',
    alignSelf: 'center',
    paddingBottom: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    fontSize: textScale(14),
    color: 'black',
    textAlign: 'center',
  },
  loaderView: {
    position: 'absolute',
    width: '100%',
    top: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mrpText: {
    fontSize: textScale(14),
    color: Colors.green,
    textDecorationLine: 'line-through',
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  plusIconHolder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: moderateScale(18),
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
