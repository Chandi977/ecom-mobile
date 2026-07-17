import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { ImagePath } from '../../utils/ImagePath';

const Splash = () => {
  return (
    <View style={styles.main}>
      <Image
        source={ImagePath.splashBackground}
        resizeMode="cover"
        style={styles.imageStyle}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
});
