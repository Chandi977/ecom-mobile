import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../utils/Colors';
import { ImagePath } from '../../utils/ImagePath';
import {
  UserIcon,
  ShoppingCartIcon as CartSolid,
  HeartIcon,
  TruckIcon,
} from 'react-native-heroicons/solid';
import { ChevronRightIcon } from 'react-native-heroicons/outline';
import LogoutIcon from 'react-native-vector-icons/MaterialCommunityIcons';
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

const Profile = route => {
  console.log(route?.route?.name, 'Line 35');
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const isFocused = useIsFocused();
  const [cartCount, setCartCount] = useState(0);
  console.log(user,"user")

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
      console.log(userData, 'userData');
      if (userData?._id) {
        const response = await ApiService.GET_SPECIFIC_USER_DETAILS(
          userData._id,
        );
        console.log(response, 'response');
        setUser(response?.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchCartCount = async () => {
    try {
      const storedUser = await StorageService.getItem('user_data');
      const userData = parseStoredUser(storedUser);
      console.log(userData, 'user');
      if (userData?._id) {
        const response = await ApiService.GET_TOTAL_CART_COUNT(userData._id);
        setCartCount(response?.data?.count || 0);
      }
    } catch (error) {
      console.log('Error fetching cart count:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!user?._id) {
        Alert.alert('Unable to delete', 'No user account found to delete.');
        return;
      }

      const response = await ApiService.DELETE_USER({ id: user._id });

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

  const handleLogout = async () => {
    showSuccessMessage('You have successfully logged out');
    StorageService.clear();
    navigation.replace('Drawer');
  };
  return (
    <WrapperContainer isLoading={false}>
      <View style={styles.main}>
        <View style={styles.itemHolder}>
          {/* Menu Icon */}
          <TouchableOpacity
            style={styles.menuHolder}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              color={Colors.black}
              size={textScale(25)}
            />
          </TouchableOpacity>

          {/* Header Logo */}
          <View style={styles.imageViewHolder}>
            <Image
              style={styles.imageStyle}
              source={ImagePath.headerImage}
              resizeMode={'contain'}
            />
          </View>

          {/* Favorite and Cart Icons */}
          <View style={styles.iconHolder}>
            <TouchableOpacity onPress={() => navigation.navigate('Favorite')}>
              <Feather
                name="heart"
                size={moderateScale(30)}
                color={Colors.black}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.push('Cart')}
              style={styles.cartContainer}
            >
              <Feather
                name="shopping-cart"
                size={moderateScale(30)}
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
        {/* Name and image and their details sections */}
        <View style={[user ? styles.personDetails : styles.overlay]}>
          <View style={[styles.userImageContainer]}>
            {/* <Image
            source={ImagePath.defaultUserImage}
            style={styles.userImage}
            resizeMode="cover"
          /> */}
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>
                {user?.first_name
                  ? user?.first_name?.charAt(0).toUpperCase()
                  : 'N'}
                {user?.last_name
                  ? user?.last_name?.charAt(0).toUpperCase()
                  : 'A'}
              </Text>
            </View>
          </View>
          <View style={styles.nameHolder}>
            <Text style={styles.userName}>
              {(user && `${user.first_name} ${user.last_name}`) || 'Full Name'}
            </Text>
            <Text style={styles.userEmail}>
              {(user && `${user?.email_address}`) || 'email@email.com'}
            </Text>
          </View>
        </View>
        {/* Account Related Information */}
        <View style={styles.lowerView}>
          {/* My Order*/}
          <TouchableOpacity
            style={[styles.listItemHolder, { opacity: user ? 1 : 0.3 }]}
            disabled={!user}
            onPress={() => navigation.navigate('My Order', { user: user })}
          >
            <View style={styles.iconContainer}>
              <CartSolid size={textScale(25)} color={Colors.black} />
            </View>
            <View style={styles.textHolder}>
              <Text style={styles.listNameText}>My Orders</Text>
            </View>
            <View
              style={[styles.iconContainer, { backgroundColor: Colors.white }]}
            >
              <ChevronRightIcon size={textScale(20)} color={Colors.black} />
            </View>
          </TouchableOpacity>
          {/* WishList Sections */}
          <TouchableOpacity
            style={[styles.listItemHolder, { opacity: user ? 1 : 0.3 }]}
            disabled={!user}
            onPress={() => navigation.push('WishList2')}
          >
            <View style={styles.iconContainer}>
              <HeartIcon size={textScale(25)} color={Colors.black} />
            </View>
            <View style={styles.textHolder}>
              <Text style={styles.listNameText}>Wishlist</Text>
            </View>
            <View
              style={[styles.iconContainer, { backgroundColor: Colors.white }]}
            >
              <ChevronRightIcon size={textScale(20)} color={Colors.black} />
            </View>
          </TouchableOpacity>
          {/* Settings */}
          <TouchableOpacity
            style={styles.listItemHolder}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.iconContainer}>
              <Feather name="settings" size={textScale(25)} color={Colors.black} />
            </View>
            <View style={styles.textHolder}>
              <Text style={styles.listNameText}>Settings</Text>
            </View>
            <View
              style={[styles.iconContainer, { backgroundColor: Colors.white }]}
            >
              <ChevronRightIcon size={textScale(20)} color={Colors.black} />
            </View>
          </TouchableOpacity>
        </View>
        {/* Logout Button Sections */}
        <View style={styles.logoutButtonView}>
          <TouchableOpacity
            onPress={() => 
              user ? handleLogout() : navigation.navigate('Login')
            }
            style={styles.logoutHolder}
          >
            <LogoutIcon name="logout" color={Colors.red} size={textScale(30)} />
            <Text style={styles.listNameText}>
              {user ? 'Logout' : 'Log In /Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </WrapperContainer>
  );
};

export default Profile;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  personDetails: {
    width: '90%',
    backgroundColor: 'white',
    elevation: moderateScale(10),
    marginTop: moderateVerticalScale(15),
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    alignSelf: 'center',
    flexDirection: 'row',
    gap: moderateVerticalScale(10),
    borderWidth: moderateScale(0.3),
    borderColor: Colors.border_color,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(3.84),
  },
  userImageContainer: {
    height: moderateScale(70),
    width: moderateScale(70),
    alignItems: 'center',
  },
  userImage: {
    height: moderateScale(70),
    width: moderateScale(70),
    borderRadius: moderateScale(5),
    alignSelf: 'center',
  },
  userName: {
    color: Colors.black,
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_Bold,
  },
  userEmail: {
    color: 'gray',
    marginTop: moderateVerticalScale(5),
    fontFamily: FontFamily.Montserrat_Regular,
    fontSize: textScale(13),
  },
  nameHolder: {
    gap: moderateScale(3),
    justifyContent: 'center',
  },
  lowerView: {
    width: '90%',
    alignSelf: 'center',
    marginTop: '5%',
    padding: moderateScale(10),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    elevation: moderateScale(10),
    gap: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(3.84),
  },
  listItemHolder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  iconContainer: {
    width: '15%',
    backgroundColor: Colors.backGround_grey,
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  textHolder: {
    width: '65%',
  },
  listNameText: {
    fontSize: textScale(16),
    color: Colors.brandColor,
    padding: moderateScale(10),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  deleteAccountHolder: {
    width: '90%',
    alignSelf: 'center',
    marginTop: moderateVerticalScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    padding: moderateScale(10),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    borderWidth: 0.3,
    borderColor: Colors.border_color,
    elevation: moderateScale(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(2) },
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(3.84),
  },
  logoutButtonView: {
    backgroundColor: 'white',
    alignSelf: 'center',
    width: '90%',
    marginTop: moderateVerticalScale(20),
    borderWidth: 0.3,
    elevation: moderateScale(10),
    borderColor: Colors.border_color,
    borderRadius: moderateScale(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(3.84),
  },
  logoutHolder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    padding: moderateScale(10),
  },
  overlay: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginTop: moderateVerticalScale(15),
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    alignSelf: 'center',
    flexDirection: 'row',
    gap: moderateScale(10),
    borderWidth: 0.3,
    borderColor: Colors.border_color,
  },
  initialsContainer: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(75),
    backgroundColor: Colors.brandColor,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    // marginVertical: moderateScale(20),
  },
  initialsText: {
    fontSize: textScale(20),
    color: Colors.white,
    fontFamily: FontFamily.Montserrat_Bold,
  },
  itemHolder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuHolder: {
    width: '15%',
    alignItems: 'center',
  },
  imageViewHolder: {
    width: '50%',
    alignItems: 'center',
  },
  imageStyle: {
    width: '100%',
    height: moderateScale(45),
  },
  iconHolder: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  cartContainer: {
    position: 'relative', // To position the cart badge relative to the cart icon
  },
  cartBadge: {
    backgroundColor: Colors.red,
    position: 'absolute',
    right: -10,
    top: -5,
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.white,
    fontSize: textScale(12),
  },
});
