import { StyleSheet, Text, View } from 'react-native';
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import Colors from '../../utils/Colors';
import Header from '../General/Header';
import PopularProducts from './popularProducts';
import FontFamily from '../../utils/FontFamily';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import HomeSearch from '../General/HomeSearch';
import ApiService from '../../service/APIService';
import debounce from 'lodash.debounce';
import { useNavigation } from '@react-navigation/native';
import WrapperContainer from '../../utils/WrapperContainer';
import {
  buildEntityNameById,
  getProductBrandName,
} from '../../utils/productFields';
import { getPrimaryPriceTier } from '../../utils/productCatalog';

const PAGE_SIZE = 20;

const CategoryDetailsTwo = ({ route }) => {
  const navigation = useNavigation();
  const { categories, data, option, serverFilter } = route.params;

  // When a serverFilter (category/brand ids) is supplied we page the catalog
  // server-side via /product/filter instead of relying on the full client list
  // handed over in nav params. The nav `data` still seeds the first paint so
  // there's no blank flash while page 1 loads.
  const canPaginate = Boolean(
    serverFilter &&
      (serverFilter.category || serverFilter.brand || serverFilter.subcategory),
  );

  const [products, setProducts] = useState(route.params.data || []);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(canPaginate);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [brandNameById, setBrandNameById] = useState({});

  // Ajio gate resolved by brand name (from nav params or the fetched id->name
  // map), so no brand ObjectId is hardcoded.
  const isAjioBrand =
    (categories?.name || brandNameById[categories?.brandId] || '')
      .toString()
      .trim()
      .toLowerCase() === 'ajio';

  const [activeFilters, setActiveFilters] = useState({
    sort: null,
    size: { length: 0, width: 0, height: 0 },
    categories: [],
    brands: [],
  });

  const fetchPage = useCallback(
    async (reset = false) => {
      if (!canPaginate || loadingRef.current) return;
      loadingRef.current = true;
      setLoadingMore(true);
      const nextSkip = reset ? 0 : skip;
      try {
        const response = await ApiService.FILTER_PRODUCTS({
          ...serverFilter,
          skip: nextSkip,
          limit: PAGE_SIZE,
          includeMeta: true,
        });
        const page = response?.data || [];
        setProducts(prev => (reset ? page : [...prev, ...page]));
        setSkip(nextSkip + page.length);
        setHasMore(response?.meta?.hasMore ?? page.length === PAGE_SIZE);
      } catch (error) {
        console.log('Error fetching filtered products', error?.message);
        // Keep whatever we already have (the nav-param seed) and stop paging.
        setHasMore(false);
      } finally {
        loadingRef.current = false;
        setLoadingMore(false);
      }
    },
    [canPaginate, serverFilter, skip],
  );

  // Initial server page (only when we can paginate). Runs once on mount.
  useEffect(() => {
    if (canPaginate) {
      fetchPage(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(() => {
    if (canPaginate && hasMore && !loadingRef.current) {
      fetchPage(false);
    }
  }, [canPaginate, hasMore, fetchPage]);

  // ─── Client-side sort / size / category / brand filters ───────────────
  // Applied to the currently-loaded set (server-paged or nav-seeded).
  const filterBySize = (dataToFilter, { length, width, height }) => {
    const parseSize = sizeString => {
      if (!sizeString) return { length: 0, width: 0, height: 0 };
      const sizes = sizeString.split('x').map(Number);
      return {
        length: sizes[0] || 0,
        width: sizes[1] || 0,
        height: sizes[2] || 0,
      };
    };

    return dataToFilter.filter(product => {
      const productSize = parseSize(product.size_inch);
      return (
        (length === 0 || productSize.length <= length) &&
        (width === 0 || productSize.width <= width) &&
        (height === 0 || productSize.height <= height)
      );
    });
  };

  const sortData = (dataToSort, sortOption) => {
    const sortedArray = [...dataToSort];
    switch (sortOption) {
      case 'highToLow':
        sortedArray.sort(
          (a, b) => getPrimaryPriceTier(b).SP - getPrimaryPriceTier(a).SP,
        );
        break;
      case 'lowToHigh':
        sortedArray.sort(
          (a, b) => getPrimaryPriceTier(a).SP - getPrimaryPriceTier(b).SP,
        );
        break;
      default:
        break;
    }
    return sortedArray;
  };

  const filterByValues = (dataToFilter, selectedValues) => {
    return dataToFilter.filter(product =>
      Object.values(product).some(value => {
        if (Array.isArray(value)) {
          return value.some(val => selectedValues.includes(val));
        }
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(val => selectedValues.includes(val));
        }
        return selectedValues.includes(value);
      }),
    );
  };

  const filteredData = useMemo(() => {
    let result = [...products];

    if (
      activeFilters.size.length > 0 ||
      activeFilters.size.width > 0 ||
      activeFilters.size.height > 0
    ) {
      result = filterBySize(result, activeFilters.size);
    }
    if (activeFilters.categories.length > 0) {
      result = filterByValues(result, activeFilters.categories);
    }
    if (activeFilters.brands.length > 0) {
      result = filterByValues(result, activeFilters.brands);
    }
    if (activeFilters.sort) {
      result = sortData(result, activeFilters.sort);
    }
    return result;
  }, [products, activeFilters]);

  const handleFilterBySize = (length, width, height) => {
    setActiveFilters(prev => ({ ...prev, size: { length, width, height } }));
  };
  const handleSort = sortOption => {
    setActiveFilters(prev => ({ ...prev, sort: sortOption }));
  };
  const handleFilterByCategory = selectedCategories => {
    setActiveFilters(prev => ({ ...prev, categories: selectedCategories }));
  };
  const handleFilterByBrand = selectedBrandIds => {
    setActiveFilters(prev => ({ ...prev, brands: selectedBrandIds }));
  };

  const renderBrandMessage = () => {
    if (isAjioBrand) {
      return (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text
            style={{
              fontFamily: FontFamily.Montserrat_Bold,
              fontSize: textScale(15),
              color: '#3a5ba2',
              textAlign: 'center',
              width: '90%',
              alignSelf: 'center',
            }}
          >
            We are authorized manufacturers of Ajio polybags. For further
            purchases, please contact through the official Reliance channel.
          </Text>
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    const getAllBrands = async () => {
      try {
        const response = await ApiService.GET_ALL_BRANDS();
        if (response?.data) {
          setBrandNameById(buildEntityNameById(response.data));
        }
      } catch (error) {
        console.log('Error fetching Brands', error?.message);
      }
    };

    getAllBrands();
  }, []);

  const getDropdownText = item => {
    const brandName =
      getProductBrandName(item, brandNameById) || 'Unknown Brand';
    return `${brandName} - ${item.name} - ${item.model}`;
  };
  const filteredResults = searchResults;

  const searchProducts = useCallback(async query => {
    const payload = { search: query };
    try {
      const response = await ApiService.HOME_PRODUCTS_SEARCH(payload);
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

  return (
    <WrapperContainer
      backgroundColor={Colors.white}
      statusBarStyle={'dark-content'}
    >
      <View style={styles.main}>
        <Header
          title={
            categories?.name
              ? categories.name.charAt(0).toUpperCase() +
                categories.name.slice(1)
              : ''
          }
          onSort={handleSort}
          onFilterBySize={handleFilterBySize}
          option={option}
          onFilterByCategory={handleFilterByCategory}
          onFilterByBrand={handleFilterByBrand}
          categories={categories}
          filteredData={filteredData}
          originalData={products}
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
        {isAjioBrand ? (
          renderBrandMessage()
        ) : (
          <View style={styles.productHolder}>
            {filteredData?.length > 0 ? (
              <PopularProducts
                data={filteredData}
                brandNameById={brandNameById}
                onEndReached={loadMore}
                loadingMore={loadingMore}
              />
            ) : (
              <View style={styles.noProductContainer}>
                <Text style={styles.nameText}>No Products Found</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </WrapperContainer>
  );
};

export default CategoryDetailsTwo;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  productHolder: {
    backgroundColor: Colors.back,
    width: '100%',
    flex: 1,
  },
  noProductContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: textScale(18),
    color: Colors.black,
    textAlign: 'center',
  },
});
