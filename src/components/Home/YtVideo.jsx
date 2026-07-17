import { StyleSheet, Text, View } from "react-native";
import React from "react";
import YoutubePlayer from "react-native-youtube-iframe";
import Colors from "../../utils/Colors";
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";

const YtVideo = () => {
  const handleOnReady = () => {
    console.log("Video is ready!");
  };

  const handleOnError = (error) => {
    console.error("Video encountered an error: ", error);
  };

  const handleOnChangeState = (state) => {
    console.log("Video state changed to: ", state);
  };

  return (
    <View
      style={{
        marginTop: 10,
        backgroundColor: Colors.back,
      }}
    >
      <Text style={styles.headerText}>E-COMMERCE VIDEO</Text>
      <View style={styles.main}>
        <YoutubePlayer
          height={225}
          play={false}
          videoId={"7hIsUYzLc7U"}
          onReady={handleOnReady}
          onError={handleOnError}
          onChangeState={handleOnChangeState}
        />
      </View>
    </View>
  );
};

export default YtVideo;

const styles = StyleSheet.create({
  headerText: {
    color: Colors.brandColor,
    fontSize: textScale(16),
    textTransform: "uppercase",
    textAlign: "center",
    // fontWeight: "700",
    fontFamily:FontFamily.Montserrat_SemiBold,
    padding: moderateScale(10),
    marginBottom: moderateVerticalScale(15),
  },
  main: {
    shadowRadius: moderateScale(3),
    width: "95%",
    alignSelf: "center",
    backgroundColor: Colors.back,
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
  },
});
