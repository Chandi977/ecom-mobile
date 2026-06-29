import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Colors from "../../utils/Colors";
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  textScale,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";

const Description = () => {
  return (
    <View
      style={{
        marginVertical: moderateVerticalScale(10),
        backgroundColor: Colors.back,
        alignItems:'center'
      }}
    >
      <Text style={styles.headerText}>
        YOUR ONE-STOP CUSTOM PACKAGING STORE ONLINE
      </Text>
      <View style={styles.main}>
        <Text style={styles.descriptionText}>
          As a leading custom packaging store online, Prem Industries India
          Limited pride on offering a wide range of high-quality E-commerce
          packaging product online India to cater to your every requirement.
          With just a few clicks, you can now buy packaging product online
          conveniently and securely from the comfort of your home or office.
        </Text>
        <Text style={styles.descriptionText}>
          At Prem Industries India Limited, we understand the importance of
          reliable packaging solutions for businesses of all sizes. That's why
          we offer an extensive selection of packaging products online,
          including corrugated boxes, flexible laminates, labels, tapes, rigid
          boxes, ecommerce paper bags, and poly bags, among others. Whether you
          need Ecommerce packaging products for shipping, storage, or retail
          purposes, we have got you covered.
        </Text>
        <Text style={styles.descriptionText}>
          Our commitment to quality ensures that each product meets the highest
          industry standards, providing durability and protection for your
          valuable goods. Whether you are a small business owner or a large
          corporation, our comprehensive range of packaging products caters to
          all your needs.
        </Text>
        <Text style={styles.descriptionText}>
          Shop packaging product online with confidence with us for all your
          packaging needs. Order now and experience the difference quality
          packaging can make!
        </Text>
      </View>
    </View>
  );
};

export default Description;

const styles = StyleSheet.create({
  main: {
    width: "95%",
    alignSelf: "center",
    backgroundColor: Colors.back,
    borderRadius: moderateScale(10),
    padding: moderateScale(5),
  },
  headerText: {
    color: Colors.brandColor,
    fontSize: textScale(14),
    textTransform: "uppercase",
    textAlign: "center",
    // fontWeight: "700",
    fontFamily:FontFamily.Montserrat_SemiBold,
    marginBottom: moderateVerticalScale(10),
    padding: moderateScale(10),
  },
  descriptionText: {
    fontFamily: FontFamily.Montserrat_Medium,
    color: Colors.black,
    textAlign: "justify",
    lineHeight: scale(20),
    fontSize: textScale(12),
    padding: moderateScale(5),
    letterSpacing: scale(0.2),
  },
});
