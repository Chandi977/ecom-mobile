import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Colors from "../../utils/Colors";
import { moderateScale, textScale } from "../../utils/responsiveSize";

const CustomButton = ({ name, handleAction }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleAction}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{name}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.forgetPassword,
    justifyContent: "center",
    alignItems: "center",
    // height: responsivePadding(30),
    width: "40%",
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginStart: moderateScale(10),
    // marginBottom: responsivePadding(30),
  },
  buttonText: {
    fontSize: textScale(16),
    color: Colors.white,
    fontWeight: "500",
  },
});
