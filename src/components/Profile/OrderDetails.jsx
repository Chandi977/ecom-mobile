import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../utils/Colors';
import { useNavigation } from '@react-navigation/native';
import InternalHeader from '../Header/InternalHeader';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import moment from 'moment';
import Entypo from 'react-native-vector-icons/Entypo';
import WrapperContainer from '../../utils/WrapperContainer';
import CommonButton from '../CommonButton';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_PAYMENT_KEY, RAZORPAY_SECRET_KEY } from '../General/secrets';
import axios from 'axios';
import base64 from 'react-native-base64';
import ApiService from '../../service/APIService';
import { showMessage } from 'react-native-flash-message';

const OrderDetails = ({ route }) => {
  const { item } = route.params;
  const status = item?.status;
  const statusSteps = {
    placed: 0,
    shipped: 1,
    out_for_delivery: 2,
    delivered: 3,
  };

  const currentStep =
    statusSteps[status] !== undefined ? statusSteps[status] : 0;

  const navigation = useNavigation();
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let total = 0;
    item?.items.forEach(orderItem => {
      total += orderItem?.price * orderItem?.quantity;
    });
    const calculatedDiscount = (
      item?.totalCartValue - item?.totalOrderValue
    ).toFixed(2);
    setDiscount(!isNaN(calculatedDiscount) ? calculatedDiscount : 0);
    setTotalAmount(total);
  }, [item?.items, item?.totalCartValue, item?.totalOrderValue]);

  const handleMakePayment = async (product) => {
    setLoading(true);
    try {
      console.log('===== COMPLETE PAYMENT FLOW STARTED =====');

      // STEP 1: CREATE RAZORPAY ORDER
      console.log('Creating Razorpay Order for amount:', product?.totalOrderValue);
      const auth = base64.encode(`${RAZORPAY_PAYMENT_KEY}:${RAZORPAY_SECRET_KEY}`);

      const razorpayResponse = await axios.post(
        'https://api.razorpay.com/v1/orders',
        {
          amount: Math.round(Number(product?.totalOrderValue) * 100),
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('RAZORPAY RESPONSE:', JSON.stringify(razorpayResponse?.data, null, 2));
      const razorpayData = razorpayResponse?.data;

      if (!razorpayData?.id) {
        showMessage({
          type: 'danger',
          icon: 'danger',
          message: razorpayData?.error?.description || 'Failed to create Razorpay Order',
        });
        return;
      }

      // STEP 2: OPEN RAZORPAY PAYMENT GATEWAY
      const options = {
        description: 'Complete Payment for Order',
        currency: 'INR',
        key: RAZORPAY_PAYMENT_KEY,
        order_id: razorpayData?.id,
        name: 'Prem Industries',
        prefill: {
          email: product?.email || '',
          contact: product?.phone || '',
          name: product?.name || '',
        },
        theme: {
          color: Colors.brandColor,
        },
      };

      console.log('OPENING RAZORPAY...', JSON.stringify(options, null, 2));

      let paymentResult;
      try {
        paymentResult = await RazorpayCheckout.open(options);
      } catch (razorpayError) {
        console.log('RAZORPAY ERROR:', razorpayError);
        // code 0 = user cancelled — do not navigate to failure screen
        if (razorpayError?.code === 0) {
          return;
        }
        const errorMessage =
          razorpayError?.description ||
          razorpayError?.message ||
          'Payment failed. Please try again.';
        showMessage({ type: 'danger', icon: 'danger', message: errorMessage });
        navigation.navigate('PaymentFailedScreen', {
          orderId: product?.orderId,
          errorMessage,
        });
        return;
      }

      console.log('PAYMENT SUCCESS:', JSON.stringify(paymentResult, null, 2));

      // STEP 3: UPDATE PAYMENT STATUS IN DB
      const updatePayload = {
        _id: product?._id,
        paymentProvider: 'razorpay',
        paymentStatus: 'Payment Verified',
        razorpayOrderId: paymentResult?.razorpay_order_id,
        razorpayPaymentId: paymentResult?.razorpay_payment_id,
        razorpaySignature: paymentResult?.razorpay_signature,
      };

      console.log('UPDATING PAYMENT STATUS:', JSON.stringify(updatePayload, null, 2));
      await ApiService.UPDATE_PAYMENT_STATUS(updatePayload);

      // STEP 4: NAVIGATE TO SUCCESS
      navigation.navigate('SuccessPage', {
        id: product?._id,
        orderObjectId: product?._id,
        orderId: product?.orderId,
        paymentId: paymentResult?.razorpay_payment_id,
      });
    } catch (error) {
      const backendData = error?.response?.data;
      console.log('COMPLETE PAYMENT ERROR:', error?.message);
      console.log('BACKEND ERROR BODY:', JSON.stringify(backendData, null, 2));

      const errorMessage =
        backendData?.message ||
        backendData?.error?.description ||
        error?.message ||
        'Something went wrong';

      showMessage({ type: 'danger', icon: 'danger', message: errorMessage });
      navigation.navigate('PaymentFailedScreen', {
        orderId: product?.orderId || '',
        errorMessage,
      });
    } finally {
      setLoading(false);
      console.log('===== COMPLETE PAYMENT FLOW COMPLETED =====');
    }
  };


  return (
    <WrapperContainer isLoading={loading}>
      <View style={{ flex: 1 }}>
        <InternalHeader title={'Order Details'} />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Id */}
          <View style={styles.listHolder}>
            <Text style={styles.orderHeaderTitle}>Order ID</Text>
            <Text style={styles.valueStyle}>
              {item?.orderId ? item?.orderId : 'N/A'}
            </Text>
          </View>
          {/* Total Order Value */}
          <View style={styles.listHolder}>
            <Text style={styles.keyStyle}>Total Cart Value</Text>
            <Text style={styles.valueStyle}>
              ₹{item?.totalCartValue ? item?.totalCartValue : 'N/A'}
            </Text>
          </View>
          {/* Payment Status */}
          <View style={styles.listHolder}>
            <Text style={styles.keyStyle}>Payment Status</Text>
            <Text style={styles.valueStyle}>
              {item?.paymentStatus ? item?.paymentStatus : 'N/A'}
            </Text>
          </View>
          {/* Order By */}
          <View style={styles.listHolder}>
            <Text style={styles.keyStyle}>Ordered by</Text>
            <Text style={styles.valueStyle}>
              {item?.name ? item?.name : 'N/A'}
            </Text>
          </View>
          {/* Address */}
          <View style={styles.listHolder}>
            <Text style={[styles.keyStyle, { width: '35%' }]}>Address</Text>
            <Text
              style={[
                styles.valueStyle,
                { lineHeight: scale(25), width: '65%' },
              ]}
            >
              {item?.landmark} {item?.town},{'India'}
            </Text>
          </View>
          {/* Pincode */}
          <View style={styles.listHolder}>
            <Text style={styles.keyStyle}>Pincode</Text>
            <Text style={styles.valueStyle}>{item?.pincode}</Text>
          </View>
          {/* Order Date */}
          <View style={styles.listHolder}>
            <Text style={[styles.keyStyle, { width: '45%' }]}>Order Date</Text>
            <Text
              style={[
                styles.valueStyle,
                { width: '55%', textTransform: 'uppercase' },
              ]}
            >
              {moment(item?.createdAt).format('DD/MM/YYYY | hh:mm A')}
            </Text>
          </View>
          {/* Coupon Code */}
          <View style={styles.listHolder}>
            <Text style={styles.keyStyle}>Coupon Code</Text>
            <Text style={styles.valueStyle}>{'N/A'}</Text>
          </View>
          {/* Product Details */}
          <View>
            <Text style={styles.orderHeaderTitle}>Product Details</Text>
            {item?.items.map((orderItem, index) => {
              console.log(orderItem, 'line 278');
              return (
                <View key={index} style={{}}>
                  <Text style={styles.productName}>
                    {orderItem?.product?.name ? orderItem?.product?.name : 'N/A'}
                  </Text>
                  <View style={styles.subDetailsHolder}>
                    <Entypo
                      name="dot-single"
                      color={Colors.brandColor}
                      size={moderateScale(20)}
                    />
                    <View style={styles.listInnerView}>
                      <Text style={[styles.keyStyle, { padding: 0 }]}>
                        Model
                      </Text>
                      <Text style={styles.valueStyle}>
                        {orderItem?.product?.model}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.subDetailsHolder}>
                    <Entypo
                      name="dot-single"
                      color={Colors.brandColor}
                      size={moderateScale(20)}
                    />
                    <View style={styles.listInnerView}>
                      <Text
                        style={[styles.keyStyle, { width: '70%', padding: 0 }]}
                      >
                        Number of Pack Size
                      </Text>
                      <Text style={[styles.valueStyle, { width: '30%' }]}>
                        {orderItem?.packSize}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.subDetailsHolder}>
                    <Entypo
                      name="dot-single"
                      color={Colors.brandColor}
                      size={moderateScale(20)}
                    />
                    <View style={styles.listInnerView}>
                      <Text style={[styles.keyStyle, { padding: 0 }]}>
                        Quantity
                      </Text>
                      <Text style={styles.valueStyle}>
                        {orderItem?.quantity}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
          {/* Price Breakdown */}
          <View>
            <Text style={styles.orderHeaderTitle}>Price Breakdown</Text>
            <View style={styles.listHolder}>
              <Text style={styles.keyStyle}>Cart Value:</Text>
              <Text style={styles.valueStyle}>₹{item?.totalCartValue}</Text>
            </View>
            <View style={styles.listHolder}>
              <Text style={[styles.keyStyle, { width: '60%' }]}>
                Shipping Charges:
              </Text>
              <Text style={[styles.valueStyle, { width: '40%' }]}>
                ₹{item?.shippingCost}
              </Text>
            </View>
            <View style={styles.listHolder}>
              <Text
                style={[styles.keyStyle, { width: '60%', color: Colors.green }]}
              >
                Discount:
              </Text>
              <Text
                style={[
                  styles.valueStyle,
                  { width: '40%', color: Colors.green },
                ]}
              >
                -₹{Math.abs(discount)}
              </Text>
            </View>
            <View
              style={[
                styles.listHolder,
                {
                  // borderBottomWidth: moderateScale(0),
                  // paddingBottom: moderateScale(5),
                },
              ]}
            >
              <Text style={styles.keyStyle}>GST:</Text>
              <Text style={styles.valueStyle}>
                ₹
                {(
                  item?.totalOrderValue -
                  (totalAmount + item?.shippingCost)
                ).toFixed(2)}
              </Text>
            </View>
            <View
              style={[styles.listHolder, { paddingBottom: moderateScale(10) }]}
            >
              <Text
                style={[
                  styles.keyStyle,
                  {
                    width: '60%',
                    fontSize: moderateScale(18),
                    fontFamily: FontFamily.Montserrat_Medium,
                    // fontWeight: '500',
                  },
                ]}
              >
                Total Order Value
              </Text>
              <Text
                style={[
                  styles.valueStyle,
                  {
                    width: '40%',
                    fontSize: moderateScale(18),
                    fontFamily: FontFamily.Montserrat_Medium,
                    // fontWeight: '500',
                  },
                ]}
              >
                ₹
                {item?.totalOrderValue
                  ? parseInt(item?.totalOrderValue)
                  : 'N/A'}
              </Text>
            </View>
          </View>
          {item?.paymentStatus == "Not Paid" && (
            <CommonButton
              text={'Complete Payment'}
              buttonStyle={styles.buttonStyle}
              textStyle={styles.textStyle}
              handleAction={()=>handleMakePayment(item)}
            />
          )}
        </ScrollView>
      </View>
    </WrapperContainer>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    width: '95%',
    alignSelf: 'center',
    marginTop: moderateVerticalScale(10),
    padding: moderateScale(5),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(5),
    borderColor: Colors.border_color2,
    marginBottom: moderateVerticalScale(10),
  },
  listHolder: {
    borderBottomWidth: moderateScale(1),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: Colors.border_color2,
    paddingRight: moderateScale(15),
  },
  productName: {
    width: '100%',
    lineHeight: moderateScale(25),
    // borderBottomWidth: moderateScale(1),
    borderColor: Colors.border_color2,
    // fontFamily: FontFamily.Montserrat_Regular,
    fontSize: textScale(14),
    color: Colors.messageText,
    fontWeight: '500',
    padding: moderateScale(10),
    textTransform: 'uppercase',
  },
  orderHeaderTitle: {
    color: Colors.iconColor,
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(16),
    padding: moderateScale(10),
  },

  keyStyle: {
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(12),
    color: Colors.messageText,
    // fontWeight: '400',
    padding: moderateScale(10),
    width: '50%',
  },
  valueStyle: {
    fontFamily: FontFamily.Montserrat_Regular,
    fontSize: textScale(14),
    // fontWeight: '400',
    color: Colors.black,
    textTransform: 'capitalize',
    textAlign: 'right',
    width: '50%',
  },
  subDetailsHolder: {
    paddingHorizontal: moderateScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: moderateScale(5),
    marginBottom: moderateVerticalScale(5),
  },
  listInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
  buttonStyle: {
    backgroundColor: Colors.brandColor,
    borderRadius: moderateScale(10),
    marginBottom: moderateVerticalScale(10),
    // width:moderateScale(100),
  },
  textStyle: {
    fontSize: textScale(12),
    color: Colors.white,
    fontFamily: FontFamily.Montserrat_Regular,
  },
});
