import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../utils/Colors";
import CustomSlider from "./CustomSlider";
import CustomButton from "./CustomButton";
import Data from "../../assets/data/Categories.json";
import { CheckBox } from "@rneui/themed";
import { brandData } from "../../assets/data/brands";
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";
import {
  getProductBrandId,
  getProductCategoryId,
  getProductSubCategoryId,
} from "../../utils/productFields";
const Header = ({
  title,
  onSort,
  onFilterBySize,
  onFilterByCategory,
  onFilterByBrand,
  option,
  categories,
  filteredData,
  originalData = [],
}) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [flattenedCategories, setFlattenedCategories] = useState([]);
  console.log(selectedSubCategory, "line 48");

  const getSubCategoriesForBrandFilter = () => {
    const subCategoriesToShow = [];

    // Use originalData instead of filteredData to always show all options
    const hasBoppTape = originalData.some(
      (product) => getProductCategoryId(product) === "6557df64301ec4f2f4266141"
    );
    const hasPaperTape = originalData.some(
      (product) => getProductCategoryId(product) === "6557df71301ec4f2f4266145"
    );
    const hasCarryHandleTape = originalData.some(
      (product) => getProductCategoryId(product) === "67cac1fc2a4e1c9ef44a92b5"
    );
    const hasDirectThermal = originalData.some(
      (product) =>
        getProductSubCategoryId(product) === "6557e1cb301ec4f2f426614c"
    );
    const hasChromoLabel = originalData.some(
      (product) =>
        getProductSubCategoryId(product) === "6557e236301ec4f2f4266154"
    );

    if (hasBoppTape) {
      subCategoriesToShow.push({
        id: 1,
        name: "BOPP TAPE",
        category_id: "6557df64301ec4f2f4266141",
      });
    }
    if (hasPaperTape) {
      subCategoriesToShow.push({
        id: 2,
        name: "PAPER TAPE",
        category_id: "6557df71301ec4f2f4266145",
      });
    }
    if (hasCarryHandleTape) {
      subCategoriesToShow.push({
        id: 2,
        name: "CARRY HANDLE TAPE",
        category_id: "67cac1fc2a4e1c9ef44a92b5",
      });
    }
    if (hasDirectThermal) {
      subCategoriesToShow.push({
        id: 3,
        name: "DIRECT THERMAL LABEL",
        category_id: "6557e1cb301ec4f2f426614c",
      });
    }
    if (hasChromoLabel) {
      subCategoriesToShow.push({
        id: 4,
        name: "CHROMO LABEL",
        category_id: "6557e236301ec4f2f4266154",
      });
    }

    return subCategoriesToShow;
  };

  const subCategoriesForBrandFilter = getSubCategoriesForBrandFilter();
  console.log(subCategoriesForBrandFilter, "line 109");

  const availableBrandIds = React.useMemo(() => {
    const brandIds = new Set();
    originalData?.forEach((product) => {
      const brandId = getProductBrandId(product);
      if (brandId) {
        brandIds.add(brandId);
      }
    });
    return Array.from(brandIds);
  }, [originalData]);

  
  useEffect(() => {
    const categoriesSet = new Set();
    originalData?.forEach((product) => {
      const categoryId = getProductCategoryId(product);
      if (categoryId) {
        categoriesSet.add(categoryId);
      }
    });
    setAvailableCategories(Array.from(categoriesSet));

    // Generate flattened categories structure
    const flattened = [];
    Data.forEach((category) => {
      if (category.subMenu) {
        category.subMenu.forEach((subCategory) => {
          if (subCategory.subMenu) {
            subCategory.subMenu.forEach((item) => {
              if (categoriesSet.has(item.category_id)) {
                flattened.push({
                  id: item.id,
                  name: `${subCategory.name} > ${item.name}`,
                  category_id: item.category_id,
                });
              }
            });
          } else if (categoriesSet.has(subCategory.category_id)) {
            flattened.push({
              id: subCategory.id,
              name: subCategory.name,
              category_id: subCategory.category_id,
            });
          }
        });
      } else if (categoriesSet.has(category.category_id)) {
        flattened.push({
          id: category.id,
          name: category.name,
          category_id: category.category_id,
        });
      }
    });
    setFlattenedCategories(flattened);
  }, [originalData]);

  const toggleCategorySelection = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredBrandData = React.useMemo(() => {
    return brandData.filter((brand) =>
      availableBrandIds.includes(brand.brandId)
    );
  }, [availableBrandIds]);

  const handleApplyFilter = () => {
    // console.log(selectedCategories, "Line 60");
    onFilterByCategory(selectedCategories);
    setFilterModalVisible(false);
  };

  const resetFilter2 = () => {
    setLength(0);
    setWidth(0);
    setHeight(0);
    setSelectedCategories([]);
    onFilterBySize(0, 0, 0);
    onFilterByCategory([]);
    setFilterModalVisible(false);
  };

  const handleSortOption = (option) => {
    onSort(option);
    setModalVisible(false);
  };

  const toggleBrandSelection = (brandId) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter((id) => id !== brandId));
    } else {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };

  const toggleSubCategorySelection = (subCatId) => {
    if (selectedSubCategory.includes(subCatId)) {
      setSelectedSubCategory(
        selectedSubCategory.filter((id) => id !== subCatId)
      );
    } else {
      setSelectedSubCategory([...selectedSubCategory, subCatId]);
    }
  };

  const handleApplyBrandFilter = () => {
    const combinedArray = [...selectedBrands, ...selectedSubCategory];
    console.log(combinedArray.length, "line 226");
    if (combinedArray.length > 0) {
      onFilterByBrand(combinedArray);
    } else if (combinedArray.length === 0) {
      resetBrandFilter()
    } else {
      onFilterBySize(length, width, height);
    }
    setFilterModalVisible(false);
  };

  const resetBrandFilter = () => {
    setSelectedBrands([]);
    setSelectedSubCategory([]);
    setLength(0);
    setWidth(0);
    setHeight(0);
    onFilterByBrand([]);
    onFilterBySize(0, 0, 0); // Reset size filters as well
    setFilterModalVisible(false);
  };

  return (
    <View style={styles.main}>
      <TouchableOpacity
        style={styles.iconHolder}
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name="arrow-back-outline"
          size={moderateScale(30)}
          color={Colors.black}
        />
      </TouchableOpacity>
      <View style={styles.headerTextHolder}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={styles.iconHolder2}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons
            name="swap-vertical"
            size={moderateScale(30)}
            color={Colors.red}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter" size={moderateScale(30)} color={Colors.red} />
        </TouchableOpacity>
      </View>

      {/* Modal for sorting options */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <Pressable
              style={styles.option}
              onPress={() => handleSortOption("default")}
            >
              <Text style={styles.optionText}>Default Sorting</Text>
            </Pressable>
            <Pressable
              style={styles.option}
              onPress={() => handleSortOption("highToLow")}
            >
              <Text style={styles.optionText}>Price: High to Low</Text>
            </Pressable>
            <Pressable
              style={styles.option}
              onPress={() => handleSortOption("lowToHigh")}
            >
              <Text style={styles.optionText}>Price: Low to High</Text>
            </Pressable>
            <Pressable
              style={[styles.option, { backgroundColor: Colors.red }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.optionText, { color: Colors.white }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Modal for Filter */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={{ backgroundColor: Colors.white }} />
          <StatusBar barStyle={"dark-content"} backgroundColor={Colors.white} />
          <ScrollView
            style={{ width: "100%", flex: 1, backgroundColor: "white" }}
          >
            <View style={styles.headerHolder}>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons
                  name="arrow-back"
                  size={textScale(30)}
                  color={Colors.black}
                />
              </TouchableOpacity>

              <View style={styles.headerView}>
                <Text style={styles.modalTitle}>Filter By</Text>
              </View>
            </View>

            {option === "cat" && (
              <View style={styles.lowerView}>
                <Text style={styles.label}>Filter by Size</Text>
                <CustomSlider
                  name={"Length"}
                  minValue={0}
                  maxValue={20}
                  value={length}
                  onValueChange={setLength}
                />
                <CustomSlider
                  name="Width"
                  minValue={0}
                  maxValue={20}
                  value={width}
                  onValueChange={setWidth}
                />
                <CustomSlider
                  name="Height"
                  minValue={0}
                  maxValue={20}
                  value={height}
                  onValueChange={setHeight}
                />
              </View>
            )}
            {option === "brand" && flattenedCategories.length > 0 && (
              <View style={styles.lowerView}>
                <Text style={styles.label}>Filter by Category</Text>
                {flattenedCategories.map((item) => {
                  const isChecked = selectedCategories.includes(
                    item.category_id
                  );
                  return (
                    <View key={item.id} style={styles.contentContainer}>
                      <CheckBox
                        center
                        title={item.name}
                        checked={isChecked}
                        onPress={() =>
                          toggleCategorySelection(item.category_id)
                        }
                      />
                    </View>
                  );
                })}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                  }}
                >
                  <CustomButton
                    name={"Apply"}
                    handleAction={handleApplyFilter}
                  />
                  <CustomButton name={"Reset"} handleAction={resetFilter2} />
                </View>
              </View>
            )}
            {option === "cat" &&
              (filteredBrandData.length > 0 ||
                subCategoriesForBrandFilter.length > 0) && (
                <View style={styles.lowerView}>
                  {filteredBrandData.length > 0 && (
                    <>
                      <Text style={styles.label}>Filter by Brand</Text>
                      {filteredBrandData.map((item, index) => {
                        {
                          /* console.log(item, "line 426"); */
                        }
                        const isChecked = selectedBrands.includes(item.brandId);
                        return (
                          <View key={index} style={styles.contentContainer}>
                            <CheckBox
                              center
                              title={
                                item?.name.charAt(0).toUpperCase() +
                                item?.name.slice(1)
                              }
                              checked={isChecked}
                              onPress={() => toggleBrandSelection(item.brandId)}
                            />
                          </View>
                        );
                      })}
                    </>
                  )}
                  {subCategoriesForBrandFilter.length > 0 && (
                    <>
                      <Text style={styles.label}>Filter by Sub-Category</Text>
                      {subCategoriesForBrandFilter.map((item, index) => {
                        console.log(item, "line 450");
                        const isChecked = selectedSubCategory.includes(
                          item.category_id
                        );
                        return (
                          <View key={index} style={styles.contentContainer}>
                            <CheckBox
                              center
                              title={item.name}
                              checked={isChecked}
                              onPress={() =>
                                toggleSubCategorySelection(item.category_id)
                              }
                            />
                          </View>
                        );
                      })}
                    </>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <CustomButton
                      name={"Apply"}
                      handleAction={handleApplyBrandFilter}
                    />
                    <CustomButton
                      name={"Reset"}
                      handleAction={resetBrandFilter}
                    />
                  </View>
                </View>
              )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  main: {
    backgroundColor: Colors.white,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(15),
    borderBottomColor: Colors.brandColor,
    // marginTop:moderateVerticalScale(-25)
  },
  iconHolder: {
    padding: moderateScale(10),
    alignItems: "center",
  },
  headerTextHolder: {
    width: "60%",
    alignItems: "center",
  },
  headerText: {
    fontSize: textScale(16),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_SemiBold,
    textAlign: "center",
  },
  iconHolder2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    gap: moderateScale(15),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(20),
    alignItems: "center",
    position: "absolute",
    bottom: 0,
  },
  modalTitle: {
    fontSize: textScale(18),
    fontFamily: FontFamily.Montserrat_Bold,
    marginBottom: moderateVerticalScale(10),
    color: Colors.brandColor,
  },
  option: {
    width: "100%",
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    alignItems: "center",
    backgroundColor: Colors.back,
    marginVertical: moderateVerticalScale(5),
  },
  optionText: {
    fontSize: textScale(16),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  lowerView: {
    width: "100%",
    padding: moderateScale(10),
    backgroundColor: "white",
    gap: moderateScale(10),
    alignSelf: "center",
  },
  label: {
    fontSize: textScale(16),
    color: Colors.black,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerHolder: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: moderateScale(10),
    backgroundColor: Colors.white,
  },
  headerView: {
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    color: Colors.black,
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
});
