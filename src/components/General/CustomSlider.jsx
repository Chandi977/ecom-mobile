import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Slider from "@react-native-community/slider";
import Colors from "../../utils/Colors";
import { moderateScale, textScale } from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";

const CustomSlider = ({ name, minValue, maxValue, value, onValueChange }) => {
  const [sliderValue, setSliderValue] = useState(minValue);
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "95%",
        }}
      >
        <Text style={styles.text}>
          {name}: {value} inches
        </Text>
        <Text style={styles.text}>{maxValue} inches</Text>
      </View>
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={minValue}
        maximumValue={maxValue}
        value={value}
        onValueChange={onValueChange}
        // onValueChange={(value) => {
        //   setSliderValue(value);
        //   onValueChange(value);
        // }}
        minimumTrackTintColor={Colors.brandColor}
        maximumTrackTintColor={Colors.red}
        step={1}
      />
    </View>
  );
};

export default CustomSlider;

const styles = StyleSheet.create({
  text: {
    color: Colors.black,
    marginStart: moderateScale(10),
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
});
