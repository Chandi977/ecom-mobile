import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Colors from '../../utils/Colors';
import InternalHeader from '../../components/Header/InternalHeader';
import { showMessage } from 'react-native-flash-message';
import FontFamily from '../../utils/FontFamily';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FastImage from 'react-native-fast-image';
import ApiService from '../../service/APIService';
import WrapperContainer from '../../utils/WrapperContainer';
import StorageService from '../../utils/storageService';
import { parseStoredUser, showSuccessMessage } from '../../utils/HelperFunction';

const Wishlist = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const placeholderImage = 'https://prempackaging.com/img/logo.png';

  const brand = [
    {
      id: '6557dbad301ec4f2f4266103',
      name: 'Amazon',
    },
    {
      id: '6557dbbc301ec4f2f4266107',
      name: 'Flipkart',
    },
    {
      id: '6557dbcc301ec4f2f426610b',
      name: 'Myntra',
    },
    {
      id: '6557dbf9301ec4f2f426611e',
      name: 'Rollabel',
    },
    {
      id: '6557dc10301ec4f2f4266122',
      name: 'Pack Secure',
    },
    {
      id: '6582c8580ab82549a084894f',
      name: 'Ajio',
    },
    {
      id: '6582c8750ab82549a0848953',
      name: 'PackPro',
    },
  ];

  useEffect(() => {
    fetchLoginData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const fetchLoginData = async () => {
    try {
      const userStr = await StorageService.getItem('user_data');
      if (userStr) {
        const userData = parseStoredUser(userStr);
        loadWishlist(userData?._id);
        setUserId(userData?._id);
        setIsUserLoggedIn(true);
      } else {
        setIsUserLoggedIn(false);
      }
    } catch (e) {
      console.log(e);
      setIsUserLoggedIn(false);
    }
  };
  const loadWishlist = async id => {
    // console.log(id, "line 64 ");
    setLoading(true);
    try {
      setLoading(true);
      const response = await ApiService.GET_WISHLIST_PRODUCTS(id);
      // console.log(response?.data?.products.length, "line 69");
      if (response && response?.data?.products) {
        setWishlist(response?.data?.products);
        // console.log(response?.data?.products[4], "line 68");
        setLoading(false);
      }
    } catch (error) {
      console.log('Error loading wishlist', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async item => {
    try {
      let data = {
        product: item?.product?._id,
        user: userId,
      };
      console.log(data, 'line 95');
      setLoading(true);
      const response = await ApiService.REMOVE_FROM_WISHLIST(data);
      // console.log(response, "line 130");
      if (response?.success) {
        showSuccessMessage("Product removed from wishlist")
        loadWishlist(userId);
        setLoading(false);
      }
    } catch (error) {
      console.log('Error removing from wishlist', error);
      setLoading(false);
    }
  };

  const handleProductDetails = item => {
    navigation.navigate('ProductDetails', { item });
  };

  return (
    <WrapperContainer isLoading={loading}>
      <View style={styles.main}>
        <InternalHeader title={'Wishlist'} />
        {isUserLoggedIn ? (
          <>
            <ScrollView>
              {wishlist.length === 0 ? (
                <View style={styles.emptyView}>
                  <Text style={styles.loaderText}>Your Wishlist is empty</Text>
                  <Text style={styles.textStyle}>
                    Save items that you like in your Wishlist.{'\n'}Review them
                    anytime and move them to the cart easily.
                  </Text>
                </View>
              ) : (
                wishlist.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.card}
                    onPress={() => handleProductDetails(item?.product)}
                  >
                    <View style={styles.cartImageHolder}>
                      <FastImage
                        style={styles.cartImage}
                        source={{
                          uri:
                            item?.product?.images[0]?.image || placeholderImage,
                          priority: FastImage.priority.high,
                          cache: FastImage.cacheControl.immutable,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                        onError={() =>
                          setWishlist(prevWishlist =>
                            prevWishlist.map(wishlistItem =>
                              wishlistItem._id === item._id
                                ? {
                                    ...wishlistItem,
                                    images: [{ image: placeholderImage }],
                                  }
                                : wishlistItem,
                            ),
                          )
                        }
                      />
                    </View>
                    <View style={styles.nameHolder}>
                      <Text
                        style={[
                          styles.orderTitle,
                          { color: Colors.forgetPassword },
                        ]}
                      >
                        {(item?.product?.brand === '6557dbad301ec4f2f4266103' &&
                          'Amazon') ||
                          (item?.product?.brand ===
                            '6557dbbc301ec4f2f4266107' &&
                            'Flipkart') ||
                          (item?.product?.brand ===
                            '6557dbcc301ec4f2f426610b' &&
                            'Myntra') ||
                          (item?.product?.brand ===
                            '6557dbf9301ec4f2f426611e' &&
                            'Rollabel') ||
                          (item?.product?.brand ===
                            '6557dc10301ec4f2f4266122' &&
                            'Pack Secure') ||
                          (item?.product?.brand ===
                            '6582c8580ab82549a084894f' &&
                            'Ajio') ||
                          (item?.product?.brand ===
                            '6582c8750ab82549a0848953' &&
                            'PackPro')}{' '}
                        {item?.product?.name} {item?.product?.model}
                        {/* {item?.product?.name} {item?.product?.slug} */}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginVertical: moderateVerticalScale(5),
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => handleRemoveFromWishlist(item)}
                        >
                          <Text style={styles.deleteText}>Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleProductDetails(item?.product)}
                        >
                          <Text
                            style={[
                              styles.deleteText,
                              { color: Colors.brandColor },
                            ]}
                          >
                            View Details
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {/* <Text style={styles.orderTitle}>
                        ({item?.product?.size_inch}) INCHES
                      </Text> */}
                    </View>
                    <View style={styles.priceHolder}>
                      <Text style={styles.priceText}>
                        ₹ {item?.product?.priceList[0]?.SP}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </>
        ) : (
          <View style={styles.noLoginView}>
            <TouchableOpacity
              style={styles.buttonHolder}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonHolder}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.loginText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </WrapperContainer>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.back,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    width: '95%',
    alignSelf: 'center',
    marginTop: moderateVerticalScale(10),
    elevation: moderateScale(5),
    borderRadius: moderateScale(10),
    gap: moderateScale(15),
  },
  cartImage: {
    width: moderateScale(75),
    height: moderateScale(75),
    borderRadius: moderateScale(10),
  },
  cartImageHolder: {
    padding: moderateScale(20),
    width: '20%',
    alignItems: 'center',
  },
  orderTitle: {
    color: Colors.black,
    textTransform: 'uppercase',
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  deleteText: {
    color: Colors.red,
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  nameHolder: {
    width: '50%',
    marginTop: moderateVerticalScale(10),
    gap: moderateScale(10),
  },
  priceHolder: {
    width: '20%',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  priceText: {
    color: Colors.black,
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(14),
  },
  emptyView: {
    marginTop: '60%',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  loaderContainer1: {
    width: '90%',
    alignSelf: 'center',
    paddingBottom: moderateVerticalScale(10),
    borderRadius: moderateScale(10),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderView1: {
    position: 'absolute',
    width: '100%',
    top: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.black,
    textAlign: 'center',
    fontSize: textScale(15),
  },
  loaderContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
    width: '80%',
    top: '45%',
    padding: moderateScale(10),
    alignSelf: 'center',
    borderRadius: moderateScale(10),
  },
  loginText: {
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.white,
    fontSize: textScale(17),
  },
  noLoginView: {
    flex: 1,
    borderColor: 'red',
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateVerticalScale(10),
  },
  buttonHolder: {
    width: '90%',
    backgroundColor: Colors.brandColor,
    borderColor: Colors.brandColor,
    borderRadius: moderateScale(5),
    padding: moderateScale(10),
    height: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    fontFamily: FontFamily.Montserrat_Medium,
    textAlign: 'center',
    fontSize: textScale(14),
    color: Colors.text_grey,
    width: '100%',
    padding: moderateScale(10),
    marginTop: moderateVerticalScale(5),
  },
});
