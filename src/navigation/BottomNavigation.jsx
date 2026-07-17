import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Home from "../screen/appScreens/Home";
import Cart from "../screen/appScreens/Cart";
import Profile from "../screen/appScreens/Profile";
import Colors from "../utils/Colors";
import {
  HomeIcon as HomeSolid,
  HeartIcon as HeartSolid,
  ShoppingCartIcon as CartSolid,
  UserIcon as UserSolid,
} from "react-native-heroicons/solid";
import Wishlist from "../components/Profile/Wishlist";
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from "../utils/responsiveSize";
import FontFamily from "../utils/FontFamily";
const Tab = createBottomTabNavigator();

const TAB_LABELS = {
  Home: "Home",
  Favorite: "Wishlist",
  Cart: "Cart",
  Profile: "User",
};

const TabBarButton = props => (
  <TouchableOpacity {...props} activeOpacity={0.82} />
);

const BottomNavigation = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, moderateVerticalScale(8));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarButton: TabBarButton,
        tabBarShowLabel: true,
        tabBarLabel: TAB_LABELS[route.name] || route.name,
        tabBarIcon: ({ focused }) => menuIcons(route.name, focused),
        tabBarActiveTintColor: Colors.brandColor,
        tabBarInactiveTintColor: Colors.text_grey,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: [
          styles.tabBar,
          {
            height:
              Platform.OS === "android"
                ? moderateVerticalScale(64) + bottomInset
                : moderateVerticalScale(66) + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarAccessibilityLabel: TAB_LABELS[route.name] || route.name,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Favorite" component={Wishlist} />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

const menuIcons = (routeName, focused) => {
  let icon;
  const iconSize = moderateScale(22);
  const iconColor = focused ? Colors.white : Colors.text_grey;
  if (routeName === "Home") {
    icon = <HomeSolid size={iconSize} color={iconColor} />;
  } else if (routeName === "Favorite") {
    icon = <HeartSolid size={iconSize} color={iconColor} />;
  } else if (routeName === "Cart") {
    icon = <CartSolid size={iconSize} color={iconColor} />;
  } else if (routeName === "Profile") {
    icon = <UserSolid size={iconSize} color={iconColor} />;
  }

  return (
    <View style={[styles.iconCircle, focused && styles.iconCircleActive]}>
      {icon}
    </View>
  );
};

export default BottomNavigation;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border_grey,
    paddingTop: moderateVerticalScale(6),
    paddingHorizontal: moderateScale(8),
    elevation: 14,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(10),
    shadowOffset: { width: 0, height: -3 },
  },
  tabBarItem: {
    minHeight: moderateVerticalScale(58),
    justifyContent: "center",
    paddingVertical: moderateVerticalScale(2),
  },
  tabBarLabel: {
    fontSize: textScale(11),
    fontFamily: FontFamily.Montserrat_SemiBold,
    marginTop: moderateVerticalScale(2),
    letterSpacing: 0,
  },
  iconCircle: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  iconCircleActive: {
    backgroundColor: Colors.brandColor,
  },
});
