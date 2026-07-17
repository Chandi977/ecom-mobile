import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../utils/Colors';
import { BallIndicator } from 'react-native-indicators';
import InternalHeader from '../Header/InternalHeader';
import { useNavigation } from '@react-navigation/native';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import moment from 'moment';
import ApiService from '../../service/APIService';
import WrapperContainer from '../../utils/WrapperContainer';

const MyOrders = ({ route }) => {
  const navigation = useNavigation();
  const { user } = route.params;
  console.log(user, 'Line 29');
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await ApiService.GET_ALL_ORDERS(user?.email_address);
      console.log(response, 'Line 41');
      if (response?.success) {
        setOrderData(response?.data);
        setLoading(false);
      }
      if (!response?.success) {
        Alert.alert('No Order Found', response?.message);
        setLoading(false);
      }
    } catch (e) {
      console.log(e, 'Line 65');
    }finally{
      setLoading(false)
    }
  };

  const renderItem = ({ item }) => {
    console.log(item, 'line 54');
    return (
      <TouchableOpacity
        style={styles.renderItem}
        key={item?._id}
        onPress={() => navigation.navigate('OrderDetails', { item: item })}
      >
        <View style={styles.innerItemStyle}>
          <View style={styles.container01}>
            <View style={styles.innerContainer01}>
              <Text style={styles.nameStyle}>Order Id</Text>
              <Text
                style={[
                  styles.nameStyle,
                  {
                    fontSize: textScale(12),
                    fontFamily: FontFamily.Montserrat_SemiBold,
                  },
                ]}
              >
                {item?.orderId}
              </Text>
            </View>
            <View style={styles.innerContainer01}>
              <Text style={styles.nameStyle}>Order Time</Text>
              <Text
                style={[
                  styles.nameStyle,
                  {
                    fontSize: textScale(12),
                    fontFamily: FontFamily.Montserrat_SemiBold,
                  },
                ]}
              >
                {moment(item?.createdAt).format('LT')}
              </Text>
            </View>
            <View style={styles.innerContainer01}>
              <Text style={styles.nameStyle}>Order Date</Text>
              <Text
                style={[
                  styles.nameStyle,
                  {
                    fontSize: textScale(12),
                    fontFamily: FontFamily.Montserrat_SemiBold,
                  },
                ]}
              >
                {moment(item?.createdAt).format('DD/MM/YYYY')}
              </Text>
            </View>
            <View style={styles.innerContainer01}>
              <Text style={styles.nameStyle}>Total Order Value</Text>
              <Text
                style={[
                  styles.nameStyle,
                  {
                    fontSize: textScale(12),
                    fontFamily: FontFamily.Montserrat_SemiBold,
                  },
                ]}
              >
                ₹{Math.round(item?.totalOrderValue)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <WrapperContainer isLoading={loading}>
      <View style={styles.main}>
        <InternalHeader title={'Order History'} />
        <View style={{ flex: 1 }}>
          {orderData.length > 0 ? (
            <FlatList
              data={orderData}
              renderItem={renderItem}
              keyExtractor={(item, index) => index}
              style={styles.flatListStyle}
            />
          ) : (
            <View style={styles.NoOrderView}>
              <Text style={styles.loaderText}>
                You haven't order anything yet!
              </Text>
            </View>
          )}
        </View>
      </View>
    </WrapperContainer>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.back,
  },
  loaderText: {
    fontSize: textScale(16),
    color: Colors.brandColor,
    textAlign: 'center',
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  loaderView: {
    flex: 1,
    justifyContent: 'center',
    padding: moderateScale(10),
  },
  loaderContainer: {
    gap: moderateScale(30),
    width: '90%',
    alignSelf: 'center',
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    borderColor: Colors.brandColor,
    backgroundColor: Colors.white,
    paddingTop: moderateVerticalScale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  renderItem: {
    width: '96%',
    alignSelf: 'center',
    borderRadius: moderateScale(5),
    borderColor: Colors.border_grey,
    backgroundColor: Colors.white,
  },

  nameText: {
    fontSize: textScale(14),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_Regular,
    // fontWeight: '400',
    textAlign: 'center',
  },
  nameStyle: {
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.messageText,
    fontSize: textScale(14),
    textTransform: 'uppercase',
  },
  NoOrderView: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatListStyle: {
    borderWidth: moderateScale(1),
    marginVertical: moderateScale(10),
    width: '95%',
    alignSelf: 'center',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    borderColor: Colors.border_color2,
  },
  innerItemStyle: {
    borderBottomWidth: moderateScale(1),
    borderColor: Colors.border_color2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(10),
  },
  container01: {
    width: '100%',
    // borderRightWidth: moderateScale(1),
    borderColor: Colors.border_color2,
    // paddingRight: moderateScale(10),
    gap: moderateVerticalScale(5),
  },
  innerContainer01: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
