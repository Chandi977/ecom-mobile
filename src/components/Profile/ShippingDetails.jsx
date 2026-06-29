import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Colors from '../../utils/Colors';
import InternalHeader from '../Header/InternalHeader';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ApiService from '../../service/APIService';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import WrapperContainer from '../../utils/WrapperContainer';
import { showSuccessMessage } from '../../utils/HelperFunction';
import Feather from 'react-native-vector-icons/Feather';

const ShippingDetails = ({ route }) => {
  const { routeName, cartProducts, user, discountedAmount, couponCode } =
    route.params;
  console.log(routeName, 'line 25');
  // console.log(cartProducts,"line 31");
  console.log(user, 'Line 32');
  console.log(discountedAmount, 'Line 33');
  const navigation = useNavigation();
  const [userAddress, setUserAddress] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchSpecificUser = useCallback(async id => {
    if (!id) {
      setLoading(false);
      setUserAddress([]);
      return;
    }

    setLoading(true);
    const response = await ApiService.GET_SPECIFIC_USER_DETAILS(id);
    // console.log(response, "Line 30");
    if (response?.success) {
      console.log(response?.data?.contact_address, 'Line 60');
      setUserAddress(response?.data?.contact_address);
      setLoading(false);
    } else {
      Alert.alert('Error', 'Something went wrong');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecificUser(user?._id);
  }, [fetchSpecificUser, isFocused, user?._id]);

  const handleRemove = async (item, index) => {
    console.log(item, 'item');
    console.log('Clicked on the Remove Button', index);
    try {
      const data = {
        id: user?._id,
        contact_address: userAddress.filter(
          (_, addressIndex) => addressIndex !== index,
        ),
      };
      console.log(data, 'Line 70');
      const response = await ApiService.REMOVE_ADDRESS(data);
      if (response?.success === true) {
        showSuccessMessage('Address deleted Successfully');
        fetchSpecificUser(user?._id);
      } else {
        Alert.alert('Error', 'Unable to remove the Address');
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to Remove the Address, Try again');
    }
  };
  const handleSelectAddress = async item => {
    console.log('clicked on select address');
    navigation.navigate('Final Review', {
      contact_address: item,
      cartProducts: cartProducts,
      user: user,
      discountedAmount: discountedAmount,
      couponCode: couponCode,
    });
  };

  const handleAddAddress2 = async () => {
    console.log('Clicked on the Add Address', user?._id);
    navigation.navigate('AddAddress', {
      id: user?._id,
      isUpdating: false,
      existingAddresses: userAddress,
    });
    // const data = {
    //   id:user?._id,
    //   newAddress:{
    //     "name": "John Doe",
    //     "mobile": "9876543210",
    //     "gstin": "22ABCDE1234F2Z5",
    //     "address": "123, ABC Street",
    //     "pincode": "110001",
    //     "landmark": "Near XYZ Mall",
    //     "town": "New Delhi",
    //     "state": "Delhi",
    //     "email": "john.doe@example.com"
    //   }

    // }
  };

  const handleEditAddress = async (item, index) => {
    console.log('Clicked on the Edit Address Options', item);
    console.log(index, 'Line 98');
    navigation.navigate('AddAddress', {
      isUpdating: true,
      addressData: item,
      id: user?._id,
      index: index,
      existingAddresses: userAddress,
    });
  };
  const displayAddressCard = ({ item, index }) => {
    console.log(item, 'Line 136');
    return (
      <View style={styles.selectAddressCard} key={index}>
        <View style={styles.innerView}>
          <Text style={styles.customerName}>{item?.name || 'N/A'}</Text>
          <View style={styles.view}>
            <TouchableOpacity onPress={() => handleEditAddress(item, index)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            {routeName === 'Billing Address' && (
              <Text style={styles.editText}>|</Text>
            )}
            {routeName === 'Billing Address' && (
              <>
                {/* <Text style={styles.editText}>|</Text> */}
                <TouchableOpacity onPress={() => handleRemove(item, index)}>
                  <Text style={styles.editText}>Remove</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.view}>
          <Text style={styles.selectText}>Address:</Text>
          <Text style={styles.selectText1}>
            {[item?.address, item?.landmark].filter(Boolean).join(', ') ||
              'N/A'}
          </Text>
        </View>
        <View style={styles.view}>
          <Text style={styles.selectText}>City: </Text>
          <Text style={styles.selectText1}>{item?.town || 'N/A'}</Text>
        </View>
        <View style={styles.view}>
          <Text style={styles.selectText}>State: </Text>
          <Text style={styles.selectText1}>{item?.state || 'N/A'}</Text>
        </View>

        <View style={styles.view}>
          <Text style={styles.selectText}>Pin code: </Text>
          <Text style={styles.selectText1}>{item?.pincode || 'N/A'}</Text>
        </View>
        <View style={styles.view}>
          <Text style={styles.selectText}>Mobile Number: </Text>
          <Text style={styles.selectText1}>{`+91 ${item?.mobile}`} </Text>
        </View>
        <View style={styles.view}>
          <Text style={styles.selectText}>GSTIN: </Text>
          <Text style={[styles.selectText1, { textTransform: 'uppercase' }]}>
            {item?.gstin}
          </Text>
        </View>
        {routeName === 'Billing Address' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => handleSelectAddress(item)}
              activeOpacity={0.9}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Select Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <WrapperContainer isLoading={loading}>
      <View style={styles.main}>
        <InternalHeader title={'Shipping Details'} />
        <View style={styles.scrollView}>
          <View style={styles.topActionContainer}>
            <TouchableOpacity
              onPress={handleAddAddress2}
              activeOpacity={0.9}
              style={styles.topAddButton}
            >
              <Feather
                name="plus"
                size={textScale(18)}
                color={Colors.white}
              />
              <Text style={styles.buttonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            {userAddress?.length > 0 ? (
              <FlatList
                data={userAddress}
                renderItem={displayAddressCard}
                keyExtractor={(_, index) => String(index)}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noAddressContainer}>
                <Text style={styles.noAddressText}>No address available</Text>
              </View>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleAddAddress2}
              activeOpacity={0.9}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </WrapperContainer>
  );
};

export default ShippingDetails;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.back,
  },
  scrollView: {
    flex: 1,
  },
  topActionContainer: {
    width: '95%',
    alignSelf: 'center',
    alignItems: 'flex-end',
    paddingTop: moderateVerticalScale(10),
  },
  topAddButton: {
    backgroundColor: Colors.forgetPassword,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateVerticalScale(9),
    borderRadius: moderateScale(8),
  },
  listContent: {
    paddingBottom: moderateVerticalScale(90),
  },
  buttonContainer: {
    width: moderateScale(300),
    alignSelf: 'center',
    marginVertical: moderateVerticalScale(15),
  },
  buttonText: {
    fontSize: textScale(14),
    color: Colors.white,
    textTransform: 'uppercase',
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  button: {
    backgroundColor: Colors.forgetPassword,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
  },
  selectAddressCard: {
    marginVertical: moderateVerticalScale(10),
    borderWidth: moderateScale(0.3),
    borderColor: Colors.border_color,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
    width: '95%',
    alignSelf: 'center',
    gap: moderateScale(5),
  },
  customerName: {
    color: Colors.forgetPassword,
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  editText: {
    color: Colors.forgetPassword,
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  selectText: {
    fontSize: textScale(14),
    color: Colors.black,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  selectText1: {
    color: Colors.border_color,
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Regular,
    width: '75%',
  },
  view: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  loaderView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
  },
  loaderText: {
    fontSize: textScale(16),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  innerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noAddressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: moderateVerticalScale(20),
  },
  noAddressText: {
    fontSize: textScale(16),
    color: 'red',
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
});
