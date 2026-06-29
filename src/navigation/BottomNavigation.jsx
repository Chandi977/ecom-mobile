import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import { moderateScale, textScale } from "../utils/responsiveSize";
import FontFamily from "../utils/FontFamily";
const Tab = createBottomTabNavigator();
const BottomNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, focused }) => ({
        headerShown: false,
        tabBarButton: props => (
          <TouchableOpacity {...props} activeOpacity={1} />
        ),
        tabBarShowLabel: false,
        tabBarLabelPosition: "beside-icon",
        tabBarIcon: ({ focused, color, size }) => menuIcons(route, focused),
        tabBarStyle: {
          borderTopLeftRadius: moderateScale(40),
          borderTopRightRadius: moderateScale(40),
          height:
            Platform.OS === "android" ? moderateScale(75) : moderateScale(90),
          width: "100%",
          backgroundColor: Colors.white,
          overflow: "hidden",
          paddingHorizontal: moderateScale(15),
        },
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

const menuIcons = (route, focused) => {
  let icon;
  let iconSize = focused ? 20 : 30;
  let iconColor = focused ? "white" : Colors.brandColor;
  if (route.name === "Home") {
    icon = <HomeSolid size={iconSize} color={iconColor} />;
  } else if (route.name === "Favorite") {
    icon = <HeartSolid size={iconSize} color={iconColor} />;
  } else if (route.name === "Cart") {
    icon = <CartSolid size={iconSize} color={iconColor} />;
  } else if (route.name === "Profile") {
    icon = <UserSolid size={iconSize} color={iconColor} />;
  }

  return (
    <View style={[styles.tabBarItem, { width: focused ? 125 : 50 }]}>
      <View
        style={[
          styles.icon,
          {
            backgroundColor: focused ? "red" : "",
          },
        ]}
      >
        {icon}
      </View>
      {focused && (
        <Text
          style={[
            styles.label,
            { backgroundColor: focused ? Colors.bottomTextBackGround : "" },
          ]}
        >
          {route.name}
        </Text>
      )}
    </View>
  );
};

export default BottomNavigation;

const styles = StyleSheet.create({
  icon: {
    borderRadius: moderateScale(100),
    padding: 5,
    backgroundColor: Colors.bottomTextBackGround,
  },
  label: {
    color: Colors.forgetPassword,
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_SemiBold,
    padding: moderateScale(5),
  },
  tabBarItem: {
    flexDirection: "row",
    alignItems: "center",
    padding:moderateScale(5),
    justifyContent: "center",
    borderRadius: moderateScale(30),
    backgroundColor: Colors.bottomTextBackGround,
    overflow: "hidden",
  },
});
