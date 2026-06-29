import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DeviceInfo from 'react-native-device-info';
import VersionCheck from 'react-native-version-check';
import Colors from '../../utils/Colors';
import BottomNavigationHeader from '../../components/General/BottomNavigationHeader';
import HomeSearch from '../../components/General/HomeSearch';
import { brandData } from '../../assets/data/brands';
import ApiService from '../../service/APIService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LoginPopup from '../../components/General/loginPopup';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import _ from 'lodash';
import PopularProducts from '../../components/Home/popularProducts';
import { ImagePath } from '../../utils/ImagePath';
import FastImage from 'react-native-fast-image';
import LoaderModal from '../../components/General/LoaderModal';
import debounce from 'lodash.debounce';
import TestimonialContainer from '../../components/Home/TestimonialContainer';
import YtVideo from '../../components/Home/YtVideo';
import Description from '../../components/Home/Description';
import CustomButton from '../../components/General/CustomButton';
import CustomPackagingButton from '../../components/Home/CustomPackagingButton';
import HomePopularProduct from '../../components/Home/HomePopularProduct';
import WrapperContainer from '../../utils/WrapperContainer';
import StorageService from '../../utils/storageService';
import { parseStoredUser } from '../../utils/HelperFunction';
import {
  getProductBrandId,
  getProductCategoryId,
} from '../../utils/productFields';

