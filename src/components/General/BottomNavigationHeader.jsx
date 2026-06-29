import { Image, StyleSheet, TouchableOpacity, View, Text, DeviceEventEmitter } from "react-native";
import React, { useEffect, useState } from "react";
import Feather from "react-native-vector-icons/Feather";
import Colors from "../../utils/Colors";
import {
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { ImagePath } from "../../utils/ImagePath";
import { moderateScale, moderateVerticalScale, textScale } from "../../utils/responsiveSize";
import ApiService from "../../service/APIService";
import FontFamily from "../../utils/FontFamily";
import StorageService from "../../utils/storageService";
import { parseStoredUser } from "../../utils/HelperFunction";
import GuestCartService from "../../utils/GuestCartService";

const BottomNavigationHeader = ({ cartValueChanged, wishlistValueChanged }) => {
  // console.log(cartValueChanged, wishlistValueChanged, "line 13");
  const navigation = useNavigation();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchCartCount();
    fetchWishListCount();
    fetchNotifCount();
  }, [isFocused, cartValueChanged, wishlistValueChanged]);

  useEffect(() => {
    const cartSub = DeviceEventEmitter.addListener('cartUpdated', fetchCartCount);
    const wishSub = DeviceEventEmitter.addListener('wishlistUpdated', fetchWishListCount);
    const notifSub = DeviceEventEmitter.addListener('notificationsUpdated', fetchNotifCount);
    return () => {
      cartSub.remove();
      wishSub.remove();
      notifSub.remove();
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const storedUser = await StorageService.getItem("user_data");
      const userData = parseStoredUser(storedUser);
      if (userData?._id) {
        const response = await ApiService.GET_TOTAL_CART_COUNT(userData._id);
        setCartCount(response?.data?.count || 0);
      } else {
        const guestCount = await GuestCartService.getCount();
        setCartCount(guestCount || 0);
      }
    } catch (error) {
      console.log('Error fetching cart count:', error);
    }
  };

  const fetchWishListCount = async () => {
    try {
      const storedUser = await StorageService.getItem("user_data");
      const userData = parseStoredUser(storedUser);
      if (userData?._id) {
        const response = await ApiService.GET_TOTAL_WISHLIST_COUNT(userData._id);
        setWishlistCount(response?.data?.count || 0);
      }
    } catch (error) {
      console.log('Error fetching wishlist count:', error);
    }
  };

  const fetchNotifCount = async () => {
    try {
      const storedUser = await StorageService.getItem("user_data");
      const userData = parseStoredUser(storedUser);
      if (userData?._id) {
        const response = await ApiService.GET_NOTIFICATION_UNREAD_COUNT();
        setNotifCount(response?.data?.count || 0);
      } else {
        setNotifCount(0);
      }
    } catch (error) {
      console.log('Error fetching notification count:', error);
    }
  };

  const openDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <View style={styles.main}>
      <View style={styles.itemHolder}>
        {/* Menu Icon */}
        <TouchableOpacity style={styles.menuHolder} onPress={openDrawer}>
          <Feather name="menu" color={Colors.black} size={textScale(25)} />
        </TouchableOpacity>

        {/* Header Logo */}
        <View style={styles.imageViewHolder}>
          <Image
            style={styles.imageStyle}
            source={ImagePath.headerImage}
            resizeMode={"contain"}
          />
        </View>

        {/* Notifications, Favorite and Cart Icons */}
        <View style={styles.iconHolder}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            style={styles.cartContainer}
          >
            <Feather name="bell" size={moderateScale(28)} color={Colors.black} />
            {notifCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Favorite")}>
            <Feather
              name="heart"
              size={moderateScale(30)}
              color={Colors.black}
            />
            {wishlistCount >= 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.push("Cart")}
            style={styles.cartContainer}
          >
            <Feather
              name="shopping-cart"
              size={moderateScale(30)}
              color={Colors.brandColor}
            />

            {cartCount >= 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default BottomNavigationHeader;

const styles = StyleSheet.create({
  main: {
    padding: moderateScale(5),
    backgroundColor: Colors.white,
  },
  itemHolder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuHolder: {
    width: "15%",
    alignItems: "center",
  },
  imageViewHolder: {
    width: "50%",
    alignItems: "center",
    marginBottom:moderateVerticalScale(10)
  },
  imageStyle: {
    width: "100%",
    height: moderateScale(40),
  },
  iconHolder: {
    width: "30%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  cartContainer: {
    position: "relative", // To position the cart badge relative to the cart icon
  },
  cartBadge: {
    backgroundColor: Colors.red,
    position: "absolute",
    right: -10,
    top: -5,
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
