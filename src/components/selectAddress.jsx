import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../utils/Colors';
import SuccessPopup from './General/SuccessPopup';
import ApiService from '../service/APIService';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_PAYMENT_KEY, RAZORPAY_SECRET_KEY } from './General/secrets';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  textScale,
} from '../utils/responsiveSize';
import FontFamily from '../utils/FontFamily';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { showMessage } from 'react-native-flash-message';
import WrapperContainer from '../utils/WrapperContainer';
import InternalHeader from './Header/InternalHeader';
import CommonButton from './CommonButton';
import base64 from 'react-native-base64';
import { showErrorMessage } from '../utils/HelperFunction';
import WebView from 'react-native-webview';
import axios from 'axios';

const SelectAddress = ({ route }) => {
  const navigation = useNavigation();
  const { cartProducts, user, contact_address, discountedAmount, couponCode } =
    route.params;
  const [servicePinCode, setServicePinCode] = useState(
    contact_address?.pincode,
  );
  // console.log(contact_address,"contact_address")
  const [loading, setLoading] = useState(false);
  const [showWebCheckout, setShowWebCheckout] = useState(false);
  const [webCheckoutUrl, setWebCheckoutUrl] = useState(null);
  const address1 = [contact_address];
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryType, setDeliveryType] = useState('Standard Delivery');
  const [shippingAmount, setShippingAmount] = useState(0);
  // const [shippingMessage, setShippingMessage] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const VALID_ZIP_CODES = [
    '122022',
    '201015',
    '121000',
    '110066',
    '122234',
    '110101',
    '201306',
    '124505',
    '122002',
    '110007',
    '122010',
    '110080',
    '122016',
    '110022',
    '110079',
    '121001',
    '201313',
    '110084',
    '122001',
    '110102',
    '201014',
    '110069',
    '110039',
    '110119',
    '110605',
    '110043',
    '123507',
    '110049',
    '110030',
    '201318',
    '122100',
    '110065',
    '121010',
    '110011',
    '110025',
    '122207',
    '122007',
    '121004',
    '110067',
    '122003',
    '201301',
    '201106',
    '122055',
    '201007',
    '122004',
    '110073',
    '110086',
    '201018',
    '110003',
    '201021',
    '110078',
    '122220',
    '110047',
    '201206',
    '110051',
    '201316',
    '110503',
    '110013',
    '121005',
    '121102',
    '245304',
    '201002',
    '110031',
    '201019',
    '122231',
    '122226',
    '110016',
    '124508',
    '110090',
    '110089',
    '203208',
    '110036',
    '110014',
    '110608',
    '201102',
    '110085',
    '110505',
    '110104',
    '110103',
    '110059',
    '122230',
    '110054',
    '122012',
    '122102',
    '110100',
    '110042',
    '123003',
    '201101',
    '110052',
    '110020',
    '110091',
    '110604',
    '110504',
    '110401',
    '110098',
    '110012',
    '110048',
    '201012',
    '122011',
    '110301',
    '122006',
    '110403',
    '110015',
    '201020',
    '110607',
    '122101',
    '201309',
    '122206',
    '110063',
    '121003',
    '110096',
    '201304',
    '110046',
    '122203',
    '111112',
    '110019',
    '122227',
    '110110',
    '110117',
    '201312',
    '122009',
    '111120',
    '121011',
    '110507',
    '121014',
    '201005',
    '201016',
    '201017',
    '201315',
    '110609',
    '110071',
    '110058',
    '201006',
    '122232',
    '201307',
    '110108',
    '110113',
    '122005',
    '110088',
    '110094',
    '122215',
    '122223',
    '201300',
    '121013',
    '122208',
    '110502',
    '110033',
    '122211',
    '110005',
    '110057',
    '110006',
    '110083',
    '110040',
    '122013',
    '110115',
    '201009',
    '110125',
    '201000',
    '110072',
    '124501',
    '110018',
    '110402',
    '121101',
    '122210',
    '122218',
    '110076',
    '110093',
    '201303',
    '122017',
    '210005',
    '110092',
    '201305',
    '201317',
    '110017',
    '110037',
    '110029',
    '110053',
    '110510',
    '122204',
    '122019',
    '201003',
    '110026',
    '121012',
    '110024',
    '110027',
    '110118',
    '110050',
    '122209',
    '121015',
    '110302',
    '110009',
    '110508',
    '110095',
    '110116',
    '110501',
    '110060',
    '122213',
    '122214',
    '110114',
    '210003',
    '201013',
    '110028',
    '201103',
    '110112',
    '110044',
    '110512',
    '110099',
    '110511',
    '110105',
    '121009',
    '110106',
    '110001',
    '110034',
    '110082',
    '110056',
    '124507',
    '201008',
    '203207',
    '110097',
    '122015',
    '110062',
    '110121',
    '201314',
    '110603',
    '122217',
    '110068',
    '110509',
    '110008',
    '110077',
    '110606',
    '122228',
    '110120',
    '121006',
    '122224',
    '201310',
    '201311',
    '122098',
    '110124',
    '122021',
    '110075',
    '110506',
    '122225',
    '110081',
    '110045',
    '122020',
    '121002',
    '110122',
    '122216',
    '110064',
    '110010',
    '110070',
    '110087',
    '110002',
    '122233',
    '122109',
    '110021',
    '110074',
    '122229',
    '122000',
    '121008',
    '110109',
    '124506',
    '110004',
    '122018',
    '201302',
    '110107',
    '110023',
    '110061',
    '110038',
    '110601',
    '110055',
    '110032',
    '110602',
    '201004',
    '201010',
    '122219',
    '201001',
    '110035',
    '201308',
    '110041',
    '201011',
    '121007',
    '122008',
    '122014',
  ];
  const isValidZip = VALID_ZIP_CODES.includes(servicePinCode);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  function getCartTotal() {
    return cartProducts.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }

  function calculateAmounts() {
    let totalAmount12 = 0;
    let totalAmount18 = 0;
    let subtotal = 0;

    cartProducts.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      if (item.category === '6557deab301ec4f2f4266131') {
        totalAmount12 += itemTotal;
      } else {
        totalAmount18 += itemTotal;
      }
    });

    const gst12Charges = totalAmount12 * 0.12;
    const gst18Charges = totalAmount18 * 0.18;
    const shippingGST = shippingAmount * 0.18;
    const totalGST = gst12Charges + gst18Charges + shippingGST;

    return {
      subtotal,
      totalAmount12,
      totalAmount18,
      gst12Charges,
      gst18Charges,
      totalGST,
      shippingGST,
    };
  }

  const {
    subtotal,
    totalAmount12,
    totalAmount18,
    gst12Charges,
    gst18Charges,
    shippingGST,
    totalGST,
  } = calculateAmounts();

  const totalOrderValue = getCartTotal() + parseFloat(totalGST.toFixed(2));

  useEffect(() => {
    console.log(totalOrderValue, 'Line 412');
    console.log(shippingAmount, 'Line 413');
    console.log(discountedAmount, 'Line 414');
    console.log(shippingGST, 'line 423');
    // Recalculate final price whenever shippingAmount, discountedAmount, or totalOrderValue change
    const newFinalPrice = // totalOrderValue +
      // shippingAmount -
      // discountedAmount +
      // shippingGST
      (
        totalOrderValue +
        shippingAmount +
        // shippingGST -
        discountedAmount
      ).toFixed(2);
    setFinalPrice(newFinalPrice);
  }, [shippingAmount, discountedAmount, totalOrderValue, shippingGST]);

  // const CREATE_RAZORPAY_ORDER = async amount => {
  //   try {
  //     console.log('Creating Razorpay order with amount:', amount);

  //     const auth = base64.encode(
  //       `${RAZORPAY_PAYMENT_KEY}:${RAZORPAY_SECRET_KEY}`,
  //     );

  //     console.log('Auth encoded successfully');

  //     const response = await fetch('https://api.razorpay.com/v1/orders', {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Basic ${auth}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         amount: Math.round(Number(amount) * 100),
  //         currency: 'INR',
  //         receipt: `receipt_${Date.now()}`,
  //       }),
  //     });

  //     console.log('Razorpay API Response Status:', response.status);

  //     const data = await response.json();

  //     console.log('Razorpay Order Response:', JSON.stringify(data, null, 2));

  //     if (data?.id) {
  //       console.log('Order created successfully with ID:', data.id);
  //       return data;
  //     } else if (data?.error) {
  //       console.log('Razorpay API Error:', data.error);
  //       throw new Error(data.error?.description || 'Failed to create order');
  //     } else {
  //       console.log('Unexpected response structure:', data);
  //       return data;
  //     }
  //   } catch (error) {
  //     console.log('CREATE RAZORPAY ORDER ERROR:', error);
  //     console.log('Error Details:', error.message);
  //     return null;
  //   }
  // };

  // const OrderPlace = async () => {
  //   const items = cartProducts.map(x => {
  //     return {
  //       product: x?.product?._id,
  //       quantity: x?.quantity,
  //       price: x?.price,
  //       packSize: x?.packSize,
  //     };
  //   });

  //   let data = {
  //     items: items,
  //     name: contact_address?.name,
  //     gstin: contact_address?.gstin,
  //     address: contact_address?.address,
  //     pincode: contact_address?.pincode,
  //     landmark: contact_address?.landmark,
  //     town: contact_address?.town,
  //     email: contact_address?.email,
  //     phone: contact_address?.mobile,
  //     state: contact_address?.state,
  //     user: user?._id,
  //     totalOrderValue: finalPrice,
  //     totalCartValue: totalOrderValue,
  //     shippingCost: shippingAmount ? shippingAmount : 0,
  //     taxableAmount: totalGST.toFixed(2),
  //     paymentStatus: 'Not Paid',
  //     utrNumber: '0',
  //     couponCode: couponCode,
  //   };
  //   setLoading(true);
  //   try {
  //     console.log('Calling PLACE_ORDER API...');
  //     const response = await ApiService.PLACE_ORDER(data);
  //     console.log(
  //       'Place Order API Response:',
  //       JSON.stringify(response, null, 2),
  //     );
  //     if (response?.success) {
  //       const dbOrderId = response?.data?.orderId;
  //       const dbOrderId2 = response?.data?._id;
  //       const totalOrderValue = response?.data?.totalOrderValue;

  //       console.log('Order placed successfully in DB');
  //       console.log('DB Order ID:', dbOrderId);
  //       console.log('DB Order ObjectId:', dbOrderId2);
  //       console.log('Total Order Value for Razorpay:', totalOrderValue);
  //       console.log('Creating Razorpay order...');

  //       const razorpayOrder = await CREATE_RAZORPAY_ORDER(totalOrderValue);
  //       try {
  //         console.log('Creating Razorpay order with amount:', amount);
  //         const auth = base64.encode(
  //           `${RAZORPAY_PAYMENT_KEY}:${RAZORPAY_SECRET_KEY}`,
  //         );
  //         console.log('Auth encoded successfully');
  //         const response = await fetch('https://api.razorpay.com/v1/orders', {
  //           method: 'POST',
  //           headers: {
  //             Authorization: `Basic ${auth}`,
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //             amount: Math.round(Number(amount) * 100),
  //             currency: 'INR',
  //             receipt: `receipt_${Date.now()}`,
  //           }),
  //         });

  //         console.log('Razorpay API Response Status:', response.status);

  //         const data = await response.json();

  //         console.log(
  //           'Razorpay Order Response:',
  //           JSON.stringify(data, null, 2),
  //         );

  //         if (data?.id) {
  //           console.log('Order created successfully with ID:', data.id);
  //           return data;
  //         } else if (data?.error) {
  //           console.log('Razorpay API Error:', data.error);
  //           throw new Error(
  //             data.error?.description || 'Failed to create order',
  //           );
  //         } else {
  //           console.log('Unexpected response structure:', data);
  //           return data;
  //         }
  //       } catch (error) {
  //         console.log('CREATE RAZORPAY ORDER ERROR:', error);
  //         console.log('Error Details:', error.message);
  //         return null;
  //       }

  //       // console.log('Razorpay Order Result:', JSON.stringify(razorpayOrder, null, 2));

  //       if (razorpayOrder?.id) {
  //         console.log(
  //           'Razorpay order created successfully. Opening payment gateway...',
  //         );
  //         OPEN_PAYMENT_GATEWAY(razorpayOrder?.id, dbOrderId, dbOrderId2);
  //       } else {
  //         console.log('Razorpay order creation failed or returned empty');
  //         showMessage({
  //           type: 'danger',
  //           icon: 'danger',
  //           message: 'Failed to create Razorpay Order',
  //         });
  //       }
  //     } else {
  //       console.log('PLACE_ORDER API returned success: false');
  //       showMessage({
  //         type: 'danger',
  //         icon: 'danger',
  //         message: response?.message || 'Failed to place order',
  //       });
  //     }
  //   } catch (e) {
  //     console.log('ORDER PLACE ERROR:', e);
  //     console.log('Error Message:', e.message);
  //     showMessage({
  //       type: 'danger',
  //       icon: 'danger',
  //       message: 'Failed to place order. Please try again.',
  //     });
  //   } finally {
  //     setLoading(false);
  //     console.log('===== ORDER PLACE COMPLETED =====');
  //   }
  // };

  //   ID: shikhartripathi08@gmail.com
  // Password: PremPackaging@123

  // 4017 0424 7600 5520
  // const OPEN_PAYMENT_GATEWAY = (razorpayOrderId, dbOrderId, dbOrderId2) => {
  //   console.log('OPEN_PAYMENT_GATEWAY called on platform:', Platform.OS);

  //   const options = {
  //     description: 'Make Payment for Cart Products',
  //     currency: 'INR',
  //     key: RAZORPAY_PAYMENT_KEY,
  //     order_id: razorpayOrderId,
  //     name: 'Prem Industries',
  //     prefill: {
  //       email: user?.email_address || '',
  //       contact: user?.mobile_number || '',
  //       name: `${user?.first_name || ''} ${user?.last_name || ''}`,
  //     },
  //     theme: {
  //       color: Colors.brandColor,
  //     },
  //   };

  //   console.log(
  //     'Options being sent to Razorpay:',
  //     JSON.stringify(options, null, 2),
  //   );
  //   console.log('Razorpay Order ID:', razorpayOrderId);
  //   console.log('Final Price:', finalPrice);
  //   console.log('Attempting to open Razorpay checkout...');

  //   try {
  //     console.log('Calling RazorpayCheckout.open()...');
  //     const paymentPromise = RazorpayCheckout.open(options);
  //     console.log('RazorpayCheckout.open() returned, waiting for result...');

  //     let timeoutId = null;
  //     let isSettled = false;

  //     // On iOS, if native module doesn't respond in 10 seconds, use web checkout as fallback
  //     const timeoutPromise = new Promise((_, reject) => {
  //       timeoutId = setTimeout(() => {
  //         if (!isSettled) {
  //           isSettled = true;
  //           console.log(
  //             'Native Razorpay module not responding on iOS, using web checkout fallback...',
  //           );
  //           reject(new Error('Switching to web checkout'));
  //         }
  //       }, 10000);
  //     });

  //     Promise.race([paymentPromise, timeoutPromise])
  //       .then(data => {
  //         isSettled = true;
  //         clearTimeout(timeoutId);
  //         console.log('Payment Success - Data:', JSON.stringify(data, null, 2));

  //         if (data?.razorpay_payment_id) {
  //           console.log('Payment ID received:', data.razorpay_payment_id);
  //           navigation.navigate('SuccessPage', {
  //             id: user?._id,
  //             orderId: dbOrderId,
  //             paymentId: data?.razorpay_payment_id,
  //           });
  //         } else {
  //           console.log('No payment ID in response');
  //           navigation.navigate('PaymentFailedScreen', {
  //             orderId: dbOrderId,
  //             errorMessage: 'Payment response incomplete. Please try again.',
  //           });
  //         }
  //       })
  //       .catch(error => {
  //         if (!isSettled) {
  //           isSettled = true;
  //           clearTimeout(timeoutId);
  //         }

  //         // If native checkout timed out, use web checkout
  //         if (error?.message === 'Switching to web checkout') {
  //           console.log('Opening web checkout for iOS...');
  //           openWebCheckout(razorpayOrderId, dbOrderId);
  //           return;
  //         }

  //         console.log('Payment Error - Full Error:', error);
  //         console.log('Error Code:', error?.code);
  //         console.log('Error Description:', error?.description);
  //         console.log('Error Message:', error?.message);

  //         if (error?.code === 0) {
  //           console.log('User cancelled payment');
  //           return;
  //         }

  //         const errorMessage =
  //           error?.description ||
  //           error?.message ||
  //           error?.toString() ||
  //           'Payment failed. Please try again.';

  //         navigation.navigate('PaymentFailedScreen', {
  //           orderId: dbOrderId,
  //           errorMessage: errorMessage,
  //         });
  //       });
  //   } catch (error) {
  //     console.log('Exception thrown while opening Razorpay:', error);
  //     console.log('Exception Message:', error?.message);
  //     // Fallback to web checkout on exception
  //     openWebCheckout(razorpayOrderId, dbOrderId);
  //   }
  // };

  const handleWebCheckoutMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Web checkout message:', data);

      if (data.type === 'success' && data.razorpay_payment_id) {
        setShowWebCheckout(false);
        navigation.navigate('SuccessPage', {
          id: user?._id,
          orderId: data.orderId,
          paymentId: data.razorpay_payment_id,
        });
      } else if (data.type === 'error') {
        setShowWebCheckout(false);
        navigation.navigate('PaymentFailedScreen', {
          orderId: data.orderId,
          errorMessage: data.message || 'Payment failed',
        });
      }
    } catch (error) {
      console.log('Error handling web checkout message:', error);
    }
  };

  const displayAddressCard = ({ item, index }) => {
    return (
      <View style={styles.selectAddressCard} key={index}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={styles.customerName}>{item?.name}</Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', gap: moderateScale(10) }}
            onPress={() => navigation.goBack()}
          >
            <Text
              style={{
                fontSize: textScale(13),
                fontFamily: FontFamily?.Montserrat_Medium,
                color: Colors.brandColor,
              }}
            >
              Change Address
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: moderateVerticalScale(5) }}>
          <View style={{ width: '100%' }}>
            <Text style={styles.selectText1}>
              {item?.landmark}, {item?.town}, {item?.state}, {item?.pincode}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  //  const placeOrder = async () => {
  //   await OPEN_PAYMENT_GATEWAY();
  // };

  // const OPEN_PAYMENT_GATEWAY = async () => {
  //   const amount1 = (totalOrderValue.toFixed(2) - discountedAmount).toFixed(2);
  //   // const amount1 = finalPrice.toFixed(2);
  //   console.log(amount1, "line 388");
  //   var options = {
  //     description: "Make Payment for Cart Products",
  //     image: "https://www.store.prempackaging.com/pp_logo_1.png",
  //     currency: "INR",
  //     key: RAZORPAY_PAYMENT_KEY,
  //     amount: (finalPrice * 100).toFixed(2),
  //     name: "Prem Industries",
  //     prefill: {
  //       email: user?.email_address ? user?.email_address : "",
  //       contact: user?.mobile_number ? user?.mobile_number : "",
  //       name: `${user?.first_name} ${user?.last_name}`,
  //     },
  //     theme: { color: Colors.brandColor },
  //   };
  //   RazorpayCheckout.open(options)
  //     .then((data) => {
  //       console.log(data, "Line 113");
  //       if (data?.razorpay_payment_id) {
  //         OrderPlace(data?.razorpay_payment_id);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error, "Line 412");
  //       showMessage({
  //         type: "danger",
  //         icon: "danger",
  //         message: `Transaction Failed.${
  //           Platform.OS === "ios" ? error.description : ""
  //         }`,
  //       });
  //       console.log(`Error: ${error.code} | ${error.description}`, "Line 113");
  //     });
  // };

  // const OrderPlace = async () => {
  //   console.log("hii", "Line 121");
  //   const items = cartProducts.map((x) => {
  //     return {
  //       product: x?.product?._id,
  //       quantity: x?.quantity,
  //       price: x?.price,
  //       packSize: x?.packSize,
  //     };
  //   });
  //   let data = {
  //     items: items,
  //     name: contact_address?.name,
  //     gstin: contact_address?.gstin,
  //     address: contact_address?.address,
  //     pincode: contact_address?.pincode,
  //     landmark: contact_address?.landmark,
  //     town: contact_address?.town,
  //     email: contact_address?.email,
  //     state: contact_address?.state,
  //     user: user?._id,
  //     totalOrderValue: finalPrice,
  //     totalCartValue: totalOrderValue,
  //     shippingCost: shippingAmount ? shippingAmount : 0,
  //     taxableAmount: totalGST.toFixed(2),
  //     paymentStatus: "Paid",
  //     utrNumber: "0",
  //   };
  //   console.log(data, "Line 155");
  //   setLoading(true);
  //   try {
  //     const response = await ApiService.PLACE_ORDER(data);
  //     console.log(response, "Line 159");
  //     setLoading(false);
  //     if (response?.success) {
  //       navigation.navigate("SuccessPage", { id: user?._id });
  //     }
  //   } catch (e) {
  //     console.log(e, "Line 174");
  //   }
  // };


 

