import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { moderateScale, textScale } from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";
import Colors from "../../utils/Colors";
import { useNavigation } from "@react-navigation/native";

const CustomPackagingButton = () => {
  const navigation = useNavigation();
  return (
    <View style={{ width: "100%", backgroundColor: Colors.back, }}>
      <View
        style={{
          width: "95%",
          alignSelf: "center",
          flexDirection: "row",
          alignItems: "center",
          gap: "1%",
          justifyContent: "center",
          backgroundColor: Colors.back,
        }}
      >
        <TouchableOpacity
          style={{
            width: "55%",
            padding: moderateScale(10),
            backgroundColor: "#14254C",
            borderRadius: moderateScale(5),
            alignItems: "center",
          }}
          onPress={() => navigation.navigate("Custom Form")}
        >
          <Text
            style={{
              fontFamily: FontFamily.Montserrat_Medium,
              fontSize: textScale(15),
              color: Colors.white,
              textAlign: "center",
            }}
          >
            Custom Packaging
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomPackagingButton;

const styles = StyleSheet.create({});
