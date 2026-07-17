import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import Colors from "../utils/Colors";
import InternalHeader from "./Header/InternalHeader";
import { useNavigation } from "@react-navigation/native";
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  textScale,
} from "../utils/responsiveSize";
import FontFamily from "../utils/FontFamily";

export default function ShowAddressPage({ route }) {
  const navigation = useNavigation();
  const { contact_address, cartProducts, user, discountedAmount } =
    route.params;
  console.log(contact_address, "line 26");
  const handleRemove = async () => {};

  const displayAddressCard = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => {}} style={styles.selectAddressCard}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.customerName}>{item?.name}</Text>
          {/* <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View> */}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: moderateScale(10),
          }}
        >
          <Text style={styles.selectText}>Street: </Text>
          <Text style={styles.selectText1}>{item?.landmark}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.selectText}>City: </Text>
          <Text style={styles.selectText1}>{item?.town}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.selectText}>State: </Text>
          <Text style={styles.selectText1}>{item?.state}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.selectText}>Phone: </Text>
          <Text style={styles.selectText1}>{item?.mobile}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.selectText}>Zip code: </Text>
          <Text style={styles.selectText1}>{item?.pincode}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.selectText}>Country calling code: </Text>
          <Text style={styles.selectText1}>{"+91"}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.selectText}>Country: </Text>
          <Text style={styles.selectText1}>{"India"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleNext = async () => {
    console.log("Clicked on the next Button");
    navigation.navigate("Final Review", {
      cartProducts: cartProducts,
      user: user,
      contact_address: contact_address[0],
      discountedAmount: discountedAmount,
    });
  };
  return (
    <View style={{ flex: 1, backgroundColor: Colors.back }}>
      <SafeAreaView style={{ backgroundColor: Colors.white }} />
      <StatusBar backgroundColor={Colors.white} barStyle={"dark-content"} />
      <InternalHeader title={"Select Address"} />
      <View style={styles.container}>
        {/* main content */}
        <View style={styles.content}>
          <View style={{ marginBottom: moderateVerticalScale(20) }}>
            <Text style={styles.billingHeading}>Select Address</Text>

            <View>
              <FlatList
                data={contact_address}
                keyExtractor={(item) => item.id}
                renderItem={displayAddressCard}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleNext}
            style={styles.addressButton}
          >
            <Text style={styles.addressText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    backgroundColor: Colors.white,
  },
  content: {
    marginTop: moderateScale(10),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(5),
    marginHorizontal: moderateScale(10),
  },
  billingHeading: {
    color: Colors.forgetPassword,
    fontSize: textScale(18),
    fontFamily: FontFamily.Montserrat_SemiBold,
    marginLeft: moderateScale(10),
    marginTop: moderateScale(10),
  },
  addressButton: {
    backgroundColor: Colors.forgetPassword,
    justifyContent: "center",
    alignItems: "center",
    height: moderateScale(40),
    width: moderateScale(300),
    alignSelf: "center",
    borderRadius: moderateScale(5),
    marginBottom: moderateScale(20),
  },
  addressText: {
    color: Colors.white,
    fontSize: textScale(14),
    textTransform: "uppercase",
    fontFamily: FontFamily.Montserrat_SemiBold,
    letterSpacing: scale(1),
  },
  selectAddressCard: {
    marginVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border_grey,
    borderRadius: 5,
    padding: 10,
    width: "95%",
    alignSelf: "center",
  },
  customerName: {
    color: Colors.forgetPassword,
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  selectText: {
    fontSize: textScale(14),
    color: Colors.black,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  selectText1: {
    color: Colors.border_color,
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  editText: {
    color: Colors.forgetPassword,
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
});
