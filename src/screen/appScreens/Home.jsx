import {
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DeviceInfo from 'react-native-device-info';
import VersionCheck from 'react-native-version-check';
import Feather from 'react-native-vector-icons/Feather';
import Colors from '../../utils/Colors';
import BottomNavigationHeader from '../../components/General/BottomNavigationHeader';
import HomeSearch from '../../components/General/HomeSearch';
import ApiService from '../../service/APIService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import HomePopularProduct from '../../components/Home/HomePopularProduct';
import { ProductRowSkeleton } from '../../components/General/Skeleton';
import WrapperContainer from '../../utils/WrapperContainer';
import { ImagePath } from '../../utils/ImagePath';
import { buildEntityNameById } from '../../utils/productFields';

const CATEGORY_META = [
  {
    name: 'Corrugated boxes',
    match: ['corrugated'],
    image: ImagePath.categoryCorrugatedBoxes,
    tone: '#F7EFE4',
  },
  {
    name: 'Paper bags',
    match: ['paper bag'],
    image: ImagePath.categoryPaperBags,
    tone: '#EAF5EE',
  },
  {
    name: 'Poly bags & mailers',
    match: ['poly'],
    image: ImagePath.categoryPolyBags,
    tone: '#EAF2FA',
  },
  {
    name: 'Tapes & sealing',
    match: ['tape', 'pack pro'],
    image: ImagePath.categoryBoppTapes,
    tone: '#FFF0E8',
  },
  {
    name: 'Labels & finishing',
    match: ['label', 'rollabel'],
    image: ImagePath.categoryChromoLabels,
    tone: '#FFF7D9',
  },
  {
    name: 'Carry bags',
    match: ['carry bag'],
    image: ImagePath.categoryCarryBags,
    tone: '#E9F8FB',
  },
  {
    name: 'Food wrapping',
    match: ['food', 'wrap'],
    image: ImagePath.categoryWrappingPapers,
    tone: '#FDECEF',
  },
];

const FILTERS = [
  { key: 'all', label: 'All products', match: [] },
  { key: 'corrugated', label: 'Corrugated boxes', match: ['corrugated'] },
  { key: 'paper', label: 'Paper bags', match: ['paper bag'] },
  { key: 'poly', label: 'Poly mailers', match: ['poly'] },
  { key: 'tapes', label: 'Tapes & labels', match: ['tape', 'label', 'rollabel'] },
  { key: 'food', label: 'Food packaging', match: ['food', 'wrap'] },
];

const PROCESS_STEPS = [
  {
    title: 'Choose the right pack',
    text: 'Browse boxes, bags, labels and tapes by daily fulfilment need.',
  },
  {
    title: 'Confirm quantity',
    text: 'Clear pack sizes and price tiers help teams buy without guesswork.',
  },
  {
    title: 'Checkout securely',
    text: 'Cart, delivery details and payment stay inside the mobile flow.',
  },
  {
    title: 'Ship pan-India',
    text: 'Manufacturer-direct supply keeps orders moving across India.',
  },
];

const getCategoryText = product => {
  const category = product?.category;
  const subCategory = product?.sub_category || product?.subCategory;
  return [
    typeof category === 'string' ? category : category?.name,
    typeof subCategory === 'string' ? subCategory : subCategory?.name,
    product?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const Home = () => {
  const navigation = useNavigation();
  const [allProducts, setAllProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [updateStoreUrl, setUpdateStoreUrl] = useState(null);
  const [brandNameById, setBrandNameById] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [cartValueChanged, setCartValueChanged] = useState(0);
  const [wishListValueChanged, setWishListValueChanged] = useState(0);
  const searchTimer = useRef(null);

  const searchProducts = useCallback(async query => {
    try {
      const response = await ApiService.HOME_PRODUCTS_SEARCH({ search: query });
      setSearchResults(response?.data || []);
    } catch (error) {
      if (__DEV__) console.log('Search failed', error?.message);
    }
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchText.trim()) {
      setSearchResults([]);
      return undefined;
    }
    searchTimer.current = setTimeout(() => searchProducts(searchText), 450);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchProducts, searchText]);

  useEffect(() => {
    getAllProducts();
  }, []);

  useEffect(() => {
    const checkHomeUpdate = async () => {
      const currentVersion = DeviceInfo.getVersion();
      const res = await VersionCheck.needUpdate({ currentVersion });
      if (res?.isNeeded) setUpdateStoreUrl(res?.storeUrl);
    };
    checkHomeUpdate().catch(error => {
      if (__DEV__) console.log('Version check failed:', error?.message);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchText('');
        setSearchResults([]);
      };
    }, []),
  );

  const getAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const [productResponse, brandResponse] = await Promise.all([
        ApiService.GET_ALL_PRODUCTS(),
        ApiService.GET_ALL_BRANDS().catch(error => {
          if (__DEV__) console.log('Error fetching Brands', error?.message);
          return null;
        }),
      ]);

      if (brandResponse?.data) {
        setBrandNameById(buildEntityNameById(brandResponse.data));
      }
      if (productResponse?.data) {
        setAllProducts(productResponse.data);
      }
    } catch (error) {
      if (__DEV__) console.log('Error fetching home catalog', error?.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const getDropdownText = useCallback(item => {
    const brand =
      typeof item?.brand === 'object'
        ? item?.brand?.name
        : brandNameById[item?.brand] || 'Prem Packaging';
    return `${brand} - ${item?.name || ''} - ${item?.model || ''}`;
  }, [brandNameById]);

  const handleSelectProduct = product => {
    navigation.navigate('ProductDetails', { item: product });
    setSearchText('');
    setSearchResults([]);
  };

  const categoryCards = useMemo(() => {
    const counts = new Map();
    allProducts.forEach(product => {
      const text = getCategoryText(product);
      CATEGORY_META.forEach(category => {
        if (category.match.some(keyword => text.includes(keyword))) {
          counts.set(category.name, (counts.get(category.name) || 0) + 1);
        }
      });
    });
    return CATEGORY_META.map(category => ({
      ...category,
      count: counts.get(category.name) || 0,
    }));
  }, [allProducts]);

  const shelfProducts = useMemo(() => {
    const scored = [...allProducts].map(product => {
      let rank = 0;
      if (product?.deal_product) rank -= 3;
      if (product?.top_product) rank -= 2;
      return { product, rank };
    });
    scored.sort((a, b) => a.rank - b.rank);
    return scored.map(entry => entry.product);
  }, [allProducts]);

  const visibleProducts = useMemo(() => {
    const filter = FILTERS.find(item => item.key === activeFilter);
    const keywords = filter?.match || [];
    const pool = keywords.length
      ? shelfProducts.filter(product => {
          const text = getCategoryText(product);
          return keywords.some(keyword => text.includes(keyword));
        })
      : shelfProducts;
    return pool.slice(0, 12);
  }, [activeFilter, shelfProducts]);

  const handleCategoryPress = category => {
    const data = allProducts.filter(product => {
      const text = getCategoryText(product);
      return category.match.some(keyword => text.includes(keyword));
    });
    navigation.navigate('CategoryDetailsTwo', {
      categories: { name: category.name },
      data,
      option: 'cat',
    });
  };

  const handleAllProducts = () => {
    navigation.navigate('CategoryDetailsTwo', {
      categories: { name: 'All products' },
      data: allProducts,
      option: 'cat',
    });
  };

  return (
    <WrapperContainer backgroundColor={Colors.white}>
      <View style={styles.main}>
        <BottomNavigationHeader
          cartValueChanged={cartValueChanged}
          wishlistValueChanged={wishListValueChanged}
        />
        <View style={styles.searchWrap}>
          <HomeSearch
            placeholder="Search for Products"
            searchText={searchText}
            setSearchText={setSearchText}
            filteredResults={searchResults}
            getDropdownText={getDropdownText}
            handleSelectProduct={handleSelectProduct}
          />
        </View>

        {updateStoreUrl && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.updateBanner}
            onPress={() => Linking.openURL(updateStoreUrl)}
          >
            <Text style={styles.updateBannerText}>
              New update available. Tap to update the app.
            </Text>
          </TouchableOpacity>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            source={ImagePath.heroPackaging}
            style={styles.hero}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Made to pack. Ready to send.</Text>
              <Text style={styles.heroTitle}>
                Better packaging starts right here.
              </Text>
              <Text style={styles.heroSub}>
                Shop boxes, bags, mailers, tapes and labels directly from the
                manufacturer.
              </Text>
              <View style={styles.heroActions}>
                <TouchableOpacity
                  activeOpacity={0.86}
                  style={styles.primaryButton}
                  onPress={handleAllProducts}
                >
                  <Text style={styles.primaryButtonText}>Shop bestsellers</Text>
                  <Feather name="arrow-right" size={moderateScale(17)} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.86}
                  style={styles.secondaryButton}
                  onPress={() => setActiveFilter('all')}
                >
                  <Text style={styles.secondaryButtonText}>Explore categories</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.heroProof}>
                {['GST invoice', 'Secure checkout', 'Pan-India delivery'].map(item => (
                  <View key={item} style={styles.proofPill}>
                    <Feather name="check" size={moderateScale(13)} color={Colors.red} />
                    <Text style={styles.proofText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.heroNote}>
              <Text style={styles.heroNoteLabel}>Authorised packaging for</Text>
              <Text style={styles.heroNoteBrand}>amazon</Text>
              <Text style={styles.heroNoteBrand}>Flipkart</Text>
              <Text style={styles.heroNoteBrand}>AJIO</Text>
            </View>
          </ImageBackground>

          <SectionHeader
            eyebrow="Find your everyday essentials"
            title="Shop top categories"
            action="View everything"
            onPress={handleAllProducts}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categoryCards.map(category => (
              <TouchableOpacity
                key={category.name}
                activeOpacity={0.86}
                style={[styles.categoryCard, { backgroundColor: category.tone }]}
                onPress={() => handleCategoryPress(category)}
              >
                <Text style={styles.categoryCount}>
                  {category.count || 'Shop'} products
                </Text>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.categoryImageWrap}>
                  <ImageBackground
                    source={category.image}
                    resizeMode="contain"
                    style={styles.categoryImage}
                  />
                </View>
                <View style={styles.categoryArrow}>
                  <Feather name="arrow-right" size={moderateScale(16)} color={Colors.brandColor} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <SectionHeader
            eyebrow="Customer favourites"
            title="Packaging people keep coming back for"
            subtitle={
              activeFilter === 'all'
                ? 'Useful sizes, honest prices and no catalogue confusion.'
                : `Showing ${visibleProducts.length} filtered products`
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map(filter => {
              const active = activeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  activeOpacity={0.82}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.productShelf}>
            {loadingProducts ? (
              <ProductRowSkeleton />
            ) : (
              <HomePopularProduct
                data={visibleProducts}
                brandNameById={brandNameById}
                cartValueChanged={cartValueChanged}
                wishlistValueChanged={wishListValueChanged}
                setCartValueChanged={setCartValueChanged}
                setWishListValueChanged={setWishListValueChanged}
              />
            )}
          </View>

          <View style={styles.processSection}>
            <Text style={styles.eyebrow}>How orders move</Text>
            <Text style={styles.sectionTitle}>From product choice to dispatch</Text>
            {PROCESS_STEPS.map((step, index) => (
              <View key={step.title} style={styles.processStep}>
                <Text style={styles.processNumber}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <View style={styles.processBody}>
                  <Text style={styles.processTitle}>{step.title}</Text>
                  <Text style={styles.processText}>{step.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.customSection}>
            <ImageBackground
              source={ImagePath.customBox}
              style={styles.customVisual}
              imageStyle={styles.customImage}
            >
              <View style={styles.customFloat}>
                <Text style={styles.customFloatTitle}>Made for your brand</Text>
                <Text style={styles.customFloatText}>Size / Print / Material</Text>
              </View>
            </ImageBackground>
            <View style={styles.customCopy}>
              <Text style={styles.eyebrow}>Make it unmistakably yours</Text>
              <Text style={styles.sectionTitle}>
                Need packaging with your name on it?
              </Text>
              <Text style={styles.sectionBody}>
                From box size to print, finish and material, our packaging team
                can help turn your idea into a production-ready pack.
              </Text>
              {[
                'Expert structural guidance',
                'Multi-format packaging support',
                'Clear quotation and sampling',
              ].map(item => (
                <View key={item} style={styles.checkRow}>
                  <Feather name="check" size={moderateScale(16)} color={Colors.red} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
              <TouchableOpacity
                activeOpacity={0.86}
                style={[styles.primaryButton, styles.customButton]}
                onPress={() => navigation.navigate('Custom Form')}
              >
                <Text style={styles.primaryButtonText}>Start a custom project</Text>
                <Feather name="arrow-right" size={moderateScale(17)} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.testimonialSection}>
            <Text style={styles.eyebrow}>Loved by growing brands</Text>
            <Text style={styles.quote}>
              "Prem's innovative e-commerce packaging has enhanced both the
              durability and presentation of our products."
            </Text>
            <Text style={styles.quoteBy}>Fruitri</Text>
            <Text style={styles.quoteRole}>Long-term packaging partner</Text>
            <View style={styles.proofBlock}>
              <Text style={styles.proofTitle}>Since 1977</Text>
              <Text style={styles.proofBody}>
                Decades of manufacturing knowledge behind every order.
              </Text>
            </View>
            <View style={styles.proofBlock}>
              <Text style={styles.proofTitle}>One direct source</Text>
              <Text style={styles.proofBody}>
                Boxes, bags, labels, tapes and more under one roof.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </WrapperContainer>
  );
};

const SectionHeader = ({ eyebrow, title, subtitle, action, onPress }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderCopy}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {!!action && (
      <TouchableOpacity activeOpacity={0.8} style={styles.sectionAction} onPress={onPress}>
        <Text style={styles.sectionActionText}>{action}</Text>
        <Feather name="arrow-right" size={moderateScale(15)} color={Colors.brandColor} />
      </TouchableOpacity>
    )}
  </View>
);

export default Home;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FBFBFA',
  },
  searchWrap: {
    backgroundColor: Colors.white,
    paddingBottom: moderateVerticalScale(10),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(96),
  },
  hero: {
    minHeight: moderateVerticalScale(470),
    justifyContent: 'space-between',
    padding: moderateScale(20),
    overflow: 'hidden',
  },
  heroImage: {
    opacity: 0.88,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.54)',
  },
  heroCopy: {
    position: 'relative',
    zIndex: 1,
    paddingTop: moderateVerticalScale(18),
  },
  eyebrow: {
    color: Colors.red,
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(11),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: moderateVerticalScale(8),
  },
  heroTitle: {
    color: '#0B1D3E',
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(34),
    lineHeight: textScale(40),
    maxWidth: moderateScale(310),
  },
  heroSub: {
    color: '#475467',
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(14),
    lineHeight: textScale(21),
    marginTop: moderateVerticalScale(12),
    maxWidth: moderateScale(310),
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: moderateScale(10),
    marginTop: moderateVerticalScale(18),
  },
  primaryButton: {
    minHeight: moderateVerticalScale(46),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.brandColor,
    paddingHorizontal: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  primaryButtonText: {
    color: Colors.white,
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(13),
  },
  secondaryButton: {
    minHeight: moderateVerticalScale(46),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: 'rgba(20,37,76,0.22)',
    paddingHorizontal: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  secondaryButtonText: {
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(13),
  },
  heroProof: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(8),
    marginTop: moderateVerticalScale(16),
  },
  proofPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(5),
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: moderateScale(999),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateVerticalScale(6),
  },
  proofText: {
    color: '#344054',
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(11),
  },
  heroNote: {
    position: 'relative',
    zIndex: 1,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: moderateScale(8),
  },
  heroNoteLabel: {
    width: '100%',
    color: '#667085',
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(10),
    textTransform: 'uppercase',
  },
  heroNoteBrand: {
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(14),
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
  sectionHeader: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateVerticalScale(28),
    paddingBottom: moderateVerticalScale(8),
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: moderateScale(12),
  },
  sectionHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    color: '#0B1D3E',
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(22),
    lineHeight: textScale(28),
  },
  sectionSubtitle: {
    color: '#667085',
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(12),
    lineHeight: textScale(18),
    marginTop: moderateVerticalScale(6),
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    paddingTop: moderateVerticalScale(24),
  },
  sectionActionText: {
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(11),
  },
  categoryRow: {
    paddingLeft: moderateScale(20),
    paddingRight: moderateScale(8),
    paddingVertical: moderateVerticalScale(10),
  },
  categoryCard: {
    width: moderateScale(168),
    minHeight: moderateVerticalScale(202),
    borderRadius: moderateScale(12),
    marginRight: moderateScale(12),
    padding: moderateScale(14),
    overflow: 'hidden',
  },
  categoryCount: {
    color: '#667085',
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(10),
    textTransform: 'uppercase',
  },
  categoryName: {
    color: '#0B1D3E',
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(17),
    lineHeight: textScale(22),
    marginTop: moderateVerticalScale(7),
  },
  categoryImageWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: moderateVerticalScale(98),
  },
  categoryArrow: {
    position: 'absolute',
    right: moderateScale(12),
    bottom: moderateScale(12),
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateVerticalScale(10),
    gap: moderateScale(8),
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(999),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateVerticalScale(9),
  },
  filterChipActive: {
    borderColor: Colors.brandColor,
    backgroundColor: Colors.brandColor,
  },
  filterChipText: {
    color: '#344054',
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(11),
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  productShelf: {
    minHeight: moderateVerticalScale(220),
  },
  processSection: {
    marginTop: moderateVerticalScale(28),
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateVerticalScale(28),
    backgroundColor: '#F7F3EB',
  },
  processStep: {
    flexDirection: 'row',
    paddingVertical: moderateVerticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20,37,76,0.12)',
    gap: moderateScale(14),
  },
  processNumber: {
    color: Colors.red,
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(18),
    minWidth: moderateScale(34),
  },
  processBody: {
    flex: 1,
    minWidth: 0,
  },
  processTitle: {
    color: '#0B1D3E',
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(15),
  },
  processText: {
    color: '#667085',
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(12),
    lineHeight: textScale(18),
    marginTop: moderateVerticalScale(4),
  },
  customSection: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateVerticalScale(30),
    gap: moderateVerticalScale(18),
  },
  customVisual: {
    height: moderateVerticalScale(250),
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: moderateScale(18),
  },
  customImage: {
    borderRadius: moderateScale(18),
  },
  customFloat: {
    alignSelf: 'flex-start',
    margin: moderateScale(14),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateVerticalScale(9),
  },
  customFloatTitle: {
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(12),
  },
  customFloatText: {
    color: '#667085',
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(10),
    marginTop: moderateVerticalScale(2),
  },
  customCopy: {
    gap: moderateVerticalScale(10),
  },
  sectionBody: {
    color: '#667085',
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(13),
    lineHeight: textScale(20),
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  checkText: {
    color: '#344054',
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(12),
  },
  customButton: {
    alignSelf: 'flex-start',
    marginTop: moderateVerticalScale(6),
  },
  testimonialSection: {
    marginHorizontal: moderateScale(20),
    paddingTop: moderateVerticalScale(24),
    paddingBottom: moderateVerticalScale(10),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quote: {
    color: '#0B1D3E',
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(20),
    lineHeight: textScale(28),
  },
  quoteBy: {
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(13),
    marginTop: moderateVerticalScale(14),
  },
  quoteRole: {
    color: '#667085',
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(11),
    marginTop: moderateVerticalScale(3),
  },
  proofBlock: {
    paddingVertical: moderateVerticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  proofTitle: {
    color: '#0B1D3E',
    fontFamily: FontFamily.Montserrat_ExtraBold,
    fontSize: textScale(14),
  },
  proofBody: {
    color: '#667085',
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(12),
    lineHeight: textScale(18),
    marginTop: moderateVerticalScale(4),
  },
});
