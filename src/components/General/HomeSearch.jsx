import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Colors from "../../utils/Colors";
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";

const HomeSearch = ({
  placeholder,
  searchText,
  setSearchText,
  filteredResults,
  getDropdownText,
  handleSelectProduct,
}) => {
  return (
    <>
      <View style={styles.searchBoxHolder}>
        <MaterialIcons
          name="search"
          size={textScale(30)}
          color={Colors.searchIcon}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={Colors.border_color}
          value={searchText}
          onChangeText={setSearchText}
          keyboardType="default"
          style={styles.textInput}
        />
      </View>
      {filteredResults.length > 0 ? (
        <View style={{ maxHeight: moderateVerticalScale(150) }}>
          <FlatList
            data={filteredResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectProduct(item)}
                style={styles.itemHolder}
              >
                <Text style={styles.itemText}>{getDropdownText(item)}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        searchText.length > 0 && (
          <Text style={{ padding: 10, color: "red",fontFamily:FontFamily.Montserrat_Medium,textAlign:'center',fontSize:textScale(14) }}>No Product found</Text>
        )
      )}
    </>
  );
};

export default HomeSearch;

const styles = StyleSheet.create({
  searchBoxHolder: {
    borderWidth: moderateScale(2),
    width: "90%",
    alignSelf: "center",
    borderRadius: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    flexDirection: "row",
    alignItems: "center",
    borderColor: Colors.back,
    backgroundColor: Colors.back,
  },
  textInput: {
    height: "100%",
    width: "90%",
    paddingHorizontal: moderateScale(10),
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(16),
    color: Colors.black,
  },
  itemHolder: {
    borderWidth: 2,
    width: "85%",
    alignSelf: "center",
    marginBottom: moderateVerticalScale(5),
    backgroundColor: Colors.back,
    borderRadius: moderateScale(5),
    borderColor: Colors.back,
  },
  itemText: {
    padding: moderateScale(10),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_Regular,
    fontSize: textScale(11),
  },
});
