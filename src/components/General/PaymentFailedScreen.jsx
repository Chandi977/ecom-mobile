import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import LottieView from 'lottie-react-native';
import Colors from '../../utils/Colors';
import FontFamily from '../../utils/FontFamily';

import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import { useNavigation } from '@react-navigation/native';
import StorageService from '../../utils/storageService';
import { parseStoredUser } from '../../utils/HelperFunction';
import ApiService from '../../service/APIService';

const PaymentFailedScreen = ({ route }) => {
  const navigation = useNavigation();

  const { orderId, paymentId, errorMessage } = route.params || {};
   const [user, setUser] = useState(null);


     useEffect(() => {
    fetchLoginData();
  }, []);

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

  return (
    <View style={styles.container}>
      {/* Animation */}
      <LottieView
        source={require('../../assets/images/payment_failed.json')}
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Heading */}
      <Text style={styles.title}>Payment Failed</Text>

      {/* Sub Heading */}
      <Text style={styles.subtitle}>
        Your payment could not be completed. Please try again later.
      </Text>

      {/* Details Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>{orderId || 'N/A'}</Text>
        </View>

        {/* <View style={styles.row}>
          <Text style={styles.label}>Payment ID</Text>
          <Text style={styles.value}>{paymentId || 'N/A'}</Text>
        </View> */}

        {/* <View style={styles.row}>
          <Text style={styles.label}>Reason</Text>
          <Text style={styles.value}>
            {errorMessage || 'Transaction Failed'}
          </Text>
        </View> */}
      </View>

      {/* Retry Button */}
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() =>
          navigation.navigate('My Order',{ user: user })
        }
      >
        <Text style={styles.retryText}>View Order Details</Text>
      </TouchableOpacity>

      {/* Order Details Button */}
      <TouchableOpacity
        style={styles.orderButton}
        onPress={() => navigation.navigate('Drawer')}
      >
        <Text style={styles.orderText}>Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentFailedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(20),
  },

  animation: {
    width: moderateScale(220),
    height: moderateScale(220),
  },

  title: {
    fontSize: textScale(26),
    color: '#E53935',
    fontFamily: FontFamily.Montserrat_Bold,
    marginTop: moderateVerticalScale(10),
  },

  subtitle: {
    fontSize: textScale(14),
    color: Colors.black,
    textAlign: 'center',
    marginTop: moderateVerticalScale(10),
    fontFamily: FontFamily.Montserrat_Medium,
    lineHeight: moderateScale(22),
  },

  card: {
    width: '100%',
    backgroundColor: '#FFF5F5',
    marginTop: moderateVerticalScale(30),
    borderRadius: moderateScale(15),
    padding: moderateScale(18),
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },

  row: {
    marginBottom: moderateVerticalScale(15),
  },

  label: {
    fontSize: textScale(13),
    color: '#777',
    fontFamily: FontFamily.Montserrat_Medium,
    marginBottom: moderateVerticalScale(5),
  },

  value: {
    fontSize: textScale(15),
    color: Colors.black,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },

  retryButton: {
    width: '100%',
    height: moderateScale(50),
    backgroundColor: Colors.brandColor,
    marginTop: moderateVerticalScale(30),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },

  retryText: {
    color: Colors.white,
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },

  orderButton: {
    width: '100%',
    height: moderateScale(50),
    borderWidth: 1.5,
    borderColor: Colors.brandColor,
    marginTop: moderateVerticalScale(15),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },

  orderText: {
    color: Colors.brandColor,
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
});
