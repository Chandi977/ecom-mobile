import { StyleSheet, Text, TouchableOpacity, View, DeviceEventEmitter } from "react-native";
import React, { useEffect, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../utils/Colors";
import Feather from "react-native-vector-icons/Feather";
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";
import ApiService from "../../service/APIService";
import StorageService from "../../utils/storageService";
import { parseStoredUser } from "../../utils/HelperFunction";
import GuestCartService from "../../utils/GuestCartService";
const InternalHeader = ({
  title,
  heart,
  handleClearCart,
  wishlistValueChanged,
}) => {
  const navigation = useNavigation();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchCartCount();
    fetchWishListCount();
  }, [isFocused, wishlistValueChanged]);

  useEffect(() => {
    const cartSub = DeviceEventEmitter.addListener('cartUpdated', fetchCartCount);
    const wishSub = DeviceEventEmitter.addListener('wishlistUpdated', fetchWishListCount);
    return () => {
      cartSub.remove();
      wishSub.remove();
    };
  }, []);

  const fetchCartCount = async () => {
    let user = await StorageService.getItem("user_data");
    if (user !== null) {
      const userData = parseStoredUser(user);
      // console.log("Line 153", userData?._id);
      const response = await ApiService.GET_TOTAL_CART_COUNT(userData?._id);
      // console.log(response?.data?.count, "Line 24");
      setCartCount(response?.data?.count);
    } else {
      const guestCount = await GuestCartService.getCount();
      setCartCount(guestCount);
    }
  };

  const fetchWishListCount = async () => {
    let user = await StorageService.getItem("user_data");
    if (user !== null) {
      const userData = parseStoredUser(user);
      // console.log("Line 153", userData?._id);
      const response = await ApiService.GET_TOTAL_WISHLIST_COUNT(userData?._id);
      // console.log(response?.data?.count, "Line 24");
      setWishlistCount(response?.data?.count);
    }
  };

  return (
    <View style={styles.main}>
      <TouchableOpacity
        style={styles.iconHolder}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={textScale(30)} color={Colors.black} />
      </TouchableOpacity>
      <View
        style={[
          styles.headerTextHolder,
          { width: heart === "Cart" ? "60%" : "50%" },
        ]}
      >
        <Text style={styles.headerText}>{title}</Text>
      </View>
      {heart === "productDetails" && (
        <TouchableOpacity
          style={styles.iconHolder}
          onPress={() => navigation.navigate("WishList2")}
        >
          <Feather name="heart" size={moderateScale(30)} color={Colors.black} />
          {wishlistCount >= 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{wishlistCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      {heart === "productDetails" && (
        <TouchableOpacity onPress={() => navigation.push("Cart")}>
          <Feather
            name="shopping-cart"
            size={moderateScale(30)}
            color={Colors.black}
          />
          <View
            style={{
              backgroundColor: Colors.red,
              position: "absolute",
              right: -10,
              top: -5,
              width: moderateScale(20),
              height: moderateScale(20),
              borderRadius: moderateScale(10),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: FontFamily.Montserrat_Regular,
                color: Colors.white,
                fontSize: textScale(12),
              }}
            >
              {cartCount}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      {heart === "Cart" && (
        <TouchableOpacity
          style={[
            styles.iconHolder,
            { width: heart === "Cart" ? "25%" : "20%" },
          ]}
          onPress={handleClearCart}
        >
          <Text style={styles.emptyCartStyles}>Clear Cart</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default InternalHeader;

const styles = StyleSheet.create({
  main: {
    backgroundColor: Colors.white,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: moderateVerticalScale(10),
    paddingHorizontal: moderateScale(15),
    // marginTop:-10,
  },
  iconHolder: {
    alignItems: "center",
    width: "20%",
  },
  headerTextHolder: {
    width: "50%",
  },
  headerText: {
    fontSize: textScale(16),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_SemiBold,
    textAlign: "center",
  },
  iconHolder2: {
    flexDirection: "row",
    gap: moderateScale(15),
    marginStart: "10%",
  },
  emptyCartStyles: {
    color: Colors.red,
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  cartBadge: {
    backgroundColor: Colors.red,
    position: "absolute",
    right: moderateScale(15),
    top: moderateVerticalScale(-5),
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.white,
    fontSize: textScale(12),
  },
});
