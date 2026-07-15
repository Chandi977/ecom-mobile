import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import ApiService from '../../service/APIService';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import WrapperContainer from '../../utils/WrapperContainer';
import StorageService from '../../utils/storageService';
import {
  parseStoredUser,
  showSuccessMessage,
} from '../../utils/HelperFunction';
import { unregisterFromPush } from '../../service/pushNotifications';

const Profile = route => {
  console.log(route?.route?.name, 'Line 35');
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const isFocused = useIsFocused();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCartCount();
  }, [isFocused]);

  useEffect(() => {
    fetchLoginData();
  }, [isFocused]);

  const fetchLoginData = async () => {
    try {
      const userStr = await StorageService.getItem('user_data');
      const userData = parseStoredUser(userStr);
      if (userData?._id) {
        const response = await ApiService.GET_SPECIFIC_USER_DETAILS(
          userData._id,
        );
        setUser(response?.data);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchCartCount = async () => {
    try {
      const storedUser = await StorageService.getItem('user_data');
      const userData = parseStoredUser(storedUser);
      if (userData?._id) {
        const response = await ApiService.GET_TOTAL_CART_COUNT(userData._id);
        setCartCount(response?.data?.count || 0);
      }
    } catch (error) {
      console.log('Error fetching cart count:', error);
    }
  };

  const handleLogout = async () => {
    showSuccessMessage('You have successfully logged out');
    // Unlink this device from the account first (reads fcmToken from storage),
    // then clear the session, so the previous user stops receiving pushes here.
    await unregisterFromPush();
    await StorageService.clear();
    navigation.replace('Drawer');
  };

  const getInitials = () => {
    const first = user?.first_name ? user.first_name.charAt(0).toUpperCase() : '';
    const last = user?.last_name ? user.last_name.charAt(0).toUpperCase() : '';
    return `${first}${last}` || 'G';
  };

  const renderMenuItem = (
    icon,
    title,
    subtitle,
    onPress,
    disabled = false,
  ) => {
    return (
      <TouchableOpacity
        style={[styles.itemRow, disabled && styles.disabledItem]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={styles.iconWrapper}>
          <Feather
            name={icon}
            size={textScale(20)}
            color={Colors.brandColor}
          />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.itemSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
        <Feather
          name="chevron-right"
          size={textScale(18)}
          color={Colors.text_grey}
        />
      </TouchableOpacity>
    );
  };

  return (
    <WrapperContainer isLoading={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              color={Colors.black}
              size={textScale(24)}
            />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={ImagePath.headerImage}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Favorite')}>
              <Feather
                name="heart"
                size={moderateScale(24)}
                color={Colors.black}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.push('Cart')}
              style={styles.cartContainer}
            >
              <Feather
                name="shopping-cart"
                size={moderateScale(24)}
                color={Colors.brandColor}
              />
              {cartCount >= 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle}>My Account</Text>

          {/* User summary card */}
          <View style={styles.userCard}>
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>{getInitials()}</Text>
            </View>
            <View style={styles.nameHolder}>
              <Text style={styles.userName} numberOfLines={1}>
                {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user
                  ? user.email_address
                  : 'Sign in to manage your account'}
              </Text>
              {user?.isVerified ? (
                <View style={styles.verifiedChip}>
                  <Feather
                    name="check-circle"
                    size={textScale(11)}
                    color={Colors.green}
                  />
                  <Text style={styles.verifiedChipText}>Verified</Text>
                </View>
              ) : null}
            </View>
          </View>

          {!user && (
            <TouchableOpacity
              style={styles.loginBanner}
              onPress={() => navigation.navigate('Login')}
            >
              <Feather
                name="log-in"
                size={textScale(18)}
                color={Colors.white}
              />
              <Text style={styles.loginBannerText}>
                Log in / Sign up to get started
              </Text>
            </TouchableOpacity>
          )}

          {/* Section: My Activity */}
          <Text style={styles.sectionHeader}>My Activity</Text>
          <View style={styles.sectionCard}>
            {renderMenuItem(
              'package',
              'My Orders',
              'Track, manage and reorder purchases',
              () => navigation.navigate('My Order', { user: user }),
              !user,
            )}
            <View style={styles.separator} />
            {renderMenuItem(
              'heart',
              'Wishlist',
              'Products you have saved for later',
              () => navigation.push('WishList2'),
              !user,
            )}
          </View>

          {/* Section: Account */}
          <Text style={styles.sectionHeader}>Account</Text>
          <View style={styles.sectionCard}>
            {renderMenuItem(
              'user',
              'Personal Details',
              'Manage your profile information',
              () => navigation.navigate('PersonalDetails', { user }),
              !user,
            )}
            <View style={styles.separator} />
            {renderMenuItem(
              'map-pin',
              'Shipping Address',
              'Manage your delivery addresses',
              () =>
                navigation.navigate('Shipping Address', {
                  routeName: 'Profile Address',
                  user,
                }),
              !user,
            )}
            <View style={styles.separator} />
            {renderMenuItem(
              'shield',
              'Account Privacy',
              'Notifications, recommendations and analytics',
              () => navigation.navigate('AccountPrivacy'),
              !user,
            )}
            <View style={styles.separator} />
            {renderMenuItem(
              'settings',
              'Settings',
              'App preferences, policies and support',
              () => navigation.navigate('Settings'),
            )}
          </View>

          {/* Logout / Login */}
          <TouchableOpacity
            style={styles.logoutCard}
            onPress={() => (user ? handleLogout() : navigation.navigate('Login'))}
          >
            <View style={[styles.iconWrapper, styles.logoutIconWrapper]}>
              <Feather
                name={user ? 'log-out' : 'log-in'}
                size={textScale(20)}
                color={Colors.red}
              />
            </View>
            <Text style={styles.logoutText}>
              {user ? 'Logout' : 'Log In / Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerSpacing} />
        </ScrollView>
      </View>
    </WrapperContainer>
  );
};

export default Profile;

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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(16),
  },
  cartContainer: {
    position: 'relative',
  },
  cartBadge: {
    backgroundColor: Colors.red,
    position: 'absolute',
    right: -8,
    top: -6,
    minWidth: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(3),
  },
  cartBadgeText: {
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.white,
    fontSize: textScale(10),
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
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(15),
    gap: moderateScale(14),
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  initialsContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: Colors.brandColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: textScale(20),
    color: Colors.white,
    fontFamily: FontFamily.Montserrat_Bold,
  },
  nameHolder: {
    flex: 1,
    gap: moderateVerticalScale(2),
    justifyContent: 'center',
  },
  userName: {
    color: Colors.brandColor,
    fontSize: textScale(17),
    fontFamily: FontFamily.Montserrat_Bold,
    textTransform: 'capitalize',
  },
  userEmail: {
    color: Colors.text_grey,
    fontFamily: FontFamily.Montserrat_Regular,
    fontSize: textScale(13),
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: moderateScale(4),
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: moderateScale(99),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateVerticalScale(2),
    marginTop: moderateVerticalScale(4),
  },
  verifiedChipText: {
    fontSize: textScale(10),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.green,
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
  logoutCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    paddingHorizontal: moderateScale(15),
    marginTop: moderateVerticalScale(20),
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutIconWrapper: {
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.red,
  },
  footerSpacing: {
    height: moderateVerticalScale(40),
  },
});
