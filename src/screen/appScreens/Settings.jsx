import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../utils/Colors';
import { ImagePath } from '../../utils/ImagePath';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import WrapperContainer from '../../utils/WrapperContainer';
import StorageService from '../../utils/storageService';
import ApiService from '../../service/APIService';
import { parseStoredUser, showSuccessMessage } from '../../utils/HelperFunction';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Settings = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [isFocused]);

  const fetchUserData = async () => {
    try {
      const userStr = await StorageService.getItem('user_data');
      if (userStr) {
        setUser(parseStoredUser(userStr));
      } else {
        setUser(null);
      }
    } catch (e) {
      console.log('Error reading user in Settings:', e);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!user?._id) {
        Alert.alert('Unable to delete', 'No user account found to delete.');
        return;
      }

      setLoading(true);
      const response = await ApiService.DELETE_USER({ id: user._id });
      setLoading(false);

      if (response?.data?.success) {
        showSuccessMessage('Your account has been deleted.');
        await StorageService.clear();
        navigation.replace('Drawer');
      } else {
        Alert.alert(
          'Unable to delete',
          response?.data?.message ||
            'Something went wrong while deleting your account. Please try again.',
        );
      }
    } catch (error) {
      setLoading(false);
      console.log('Error deleting account:', error);
      Alert.alert(
        'Unable to delete',
        'Something went wrong while deleting your account. Please try again.',
      );
    }
  };

  const confirmDeleteAccount = () => {
    if (!user) return;
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDeleteAccount },
      ],
    );
  };

  const renderSettingItem = (icon, title, subtitle, onPress, disabled = false, iconType = 'feather') => {
    return (
      <TouchableOpacity
        style={[styles.itemRow, disabled && styles.disabledItem]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={styles.iconWrapper}>
          {iconType === 'feather' ? (
            <Feather name={icon} size={textScale(20)} color={Colors.brandColor} />
          ) : iconType === 'material' ? (
            <MaterialIcons name={icon} size={textScale(20)} color={Colors.brandColor} />
          ) : (
            <Ionicons name={icon} size={textScale(20)} color={Colors.brandColor} />
          )}
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
        </View>
        <Feather name="chevron-right" size={textScale(18)} color={Colors.text_grey} />
      </TouchableOpacity>
    );
  };

  return (
    <WrapperContainer isLoading={loading}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" color={Colors.black} size={textScale(24)} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={ImagePath.headerImage} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.headerPlaceholder} />
        </View>
 
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>Settings</Text>
 
          {/* Section: Account */}
          <Text style={styles.sectionHeader}>Account Settings</Text>
          <View style={styles.sectionCard}>
            {renderSettingItem(
              'user',
              'Personal Details',
              'Manage your profile information',
              () => navigation.navigate('PersonalDetails', { user }),
              !user
            )}
            <View style={styles.separator} />
            {renderSettingItem(
              'map-pin',
              'Shipping Address',
              'Manage your delivery addresses',
              () => navigation.navigate('Shipping Address', { routeName: 'Profile Address', user }),
              !user
            )}
          </View>
 
          {!user && (
            <TouchableOpacity 
              style={styles.loginBanner} 
              onPress={() => navigation.navigate('Login')}
            >
              <Feather name="log-in" size={textScale(18)} color={Colors.white} />
              <Text style={styles.loginBannerText}>Log in to manage your account</Text>
            </TouchableOpacity>
          )}
 
          {/* Section: Privacy & Security */}
          <Text style={styles.sectionHeader}>Privacy & Security</Text>
          <View style={styles.sectionCard}>
            {renderSettingItem(
              'shield',
              'Account Privacy',
              'Manage cookies, visibility, and tracking',
              () => navigation.navigate('AccountPrivacy')
            )}
            <View style={styles.separator} />
            {renderSettingItem(
              'file-text',
              'Privacy Policy',
              'Read our data collection and protection policy',
              () => navigation.navigate('Privacy Policy')
            )}
            <View style={styles.separator} />
            {renderSettingItem(
              'gavel',
              'Terms of Sale (T&C)',
              'View terms of purchasing and returns',
              () => navigation.navigate('Terms And Conditions'),
              false,
              'material'
            )}
            {user && (
              <>
                <View style={styles.separator} />
                {renderSettingItem(
                  'trash-2',
                  'Delete Account',
                  'Permanently delete your user account',
                  confirmDeleteAccount
                )}
              </>
            )}
          </View>

          {/* Section: Support & Info */}
          <Text style={styles.sectionHeader}>Support & Info</Text>
          <View style={styles.sectionCard}>
            {renderSettingItem(
              'info',
              'About Us',
              'Learn more about Prem Industries',
              () => navigation.navigate('About Us')
            )}
            <View style={styles.separator} />
            {renderSettingItem(
              'phone',
              'Contact Us',
              'Get in touch with customer support',
              () => navigation.navigate('Contact Us')
            )}
            <View style={styles.separator} />
            {renderSettingItem(
              'alert-circle',
              'Report an Issue / Feedback',
              'Submit a bug report or suggestions',
              () => navigation.navigate('Report')
            )}
          </View>

          <View style={styles.footerSpacing} />
        </ScrollView>
      </View>
    </WrapperContainer>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backGround_grey,
  },
  header: {
    height: moderateVerticalScale(55),
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border_grey,
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: moderateScale(140),
    height: moderateVerticalScale(35),
  },
  headerPlaceholder: {
    width: moderateScale(40),
  },
  scrollContent: {
    paddingHorizontal: moderateScale(15),
    paddingTop: moderateVerticalScale(10),
  },
  screenTitle: {
    fontSize: textScale(24),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
    marginBottom: moderateVerticalScale(15),
  },
  sectionHeader: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.text_grey,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: moderateVerticalScale(8),
    marginTop: moderateVerticalScale(15),
    paddingLeft: moderateScale(5),
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    paddingVertical: moderateVerticalScale(5),
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    paddingHorizontal: moderateScale(15),
  },
  disabledItem: {
    opacity: 0.4,
  },
  iconWrapper: {
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.yellow_background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(15),
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.brandColor,
  },
  itemSubtitle: {
    fontSize: textScale(11),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.text_grey,
    marginTop: moderateVerticalScale(2),
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border_grey,
    marginLeft: moderateScale(65),
  },
  loginBanner: {
    backgroundColor: Colors.forgetPassword,
    borderRadius: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(10),
    marginTop: moderateVerticalScale(10),
    gap: moderateScale(10),
  },
  loginBannerText: {
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_Medium,
    color: Colors.white,
  },
  footerSpacing: {
    height: moderateVerticalScale(40),
  },
});
