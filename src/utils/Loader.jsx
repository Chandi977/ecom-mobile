import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import React from 'react';
import Colors from './Colors';
import PropTypes from 'prop-types';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  textScale,
} from './responsiveSize';

const LoadingComponent = () => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size={'large'} color={Colors.iconColor} />
    </View>
  );
};

const Loader = ({ isLoading }) => {
  if (isLoading) {
    return (
      <Modal visible={isLoading} transparent={true} statusBarTranslucent={true}>
        <LoadingComponent />
      </Modal>
    );
  }
  return null;
};

Loader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

export default Loader;

const styles = StyleSheet.create({
  loaderContainer: {
    borderWidth: moderateScale(2),
    borderColor: Colors.white,
    position: 'absolute',
    top: '45%',
    gap: moderateScale(12),
    width: moderateScale(75),
    height: moderateScale(75),
    alignSelf: 'center',
    padding: moderateScale(10),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    elevation: moderateScale(5),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.textColor,
    fontSize: textScale(15),
    textTransform: 'capitalize',
    letterSpacing: scale(0.2),
    textAlign: 'center',
    marginTop: moderateVerticalScale(2),
  },
});
