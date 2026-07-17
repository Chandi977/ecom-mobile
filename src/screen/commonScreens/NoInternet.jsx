import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import React from 'react';
import { ImagePath } from '../../utils/ImagePath';
import { moderateScale, textScale } from "../../utils/responsiveSize";

const NoInternet = () => {
  return (
    <View style={styles.main}>
      <View style={styles.contentContainer}>
        <Image
          source={ImagePath.spLogo}
          resizeMode="contain"
          style={styles.imageStyle}
        />
        <Text style={styles.titleText}>No Internet Connection</Text>
        <Text style={styles.subText}>
          Please check your connection and try again
        </Text>
        <ActivityIndicator size="small" color="#6c63ff" style={styles.loader} />
      </View>
    </View>
  );
};

export default NoInternet;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  imageStyle: {
    width: moderateScale(180),
    height: moderateScale(180),
    marginBottom: moderateScale(24),
    opacity: 0.9,
  },
  titleText: {
    fontSize: textScale(20),
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: moderateScale(8),
    letterSpacing: 0.3,
  },
  subText: {
    fontSize: textScale(14),
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  loader: {
    marginTop: moderateScale(8),
  },
});