const Home = () => {
  const navigation = useNavigation();
  const [allProducts, setAllProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [cartValueChanged, setCartValueChanged] = useState(0);
  const [wishListValueChanged, setWishListValueChanged] = useState(0);
  const placeholderImage = 'https://prempackaging.com/img/logo.png';
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dealProduct, setDealProduct] = useState([]);
  const [updateStoreUrl, setUpdateStoreUrl] = useState(null);

  const mapBrandName = brandId => {
    switch (brandId) {
      case '6926d6bad53f3a772c6e978c':
        return 'Flipkart';
      case '6557dbcc301ec4f2f426610b':
        return 'Myntra';
      case '69268af9d53f3a772c6bccc2':
        return 'Amazon';
      case '6582c8580ab82549a084894f':
        return 'Ajio';
      case '6557dbf9301ec4f2f426611e':
        return 'Rollabel';
      case '6557dc10301ec4f2f4266122':
        return 'Pack-Secure';
      case '6582c8750ab82549a0848953':
        return 'PackPro';
      default:
        return 'Unknown Brand';
    }
  };

  const searchProducts = useCallback(async query => {
    const data = { search: query };
    try {
      const response = await ApiService.HOME_PRODUCTS_SEARCH(data);
      console.log(response, 'Line 23');
      setSearchResults(response?.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleSearch = useMemo(
    () =>
      debounce(text => {
        if (text.length > 0) {
          searchProducts(text);
        } else {
          setSearchResults([]);
        }
      }, 500),
    [searchProducts],
  );

  useEffect(() => {
    handleSearch(searchText);
    return () => handleSearch.cancel();
  }, [searchText, handleSearch]);

  const handleSelectProduct = product => {
    navigation.navigate('ProductDetails', { item: product });
    setSearchText('');
    setSearchResults([]);
  };

  const getDropdownText = item => {
    const brandName = mapBrandName(item.brand);
    return `${brandName} - ${item.name} - ${item.model}`;
  };

  const filteredResults = searchResults.filter(item => {
    const dropdownText = getDropdownText(item);
    return dropdownText.toLowerCase().includes(searchText.toLowerCase());
  });

  useEffect(() => {
    getAllProducts();
  }, []);

  useEffect(() => {
    const checkHomeUpdate = async () => {
      const currentVersion = DeviceInfo.getVersion();
      const res = await VersionCheck.needUpdate({ currentVersion });
      if (res?.isNeeded) setUpdateStoreUrl(res?.storeUrl);
    };
    checkHomeUpdate();
  }, []);

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

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchText('');
        setSearchResults([]);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, []),
  );

  const getAllProducts = async () => {
    try {
      const response = await ApiService.GET_ALL_PRODUCTS();
      if (response && response?.data) {
        const filteredPopularProducts = response.data.filter(
          item => item.top_product === true,
        );
        const dealProducts = response.data.filter(
          item => item?.deal_product === true,
        );
        setDealProduct(dealProducts);
        setAllProducts(response?.data);
        setFilteredProducts(filteredPopularProducts);
      }
    } catch (e) {
      console.log('Error fetching Products', e?.message);
    }
  };

  const handleCategoriesClicked = async list => {
    setNavigating(true);
    try {
      setTimeout(async () => {
        let filteredData = [];

        if (list.name === 'Tape') {
          const tapeCategories = [
            '6557df64301ec4f2f4266141',
            '6557df71301ec4f2f4266145',
            '6642e8f665f20fe41ab417bc',
          ];
          filteredData = allProducts.filter(item =>
            tapeCategories.includes(getProductCategoryId(item)),
          );
        } else {
          filteredData = allProducts.filter(
            item => getProductCategoryId(item) === list?.category_id,
          );
        }

        navigation.navigate('CategoryDetailsTwo', {
          categories: list,
          data: filteredData,
          option: 'cat',
        });
        setNavigating(false); // Hide loader after delay
      }, 1000); // Add 1-second delay
    } catch (error) {
      console.log('Error navigating to category', error);
      setNavigating(false); // Hide loader on error
    }
  };

  const handleBrandCLicked = async brand => {
    setNavigating(true);
    try {
      setTimeout(async () => {
        navigation.navigate('CategoryDetailsTwo', {
          categories: brand,
          data: allProducts.filter(
            item => getProductBrandId(item) === brand.brandId,
          ),
          option: 'brand',
        });
        setNavigating(false);
      }, 1000);
    } catch (error) {
      console.log('Error navigating to brand', error);
      setNavigating(false);
    }
  };

  return (
    <WrapperContainer backgroundColor={Colors.white}>
      <View style={styles.main}>
        <BottomNavigationHeader
          cartValueChanged={cartValueChanged}
          wishlistValueChanged={wishListValueChanged}
        />
        <View
          style={{
            backgroundColor: Colors.white,
            paddingBottom: moderateVerticalScale(10),
          }}
        >
          <HomeSearch
            placeholder={'Search for Products'}
            searchText={searchText}
            setSearchText={text => setSearchText(text)}
            filteredResults={filteredResults}
            getDropdownText={getDropdownText}
            handleSelectProduct={handleSelectProduct}
          />
        </View>

        {updateStoreUrl && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.updateBanner}
            onPress={() => Linking.openURL(updateStoreUrl)}>
            <Text style={styles.updateBannerText}>
              New update available! Tap to update the app.
            </Text>
          </TouchableOpacity>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: moderateVerticalScale(80) }}
          showsVerticalScrollIndicator={false}
        >
          <>
            {/* Brand */}
            <View
              style={[
                styles.shopByBrand,
                {
                  marginTop: moderateVerticalScale(15),
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <View style={styles.brandView}>
                <Text style={styles.brandText}>
                  WE ARE AUTHORIZED VENDOR FOR
                </Text>
                <ScrollView
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                  style={styles.brandHolder}
                  contentContainerStyle={styles.brandContentContainer}
                >
                  {brandData.map(brand => (
                    <TouchableOpacity
                      key={brand.id}
                      style={[
                        styles.imageHolder,
                        {
                          borderColor:
                            selectedBrand?.id === brand.id
                              ? Colors.brandColor
                              : Colors.red,
                        },
                      ]}
                      onPress={() => handleBrandCLicked(brand)}
                    >
                      <FastImage
                        style={styles.imageStyle}
                        source={{
                          uri: brand.image,
                          priority: FastImage.priority.high,
                          cache: FastImage.cacheControl.web,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View
              style={{
                backgroundColor: Colors.back,
                marginVertical: moderateVerticalScale(10),
              }}
            >
              <CustomPackagingButton />
            </View>
            {/* Popular Products */}
            <View style={styles.popularProductHolder}>
              <View style={styles.brandView}>
                <Text style={styles.brandText}>SHOP FROM TOP PRODUCTS</Text>
                <View style={styles.horizontalListWrapper}>
                  <HomePopularProduct
                    data={filteredProducts}
                    cartValueChanged={cartValueChanged}
                    wishlistValueChanged={wishListValueChanged}
                    setCartValueChanged={setCartValueChanged}
                    setWishListValueChanged={setWishListValueChanged}
                  />
                </View>
              </View>
            </View>
            <View style={styles.popularProductHolder}>
              <View style={styles.brandView}>
                <Text style={styles.brandText}>
                  BEST DEALS ON FEATURED PRODUCTS
                </Text>
                <View style={styles.horizontalListWrapper}>
                  <HomePopularProduct
                    data={dealProduct}
                    cartValueChanged={cartValueChanged}
                    wishlistValueChanged={wishListValueChanged}
                    setCartValueChanged={setCartValueChanged}
                    setWishListValueChanged={setWishListValueChanged}
                  />
                </View>
              </View>
            </View>
            <Description />
            <YtVideo />
            <TestimonialContainer />
          </>
        </ScrollView>

        {showLoginPopup && (
          <LoginPopup
            showLoginPopup={showLoginPopup}
            setShowLoginPopup={setShowLoginPopup}
          />
        )}
        <LoaderModal visible={navigating} message="Loading, please wait..." />
      </View>
    </WrapperContainer>
  );
};
export default Home;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.back,
  },
  shopByBrand: {
    padding: moderateScale(10),
    backgroundColor: Colors.back,
  },
  brandHolder: {
    marginVertical: moderateVerticalScale(5),
  },
  brandContentContainer: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateVerticalScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  brandView: {
    width: '100%',
    alignSelf: 'center',
  },
  brandText: {
    fontSize: textScale(14),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_SemiBold,
    padding: moderateScale(10),
    textAlign: 'center',
    // fontWeight: "700",
  },
  imageHolder: {
    borderWidth: moderateScale(1),
    marginHorizontal: moderateScale(6),
    borderRadius: moderateScale(8),
    borderColor: Colors.red,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    width: moderateScale(100),
    height: moderateScale(55),
    padding: moderateScale(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: '80%',
    height: '80%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
  },
  imageHolder2: {
    width: moderateScale(120),
    marginHorizontal: moderateScale(5),
    alignItems: 'center',
    gap: moderateScale(5),
  },
  imgHolder: {
    borderRadius: moderateScale(250),
    overflow: 'hidden',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(110),
    width: moderateScale(110),
  },
  imageStyle2: {
    height: moderateScale(90),
    width: moderateScale(90),
    borderRadius: moderateScale(50),
  },
  categoriesText: {
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.black,
    lineHeight: scale(20),
    textAlign: 'center',
  },
  popularProductHolder: {
    backgroundColor: Colors.back,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: moderateScale(10),
  },
  productHolder: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(15),
    alignSelf: 'center',
    // marginTop: moderateVerticalScale(10),
    justifyContent: 'center',
  },
  horizontalListWrapper: {
    width: '100%',
  },
  item: {
    padding: moderateScale(10),
    backgroundColor: Colors.white,
    elevation: moderateScale(10),
    gap: moderateScale(5),
    width: '45%',
  },
  image: {
    width: '95%',
    height: moderateScale(140),
  },
  loaderText: {
    fontSize: textScale(16),
    color: Colors.brandColor,
    textAlign: 'center',
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  loaderContainer: {
    gap: moderateScale(30),
    width: '90%',
    alignSelf: 'center',
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    borderColor: Colors.brandColor,
    backgroundColor: Colors.back,
    paddingTop: moderateVerticalScale(30),
  },
  updateBanner: {
    backgroundColor: Colors.brandColor,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
  },
  updateBannerText: {
    color: Colors.white,
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
});
