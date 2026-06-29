import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Colors from "../utils/Colors";
import BottomNavigation from "./BottomNavigation";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import data from "../assets/data/DrawerCategory.json";
import Feather from "react-native-vector-icons/Feather";
import ApiService from "../service/APIService";
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from "../utils/responsiveSize";
import FontFamily from "../utils/FontFamily";
import StorageService from "../utils/storageService";
import { parseStoredUser } from "../utils/HelperFunction";
import WrapperContainer from "../utils/WrapperContainer";
import {
  getProductCategoryId,
  getProductSubCategoryId,
} from "../utils/productFields";

function CustomDrawerContent(props) {
  const [expanded, setExpanded] = useState(false);
  const [id, setId] = useState(null);
  const [subId, setSubId] = useState(null);
  const [tape, setTape] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const user = route?.params?.userData;
  // console.log(id, "line 48");

  useEffect(() => {
    fetchLocalData();
    getAllProducts();
  }, [isFocused]);

  const fetchLocalData = async () => {
    try {
      const userStr = await StorageService.getItem("user_data");
      console.log(userStr,"Line 61")
      if (userStr) {
        const userData = parseStoredUser(userStr);
        const response = await ApiService.GET_SPECIFIC_USER_DETAILS(userData?._id);
        setLocalUser(response?.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getAllProducts = async () => {
    try {
      const response = await ApiService.GET_ALL_PRODUCTS();
      if (response && response?.data) {
        setAllProducts(response?.data);
      }
    } catch (e) {
      console.log("Error fetching Products", e?.message);
    }
  };

  const closeDrawer = () => {
    props.navigation.closeDrawer();
  };

  const handleCategoryClick = (item) => {
    // console.log(item, "line 83");
    closeDrawer();
    navigation.navigate("CategoryDetailsTwo", {
      categories: item,
      data: allProducts.filter(
        (items) => getProductCategoryId(items) === item?.category_id
      ),
      option: "cat",
    });
  };

  const handleSubCategoryClicked = (item) => {
    console.log(item, "line 94");
    closeDrawer();

    const allTapeSubCategoryIds = [
      "6927e7e2d53f3a772c701b6b",
      "6927e83dd53f3a772c701b93",
      "6927e857d53f3a772c701b9b",
      "6927e857d53f3a772c701b9e",
      "69de2800733b8ba05652a604",
      "69de281b733b8ba05652a60b",
      "69df1488733b8ba05652aa14",
    ];

    if (item?.filterType === "allTapes") {
      navigation.navigate("CategoryDetailsTwo", {
        categories: item,
        data: allProducts.filter((product) =>
          allTapeSubCategoryIds.includes(getProductSubCategoryId(product))
        ),
        option: "cat",
      });
    } else if (item?.name === "ALL PRODUCTS") {
      navigation.navigate("CategoryDetailsTwo", {
        categories: item,
        data: allProducts.filter((product) =>
          ["6557e1cb301ec4f2f426614c", "6557e236301ec4f2f4266154"].includes(
            getProductSubCategoryId(product)
          )
        ),
        option: "cat",
      });
    } else {
      navigation.navigate("CategoryDetailsTwo", {
        categories: item,
        data: allProducts.filter((product) => {
          if (item?.filterType === "category") {
            return getProductCategoryId(product) === item?.category_id;
          }
          return getProductSubCategoryId(product) === item?.category_id;
        }),
        option: "cat",
      });
    }
  };

  const handleSubMenuList = (item) => {
    console.log(item, "line 105");
    if (item?.id === id) {
      setId(null);
      setSubId(null);
    } else {
      setId(item?.id);
      setSubId(null);
    }
  };

  const handleSubSubMenuList = (item) => {
    console.log(item, "line 115");
    if (item?.id === subId) {
      setSubId(null);
    } else {
      setSubId(item?.id);
    }
  };

  const handleWhatsappClicked = async () => {
    const phone = "+918447247227";
    const message = "Hi, I have an enquiry about the product.";
    const url = `whatsapp://send?text=${encodeURIComponent(
      message
    )}&phone=${phone}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "WhatsApp is not installed on your device.");
      }
    } catch (e) {
      console.log("Error opening WhatsApp", e);
    }
  };

  const handleCallClicked = async () => {
    const phone = "+918447247227";
    const url = `tel:${phone}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open the phone dialer.");
      }
    } catch (e) {
      console.log("Error making phone call", e);
    }
  };

  const renderItem3 = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.internalItem, { width: "80%" }]}
        onPress={() => handleSubCategoryClicked(item)}
      >
        <Text style={[styles.nameText, { fontSize: textScale(15) }]}>
          {item?.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem2 = ({ item }) => {
    console.log(item, "line 238");
    return (
      <View key={item?.id}>
        <TouchableOpacity
          style={[styles.internalItem, { width: "90%" }]}
          onPress={() => {
            item?.subMenu
              ? handleSubSubMenuList(item)
              : handleSubCategoryClicked(item);
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.nameText, { fontSize: textScale(15) }]}>
              {item?.name}
            </Text>
            <Text
              style={{
                fontSize: textScale(10),
                color: Colors.brandColor,
                fontFamily: FontFamily.Montserrat_Bold,
                paddingTop: moderateScale(3),
                marginLeft: moderateScale(-5),
              }}
            >
              {item?.tm}
            </Text>
          </View>

          {item?.subMenu ? (
            <AntDesign
              name="caretdown"
              color={Colors.brandColor}
              size={textScale(15)}
            />
          ) : null}
        </TouchableOpacity>
        {item?.subMenu && item?.id === subId && (
          <FlatList
            data={item?.subMenu}
            renderItem={renderItem3}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <View key={item?.id}>
        <TouchableOpacity
          style={styles.itemHolder}
          onPress={() => {
            item?.subMenu ? handleSubMenuList(item) : handleCategoryClick(item);
          }}
        >
          <Text style={styles.nameText}>{item?.name}</Text>
          {item?.subMenu ? (
            <AntDesign
              name="caretdown"
              color={Colors.brandColor}
              size={textScale(15)}
            />
          ) : null}
        </TouchableOpacity>
        {item?.subMenu && item?.id === id && (
          <FlatList
            data={item?.subMenu}
            renderItem={renderItem2}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    );
  };

  const renderDrawerFooter = () => {
    return (
      <View style={{ marginTop: moderateVerticalScale(15), paddingBottom: moderateVerticalScale(35) }}>
        {/* Divider Line */}
        <View style={styles.drawerDivider} />

        <Text style={styles.drawerSectionHeader}>Info & Support</Text>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.drawerMenuItem}
          onPress={() => {
            closeDrawer();
            navigation.navigate("Notifications");
          }}
        >
          <View style={styles.drawerMenuItemLeft}>
            <Feather name="bell" size={textScale(16)} color={Colors.brandColor} />
            <Text style={styles.drawerMenuText}>Notifications</Text>
          </View>
          <Feather name="chevron-right" size={textScale(16)} color={Colors.brandColor} />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          style={styles.drawerMenuItem}
          onPress={() => {
            closeDrawer();
            navigation.navigate("Settings");
          }}
        >
          <View style={styles.drawerMenuItemLeft}>
            <Feather name="settings" size={textScale(16)} color={Colors.brandColor} />
            <Text style={styles.drawerMenuText}>Settings</Text>
          </View>
          <Feather name="chevron-right" size={textScale(16)} color={Colors.brandColor} />
        </TouchableOpacity>

        {/* About Us */}
        <TouchableOpacity
          style={styles.drawerMenuItem}
          onPress={() => {
            closeDrawer();
            navigation.navigate("About Us");
          }}
        >
          <View style={styles.drawerMenuItemLeft}>
            <Feather name="info" size={textScale(16)} color={Colors.brandColor} />
            <Text style={styles.drawerMenuText}>About Us</Text>
          </View>
          <Feather name="chevron-right" size={textScale(16)} color={Colors.brandColor} />
        </TouchableOpacity>

        {/* Contact Us */}
        <TouchableOpacity
          style={styles.drawerMenuItem}
          onPress={() => {
            closeDrawer();
            navigation.navigate("Contact Us");
          }}
        >
          <View style={styles.drawerMenuItemLeft}>
            <Feather name="phone" size={textScale(16)} color={Colors.brandColor} />
            <Text style={styles.drawerMenuText}>Contact Us</Text>
          </View>
          <Feather name="chevron-right" size={textScale(16)} color={Colors.brandColor} />
        </TouchableOpacity>

        {/* Report Issue */}
        <TouchableOpacity
          style={styles.drawerMenuItem}
          onPress={() => {
            closeDrawer();
            navigation.navigate("Report");
          }}
        >
          <View style={styles.drawerMenuItemLeft}>
            <Feather name="alert-circle" size={textScale(16)} color={Colors.brandColor} />
            <Text style={styles.drawerMenuText}>Report an Issue</Text>
          </View>
          <Feather name="chevron-right" size={textScale(16)} color={Colors.brandColor} />
        </TouchableOpacity>

        {/* Divider */}
        <View style={[styles.drawerDivider, { marginVertical: moderateVerticalScale(15) }]} />

        {/* Direct Contacts */}
        <TouchableOpacity
          style={styles.iconHolder}
          onPress={handleWhatsappClicked}
        >
          <FontAwesome
            name="whatsapp"
            color={Colors.red}
            size={textScale(24)}
          />
          <Text style={[styles.nameText, { fontSize: textScale(14), paddingVertical: 0 }]}>
            +918447247227
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconHolder} onPress={handleCallClicked}>
          <Feather name="phone-call" color={Colors.red} size={textScale(24)} />
          <Text style={[styles.nameText, { fontSize: textScale(14), paddingVertical: 0 }]}>
            +918447247227
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <WrapperContainer backgroundColor={Colors.forgetPassword}>
    <View style={{ flex: 1, backgroundColor: "white",marginTop:moderateVerticalScale(-25) }}>
      <View style={[styles.upperView]}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: moderateScale(10),
            padding: moderateScale(10),
          }}
          onPress={() => {
            closeDrawer();
            navigation.navigate("Profile");
          }}
        >
          <FontAwesome5
            name="user-circle"
            color={Colors.red}
            size={textScale(40)}
          />
          <View style={{ gap: moderateScale(5) }}>
            <Text style={styles.userName}>
              {(localUser &&
                `${localUser?.first_name} ${localUser?.last_name}`) ||
                "Full Name"}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconView} onPress={closeDrawer}>
          <AntDesign name="close" color={Colors.white} size={textScale(25)} />
        </TouchableOpacity>
      </View>
      {/* Show the list */}
      <View style={{ flex: 1, padding: moderateScale(10) }}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={renderDrawerFooter}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
     </WrapperContainer>
  );
}

export default function DrawerNavigation() {
  const Drawer = createDrawerNavigator();
  const navigation = useNavigation();

  return (
    <Drawer.Navigator
      screenOptions={{ drawerType: "front" }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="Dashboard"
    >
      <Drawer.Screen
        name="Dashboard"
        component={BottomNavigation}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  upperView: {
    backgroundColor: Colors.forgetPassword,
    width: "100%",
    height: "10%",
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
    padding: moderateScale(10),
  },
  mainView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(10),
  },
  emailText: {
    fontSize: textScale(14),
    color: Colors.white,
    fontWeight: "400",
  },
  iconView: {
    position: "absolute",
    right: "3%",
  },
  userName: {
    fontSize: textScale(16),
    fontWeight: "500",
    color: Colors.white,
  },
  itemHolder: {
    borderRadius: moderateScale(5),
    backgroundColor: Colors.yellow_background,
    marginVertical: moderateVerticalScale(5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(5),
  },
  nameText: {
    fontSize: textScale(16),
    color: Colors.brandColor,
    fontWeight: "600",
    padding: moderateScale(10),
    textTransform: "uppercase",
  },
  internalItem: {
    borderRadius: moderateScale(5),
    alignSelf: "flex-end",
    marginVertical: moderateVerticalScale(5),
    backgroundColor: Colors.yellow_background,
    paddingHorizontal: moderateScale(5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconHolder: {
    borderWidth: 2,
    flexDirection: "row",
    gap: textScale(20),
    alignItems: "center",
    marginVertical: moderateVerticalScale(5),
    padding: moderateScale(8),
    borderRadius: moderateScale(5),
    backgroundColor: Colors.yellow_background,
    borderColor: Colors.yellow_background,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: Colors.border_grey,
    marginVertical: moderateVerticalScale(10),
  },
  drawerSectionHeader: {
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.text_grey,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: moderateVerticalScale(8),
    paddingLeft: moderateScale(5),
  },
  drawerMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: moderateVerticalScale(8),
    paddingHorizontal: moderateScale(10),
    marginVertical: moderateVerticalScale(4),
    borderRadius: moderateScale(5),
    backgroundColor: Colors.yellow_background,
  },
  drawerMenuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
  },
  drawerMenuText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.brandColor,
  },
});
