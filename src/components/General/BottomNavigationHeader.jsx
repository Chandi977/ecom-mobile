import { Image, StyleSheet, TouchableOpacity, View, Text, DeviceEventEmitter } from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import CartCacheService from "../../utils/CartCacheService";
import { Pop } from "./Motion";

const BottomNavigationHeader = ({ cartValueChanged, wishlistValueChanged }) => {
  // console.log(cartValueChanged, wishlistValueChanged, "line 13");
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
        // Show the cached count immediately, then reconcile with the server.
        const cachedCount = await CartCacheService.getCount(userData._id);
        if (cachedCount !== null) {
          setCartCount(cachedCount);
        }
        const response = await ApiService.GET_TOTAL_CART_COUNT(userData._id);
        const count = response?.data?.count || 0;
        setCartCount(count);
        await CartCacheService.setCount(userData._id, count);
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
    <View
      style={[
        styles.main,
        {
          paddingLeft: Math.max(moderateScale(12), insets.left + moderateScale(8)),
          paddingRight: Math.max(
            moderateScale(12),
            insets.right + moderateScale(8),
          ),
        },
      ]}
    >
      <View style={styles.itemHolder}>
        <TouchableOpacity
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Open sidebar menu"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={styles.menuHolder}
          onPress={openDrawer}
        >
          <Feather name="menu" color={Colors.black} size={moderateScale(24)} />
        </TouchableOpacity>

        <View style={styles.imageViewHolder}>
          <Image
            style={styles.imageStyle}
            source={ImagePath.headerImage}
            resizeMode={"contain"}
          />
        </View>

        <View style={styles.iconHolder}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={[styles.actionButton, styles.cartContainer]}
          >
            <Feather name="bell" size={moderateScale(24)} color={Colors.black} />
            {notifCount > 0 && (
              <Pop trigger={notifCount} style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{notifCount}</Text>
              </Pop>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Favorite")}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Wishlist"
            style={[styles.actionButton, styles.cartContainer]}
          >
            <Feather
              name="heart"
              size={moderateScale(26)}
              color={Colors.black}
            />
            {wishlistCount >= 0 && (
              <Pop trigger={wishlistCount} style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{wishlistCount}</Text>
              </Pop>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.push("Cart")}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Cart"
            style={[styles.actionButton, styles.cartContainer]}
          >
            <Feather
              name="shopping-cart"
              size={moderateScale(26)}
              color={Colors.brandColor}
            />

            {cartCount >= 0 && (
              <Pop trigger={cartCount} style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </Pop>
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
    paddingVertical: moderateVerticalScale(4),
    backgroundColor: Colors.white,
  },
  itemHolder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: moderateVerticalScale(50),
    gap: moderateScale(6),
  },
  menuHolder: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  imageViewHolder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: moderateScale(4),
  },
  imageStyle: {
    width: "100%",
    maxWidth: moderateScale(190),
    height: moderateVerticalScale(42),
  },
  iconHolder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: moderateScale(4),
    flexShrink: 0,
  },
  actionButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    alignItems: "center",
    justifyContent: "center",
  },
  cartContainer: {
    position: "relative",
  },
  cartBadge: {
    backgroundColor: Colors.red,
    position: "absolute",
    right: moderateScale(1),
    top: moderateVerticalScale(1),
    minWidth: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    paddingHorizontal: moderateScale(4),
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.white,
    fontSize: textScale(10),
  },
});
