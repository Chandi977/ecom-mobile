import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

const CategoryDetailsTwo = ({ route }) => {
  const navigation = useNavigation();
  const [originalData] = useState(route.params.data);
  const [filteredData, setFilteredData] = useState(route.params.data);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { categories, data, option } = route.params;
  console.log(data, 'line 24');
  const [activeFilters, setActiveFilters] = useState({
    sort: null,
    size: { length: 0, width: 0, height: 0 },
    categories: [],
    brands: [],
  });

  const applyAllFilters = useCallback(() => {
    let result = [...originalData];

    // Apply size filter first
    if (
      activeFilters.size.length > 0 ||
      activeFilters.size.width > 0 ||
      activeFilters.size.height > 0
    ) {
      result = filterBySize(result, activeFilters.size);
    }

    // Apply category filter
    if (activeFilters.categories.length > 0) {
      result = filterByCategory(result, activeFilters.categories);
    }

    // Apply brand filter
    if (activeFilters.brands.length > 0) {
      result = filterByBrand(result, activeFilters.brands);
    }

    // Apply sort last
    if (activeFilters.sort) {
      result = sortData(result, activeFilters.sort);
    }

    setFilteredData(result);
  }, [originalData, activeFilters]);

  useEffect(() => {
    applyAllFilters();
  }, [applyAllFilters]);

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

  const handleFilterBySize = (length, width, height) => {
    setActiveFilters(prev => ({
      ...prev,
      size: { length, width, height },
    }));
  };

  const sortData = (dataToSort, option) => {
    let sortedArray = [...dataToSort];

    switch (option) {
      case 'highToLow':
        sortedArray.sort((a, b) => b.priceList[0]?.SP - a.priceList[0]?.SP);
        break;
      case 'lowToHigh':
        sortedArray.sort((a, b) => a.priceList[0]?.SP - b.priceList[0]?.SP);
        break;
      default:
        // No sorting
        break;
    }
    return sortedArray;
  };

  const handleSort = option => {
    setActiveFilters(prev => ({
      ...prev,
      sort: option,
    }));
  };

  const filterByCategory = (dataToFilter, selectedCategories) => {
    return dataToFilter.filter(product => {
      return Object.values(product).some(value => {
        if (Array.isArray(value)) {
          return value.some(val => selectedCategories.includes(val));
        } else if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(val =>
            selectedCategories.includes(val),
          );
        } else {
          return selectedCategories.includes(value);
        }
      });
    });
  };

  const handleFilterByCategory = selectedCategories => {
    setActiveFilters(prev => ({
      ...prev,
      categories: selectedCategories,
    }));
  };

  const filterByBrand = (dataToFilter, selectedBrandIds) => {
    return dataToFilter.filter(product => {
      return Object.values(product).some(value => {
        if (Array.isArray(value)) {
          return value.some(val => selectedBrandIds.includes(val));
        } else if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(val =>
            selectedBrandIds.includes(val),
          );
        } else {
          return selectedBrandIds.includes(value);
        }
      });
    });
  };

  const handleFilterByBrand = selectedBrandIds => {
    setActiveFilters(prev => ({
      ...prev,
      brands: selectedBrandIds,
    }));
  };

  const renderBrandMessage = () => {
    if (categories?.brandId === '6582c8580ab82549a084894f') {
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

  const mapBrandName = brandId => {
    switch (brandId) {
      case '6557dbbc301ec4f2f4266107':
        return 'Flipkart';
      case '6557dbcc301ec4f2f426610b':
        return 'Myntra';
      case '6557dbad301ec4f2f4266103':
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

  const getDropdownText = item => {
    const brandName = mapBrandName(item.brand);
    return `${brandName} - ${item.name} - ${item.model}`;
  };
  const filteredResults = searchResults.filter(item => {
    const dropdownText = getDropdownText(item);
    return dropdownText.toLowerCase().includes(searchText.toLowerCase());
  });

  const searchProducts = useCallback(async query => {
    const data = { search: query };
    try {
      const response = await ApiService.HOME_PRODUCTS_SEARCH(data);
      // console.log(response, "Line 23");
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
    <WrapperContainer backgroundColor={Colors.white} statusBarStyle={"dark-content"}>
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
          originalData={originalData}
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
        {categories?.brandId === '6582c8580ab82549a084894f' ? (
          renderBrandMessage()
        ) : (
          <View style={styles.productHolder}>
            {filteredData?.length > 0 ? (
              <PopularProducts data={filteredData} />
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(15),
    alignSelf: 'center',
    justifyContent: 'center',
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