const OrderPlace = async () => {
  setLoading(true);

  try {
    console.log('===== ORDER FLOW STARTED =====');

    // STEP 1: PREPARE ITEMS
    const items = cartProducts.map(x => ({
      product: x?.product?._id,
      quantity: x?.quantity,
      price: x?.price,
      packSize: x?.packSize,
    }));

    // STEP 2: CREATE PAYLOAD
    const payload = {
      items: items,
      name: contact_address?.name,
      gstin: contact_address?.gstin,
      address: contact_address?.address,
      pincode: contact_address?.pincode,
      landmark: contact_address?.landmark,
      town: contact_address?.town,
      email: contact_address?.email,
      phone: contact_address?.mobile,
      state: contact_address?.state,
      user: user?._id,
      totalOrderValue: finalPrice,
      totalCartValue: totalOrderValue,
      shippingCost: shippingAmount ? shippingAmount : 0,
      taxableAmount: totalGST.toFixed(2),
      paymentStatus: 'Not Paid',
      utrNumber: '0',
      couponCode: couponCode,
    };

    // STEP 3: PLACE ORDER API
    console.log('Calling PLACE_ORDER API...');

    const orderResponse = await ApiService.PLACE_ORDER(payload);

    console.log(
      'PLACE_ORDER RESPONSE:',
      JSON.stringify(orderResponse, null, 2),
    );

    if (!orderResponse?.success) {
      showMessage({
        type: 'danger',
        icon: 'danger',
        message: orderResponse?.message || 'Failed to place order',
      });

      return;
    }

    // STEP 4: GET ORDER DETAILS
    const dbOrderId = orderResponse?.data?.orderId;
    const dbOrderObjectId = orderResponse?.data?._id;
    const totalAmount = orderResponse?.data?.totalOrderValue;

    console.log('DB ORDER ID:', dbOrderId);
    console.log('DB ORDER OBJECT ID:', dbOrderObjectId);
    console.log('TOTAL AMOUNT:', totalAmount);

    // STEP 5: CREATE RAZORPAY ORDER USING AXIOS
    console.log('Creating Razorpay Order...');

    const auth = base64.encode(
      `${RAZORPAY_PAYMENT_KEY}:${RAZORPAY_SECRET_KEY}`,
    );

    const razorpayResponse = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: Math.round(Number(totalAmount) * 100),
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

    console.log(
      'RAZORPAY RESPONSE:',
      JSON.stringify(razorpayResponse?.data, null, 2),
    );

    const razorpayData = razorpayResponse?.data;

    // STEP 6: CHECK RAZORPAY ORDER
    if (!razorpayData?.id) {
      showMessage({
        type: 'danger',
        icon: 'danger',
        message:
          razorpayData?.error?.description ||
          'Failed to create Razorpay Order',
      });

      return;
    }

    // STEP 7: OPEN PAYMENT GATEWAY
    const options = {
      description: 'Make Payment for Cart Products',
      currency: 'INR',
      key: RAZORPAY_PAYMENT_KEY,
      order_id: razorpayData?.id,
      name: 'Prem Industries',

      prefill: {
        email: user?.email_address || '',
        contact: user?.mobile_number || '',
        name: `${user?.first_name || ''} ${user?.last_name || ''}`,
      },

      theme: {
        color: Colors.brandColor,
      },
    };

    console.log(
      'OPENING RAZORPAY...',
      JSON.stringify(options, null, 2),
    );

    // STEP 8: OPEN RAZORPAY
    let paymentResult;
    try {
      paymentResult = await RazorpayCheckout.open(options);
    } catch (razorpayError) {
      console.log('RAZORPAY ERROR:', razorpayError);
      // Error code 0 = user cancelled — do not navigate to failure screen
      if (razorpayError?.code === 0) {
        return;
      }
      const errorMessage =
        razorpayError?.description ||
        razorpayError?.message ||
        'Payment failed. Please try again.';
      showMessage({ type: 'danger', icon: 'danger', message: errorMessage });
      navigation.navigate('PaymentFailedScreen', {
        orderId: dbOrderId,
        errorMessage: errorMessage,
      });
      return;
    }

    console.log('PAYMENT SUCCESS:', JSON.stringify(paymentResult, null, 2));

    // STEP 9: UPDATE PAYMENT STATUS IN DB
    const updatePayload = {
      _id: dbOrderObjectId,
      paymentProvider: 'razorpay',
      paymentStatus: 'Payment Verified',
      razorpayOrderId: paymentResult?.razorpay_order_id,
      razorpayPaymentId: paymentResult?.razorpay_payment_id,
      razorpaySignature: paymentResult?.razorpay_signature,
    };

    console.log(
      'UPDATING PAYMENT STATUS:',
      JSON.stringify(updatePayload, null, 2),
    );

    await ApiService.UPDATE_PAYMENT_STATUS(updatePayload);

    // STEP 10: NAVIGATE TO SUCCESS
    navigation.navigate('SuccessPage', {
      id: user?._id,
      orderObjectId: dbOrderObjectId,
      orderId: dbOrderId,
      paymentId: paymentResult?.razorpay_payment_id,
    });
  } catch (error) {
    const backendData = error?.response?.data;
    console.log('ORDER FLOW ERROR:', error?.message);
    console.log('BACKEND ERROR BODY:', JSON.stringify(backendData, null, 2));

    const errorMessage =
      backendData?.message ||
      backendData?.error?.description ||
      error?.message ||
      'Something went wrong';

    showMessage({
      type: 'danger',
      icon: 'danger',
      message: errorMessage,
    });

    navigation.navigate('PaymentFailedScreen', {
      orderId: '',
      errorMessage: errorMessage,
    });
  } finally {
    setLoading(false);
    console.log('===== ORDER FLOW COMPLETED =====');
  }
};

  return (
    <WrapperContainer isLoading={loading}>
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <InternalHeader title={'Cart Summary'} />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* main content */}
          <View style={styles.content}>
            <View>
              <FlatList
                data={address1}
                keyExtractor={(item, index) => index}
                renderItem={displayAddressCard}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.yourOrderView}>
              <Text style={styles.yourOrderText}>Your Order</Text>
              <View style={styles.lowerView}>
                <Text style={styles.lowerText}>Product</Text>
                <Text style={styles.lowerText}>Total</Text>
              </View>
              <View style={styles.divider} />
              {cartProducts.length &&
                cartProducts.map((item, index) => {
                  return (
                    <View
                      style={[
                        styles.lowerView,
                        {
                          borderBottomWidth: moderateScale(2),
                          paddingHorizontal: moderateScale(10),
                          borderRadius: moderateScale(5),
                          borderColor: Colors.border_grey,
                          paddingBottom: moderateVerticalScale(15),
                        },
                      ]}
                      key={index}
                    >
                      <View style={styles.cartImageHolder}>
                        <FastImage
                          style={styles.cartImage}
                          source={{
                            uri: item?.product?.images[0]?.image,
                            priority: FastImage.priority.high,
                            cache: FastImage.cacheControl.web,
                          }}
                          resizeMode={FastImage.resizeMode.contain}
                        />
                      </View>
                      <View style={{ width: '60%' }}>
                        <Text style={styles.itemName}>
                          {item?.product?.name} {'\n'}
                          {item?.quantity} x {item?.price}
                        </Text>
                      </View>
                      <View style={{ width: '15%' }}>
                        <Text style={styles.priceText}>
                          ₹{item.quantity * item.price}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              <View style={styles.innerView2}>
                <Text style={styles.cartSubtotalText}>Total Cart Value</Text>
                <Text style={styles.cartSubtotalPrice}>
                  ₹{parseFloat(subtotal.toFixed(2))}
                </Text>
              </View>

              <View style={[styles.view, { padding: moderateScale(10) }]}>
                <Text style={styles.cartSubtotalText}>
                  Choose Delivery Method
                </Text>
                <TouchableOpacity
                  style={styles.innerView}
                  // disabled={!isValidZip}
                  onPress={() => {
                    if (!isValidZip) {
                      showMessage({
                        type: 'danger',
                        icon: 'danger',
                        message: 'Pincode not available for Express Delivery',
                      });
                    } else {
                      setDeliveryType('Express Delivery');
                      setShippingAmount(100);
                    }
                  }}
                >
                  <View style={{ width: '10%', alignItems: 'center' }}>
                    <FontAwesome
                      name={
                        deliveryType === 'Express Delivery'
                          ? 'dot-circle-o'
                          : 'circle-o'
                      }
                      color={Colors.brandColor}
                      size={textScale(20)}
                    />
                  </View>
                  <View style={{ width: '75%' }}>
                    <Text style={styles.innerMessageText}>
                      Express Delivery (2-3 working Days)
                    </Text>
                    <Text style={styles.innerSubText}>
                      Applicable for Delhi NCR Only
                    </Text>
                  </View>
                  <View style={{ width: '15%', alignItems: 'center' }}>
                    <Text style={styles.cartSubtotalPrice}>₹100</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.innerView}
                  onPress={() => {
                    setDeliveryType('Standard Delivery');
                    setShippingAmount(0);
                  }}
                >
                  <View style={{ width: '10%', alignItems: 'center' }}>
                    <FontAwesome
                      name={
                        deliveryType === 'Standard Delivery'
                          ? 'dot-circle-o'
                          : 'circle-o'
                      }
                      color={Colors.brandColor}
                      size={textScale(20)}
                    />
                  </View>
                  <View style={{ width: '75%' }}>
                    <Text style={styles.innerMessageText}>
                      Standard Delivery (7-10 working Days)
                    </Text>
                    <Text style={styles.innerSubText}>
                      Applicable for PAN India
                    </Text>
                  </View>
                  <View style={{ width: '15%', alignItems: 'center' }}>
                    <Text style={styles.cartSubtotalPrice}>Free</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />
              <View style={[styles.innerView2, { height: moderateScale(60) }]}>
                <Text style={[styles.cartSubtotalText, { width: '80%' }]}>
                  Total Cart Value + Delivery Charges
                </Text>
                <Text style={styles.cartSubtotalPrice}>
                  ₹{parseFloat(subtotal + shippingAmount)}
                </Text>
              </View>

              <View style={styles.freightChargesHolder}>
                <View style={{ width: '70%', gap: moderateVerticalScale(5) }}>
                  <Text style={styles.cartSubtotalText}>GST Charges</Text>
                  <Text
                    style={[
                      styles.cartSubtotalText,
                      {
                        fontSize: textScale(12),
                        color: Colors.black,
                        fontFamily: FontFamily.Montserrat_Medium,
                      },
                    ]}
                  >
                    For corrugated boxes, GST is 12%. For all other products,
                    GST is 18%
                  </Text>
                </View>

                <Text style={styles.cartSubtotalPrice}>
                  ₹{totalGST.toFixed(2)}
                </Text>
              </View>
              <View style={styles.divider} />
              {discountedAmount > 0 && (
                <View style={styles.cartSubtotalHolder}>
                  <Text style={styles.cartSubtotalText}>Discount Applied:</Text>
                  <Text style={[styles.cartSubtotalPrice, { color: 'green' }]}>
                    - ₹{discountedAmount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[styles.cartSubtotalHolder, { marginTop: 0 }]}>
                <Text style={styles.cartSubtotalText}>
                  Total Payable Amount
                </Text>
                <Text style={styles.cartSubtotalPrice}>₹{finalPrice}</Text>
              </View>
            </View>

            {/* Message View  */}
            {/* <View style={styles.messageView}>
            <Text style={styles.messageText}>
              Cash on delivery: Please contact us if you require {"\n"}{" "}
              assistance or wish to make alternate arrangements.
            </Text>
          </View> */}

            <CommonButton
              text={'Place Order'}
              buttonStyle={styles.addressButton}
              textStyle={styles.addressText}
              isLoading={loading}
              disabled={loading}
              handleAction={() => OrderPlace()}
            />
          </View>

          {showSuccessPopup && (
            <SuccessPopup
              showSuccessPopup={showSuccessPopup}
              setShowSuccessPopup={setShowSuccessPopup}
            />
          )}
        </ScrollView>

        {showWebCheckout && webCheckoutUrl && (
          <View style={styles.webCheckoutContainer}>
            <View style={styles.webCheckoutHeader}>
              <Text style={styles.webCheckoutTitle}>Payment Gateway</Text>
              <TouchableOpacity
                onPress={() => setShowWebCheckout(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: webCheckoutUrl }}
              onMessage={handleWebCheckoutMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
            />
          </View>
        )}
      </View>
    </WrapperContainer>
  );
};

export default SelectAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.back,
  },
  content: {
    marginTop: moderateVerticalScale(10),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(5),
    marginHorizontal: moderateScale(10),
  },
  divider: {
    borderWidth: moderateScale(1),
    borderColor: Colors.border_grey,
    alignSelf: 'center',
    width: '100%',
  },
  yourOrderView: {
    // marginTop: moderateVerticalScale(10),
    marginHorizontal: moderateScale(10),
  },
  yourOrderText: {
    color: Colors.forgetPassword,
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(24),
    marginBottom: moderateVerticalScale(5),
  },
  lowerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderTopWidth:0,
    // borderBottomWidth:2,
    // marginHorizontal: moderateScale(10),
    marginVertical: moderateVerticalScale(5),
    overflow: 'hidden',
  },
  lowerText: {
    color: Colors.forgetPassword,
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(18),
  },
  cartImage: {
    width: '100%',
    height: moderateScale(100),
    borderRadius: moderateScale(5),
    borderColor: 'red',
    // borderWidth:2
  },
  cartImageHolder: {
    width: '20%',
    height: moderateScale(75),
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth:2,
  },
  addressButton: {
    backgroundColor: Colors.forgetPassword,
    justifyContent: 'center',
    alignItems: 'center',
    height: moderateScale(40),
    width: moderateScale(300),
    alignSelf: 'center',
    borderRadius: moderateScale(5),
    marginBottom: moderateScale(25),
  },
  addressText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  selectAddressCard: {
    marginVertical: moderateVerticalScale(5),
    borderColor: Colors.border_color,
    borderRadius: moderateScale(5),
    padding: moderateScale(10),
    width: '100%',
    gap: moderateVerticalScale(10),
  },
  customerName: {
    color: Colors.forgetPassword,
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  selectText: {
    fontSize: textScale(12),
    color: Colors.black,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  selectText1: {
    color: Colors.border_color,
    fontSize: textScale(12.5),
    fontFamily: FontFamily.Montserrat_Medium,
  },
  cartSubtotalHolder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(10),
    // marginHorizontal: moderateScale(10),
    // marginTop: moderateVerticalScale(5),
    marginBottom: moderateVerticalScale(10),
  },
  cartSubtotalText: {
    fontSize: textScale(14),
    color: Colors.black,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  cartSubtotalPrice: {
    fontSize: textScale(14),
    color: Colors.forgetPassword,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  itemName: {
    color: Colors.black,
    textTransform: 'capitalize',
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Medium,
  },
  priceText: {
    color: Colors.black,
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(14),
    textAlign: 'right',
  },
  freightChargesHolder: {
    marginVertical: moderateVerticalScale(5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(5),
  },
  freightChargesText: {
    color: Colors.forgetPassword,
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  messageView: {
    width: '90%',
    alignSelf: 'center',
    borderWidth: moderateScale(1),
    padding: moderateScale(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.border_color,
    backgroundColor: Colors.backGroundMessage,
    marginBottom: moderateVerticalScale(19),
    borderRadius: moderateScale(5),
  },
  messageText: {
    color: Colors.messageText,
    fontSize: textScale(11),
    fontFamily: FontFamily.Montserrat_Regular,
    textAlign: 'center',
    lineHeight: scale(15),
  },
  typeHolder: {
    borderWidth: moderateScale(2),
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    borderColor: Colors.back,
    backgroundColor: Colors.back,
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(5),
  },
  view: {
    width: '100%',
    padding: moderateScale(5),
    paddingHorizontal: 0,
    gap: moderateScale(12),
    marginBottom: moderateVerticalScale(10),
  },
  innerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  innerMessageText: {
    fontFamily: FontFamily?.Montserrat_Medium,
    fontSize: textScale(13),
    color: Colors.brandColor,
  },
  innerSubText: {
    color: Colors.black,
    fontSize: textScale(12),
  },
  innerView2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: moderateScale(45),
    borderBottomWidth: 2,
    borderColor: Colors.border_grey,
    marginVertical: moderateVerticalScale(-5),
  },
  headerText: {
    fontSize: textScale(16),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_SemiBold,
    textAlign: 'center',
  },
  webCheckoutContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    zIndex: 1000,
  },
  webCheckoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateVerticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border_grey,
    backgroundColor: Colors.white,
  },
  webCheckoutTitle: {
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.forgetPassword,
  },
  closeButton: {
    padding: moderateScale(10),
  },
  closeButtonText: {
    fontSize: textScale(20),
    color: Colors.forgetPassword,
    fontWeight: 'bold',
  },
});
