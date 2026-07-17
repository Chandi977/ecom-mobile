import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import Colors from '../utils/Colors';
import { moderateScale, textScale } from '../utils/responsiveSize';

const CommonButton = ({
  text,
  handleAction,
  buttonStyle,
  textStyle,
  isLoading = false,
  disabled = false,
  icon,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.main,
        buttonStyle,
        disabled && { backgroundColor: Colors.lightGray },
      ]}
      onPress={handleAction}
      activeOpacity={0.8}
      disabled={disabled}
      {...props}
    >
      {isLoading ? (
          <ActivityIndicator size={'large'} color={Colors.iconColor} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.text, { ...textStyle }]}>{text}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

CommonButton.propTypes = {
  text: PropTypes.string.isRequired,
  handleAction: PropTypes.func.isRequired,
  buttonStyle: PropTypes.object,
  textStyle: PropTypes.object,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CommonButton;

const styles = StyleSheet.create({
  main: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
  },
  text: {
    color: Colors.white,
    fontSize: textScale(14),
  },
  icon: {
    marginRight: moderateScale(3),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
