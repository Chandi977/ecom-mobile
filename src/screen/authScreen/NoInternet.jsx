import {
  Image,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import Colors from "../../components/Colors";
import { ImagePath } from "../../utils/ImagePath";
import { responsiveFontSize } from "../../components/Responsive";
import CustomButton from "../../components/General/CustomButton";

const NoInternet = () => {
  const handleOpenSetting = async () => {
    await Linking.openSettings();
  };

  return (
    <View style={styles.main}>
      <StatusBar barStyle={"dark-content"} backgroundColor={Colors.white} />
      <SafeAreaView style={{ backgroundColor: Colors.white }} />
      <Image
        source={ImagePath.landing}
        resizeMode="contain"
        style={styles.imageStyle}
      />
      <Text style={styles.text}>
        Please check your internet connection again or connect to wifi
      </Text>
      {/* <View style={styles.buttonHolder}>
        <CustomButton name={"Open Setting"} handleAction={handleOpenSetting} />
      </View> */}
    </View>
  );
};

export default NoInternet;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  imageStyle: {
    width: "100%",
    height: responsiveFontSize(200),
  },
  text: {
    width: "90%",
    textAlign: "center",
    fontSize: responsiveFontSize(18),
    color: Colors.brandColor,
    fontWeight: "500",
    marginTop: responsiveFontSize(20),
  },
  buttonHolder: {
    marginVertical: responsiveFontSize(20),
    width: "90%",
    alignItems: "center",
  },
});
