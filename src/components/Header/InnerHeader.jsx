import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import Colors from '../../utils/Colors';
import {
  moderateScale,
  textScale,
} from '../../utils/responsiveSize';
import { useNavigation } from '@react-navigation/native';

const InnerHeader = ({
  title,
  showBack = true,
  rightComponent,
  containerStyle,
  titleStyle,
  iconColor = Colors.black,
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Left (Back Button) */}
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={moderateScale(28)}
            color={iconColor}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: moderateScale(28) }} />
      )}

      {/* Title */}
      <Text style={[styles.title, titleStyle]}>
        {title}
      </Text>

      {/* Right (Optional Component) */}
      <View>
        {rightComponent ? rightComponent : <View style={{ width: moderateScale(28) }} />}
      </View>
    </View>
  );
};

export default InnerHeader;

InnerHeader.propTypes = {
  title: PropTypes.string.isRequired,
  showBack: PropTypes.bool,
  rightComponent: PropTypes.element,
  containerStyle: PropTypes.object,
  titleStyle: PropTypes.object,
  iconColor: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(10),
  },
  title: {
    fontSize: textScale(16),
    color: Colors.brandColor,
    fontWeight: '600',
  },
});