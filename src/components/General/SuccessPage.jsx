import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "../../utils/Colors";
import { useNavigation } from "@react-navigation/native";
import ApiService from "../../service/APIService";
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";

// The sequential "PI-<n>" number is only minted by the backend once payment is
// confirmed (asynchronously, just after this screen opens), so the id captured at
// checkout time may still be the temporary "TMP-..." value. Poll the order until
// the real PI- number is available.
const isFinalOrderId = (value) =>
  typeof value === "string" && /^PI-\d+$/.test(value);

const SuccessPage = ({ route }) => {
  const { id, orderObjectId, orderId: initialOrderId } = route.params || {};
  const navigation = useNavigation();

  const [orderNumber, setOrderNumber] = useState(
    isFinalOrderId(initialOrderId) ? initialOrderId : null,
  );
  const [resolving, setResolving] = useState(
    !isFinalOrderId(initialOrderId) && Boolean(orderObjectId),
  );

  useEffect(() => {
    if (isFinalOrderId(initialOrderId) || !orderObjectId) return undefined;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 6;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await ApiService.GET_ORDER_BY_ID(orderObjectId);
        const fetched = res?.data?.orderId;
        if (cancelled) return;
        if (isFinalOrderId(fetched)) {
          setOrderNumber(fetched);
          setResolving(false);
          return;
        }
      } catch (e) {
        // ignore and retry; a transient failure should not block the screen
      }
      if (cancelled) return;
      if (attempts >= maxAttempts) {
        setResolving(false);
        return;
      }
      setTimeout(poll, 1500);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderObjectId, initialOrderId]);

  const handleButtonPressed = async () => {
    let data = {
      id: id,
    };
    try {
      const response = await ApiService.EMPTY_CART(data);
      console.log(response,"line 31");
      if (response?.success) {
      }
    } catch (e) {
      Alert.alert("Error", e);
    }
    navigation.push("Drawer");
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={require("../../assets/images/success.png")}
          resizeMode="contain"
          style={styles.image}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.confirmTitle}>Order Confirmed!</Text>
        <Text style={styles.confirmSubtitle}>Your order has been placed </Text>
        <Text style={[styles.confirmSubtitle, { alignSelf: "center" }]}>
          successfully.{" "}
        </Text>

        {orderNumber ? (
          <Text style={styles.orderNumber}>Order ID: {orderNumber}</Text>
        ) : resolving ? (
          <Text style={styles.orderNumberPending}>
            Generating your order number…
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleButtonPressed}
        style={styles.addressButton}
      >
        <Text style={styles.addressText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SuccessPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    height: moderateScale(120),
    width: moderateScale(120),
  },
  image: {
    alignSelf: "center",
  },
  confirmTitle: {
    fontSize: textScale(20),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.black,
  },
  content: {
    marginTop: moderateVerticalScale(15),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  confirmSubtitle: {
    color: Colors.text_grey,
    fontSize: textScale(14),
  },
  orderNumber: {
    marginTop: moderateVerticalScale(12),
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.black,
  },
  orderNumberPending: {
    marginTop: moderateVerticalScale(12),
    fontSize: textScale(13),
    color: Colors.text_grey,
    fontStyle: "italic",
  },
  addressButton: {
    backgroundColor: Colors.forgetPassword,
    justifyContent: "center",
    alignItems: "center",
    height: moderateScale(40),
    width: moderateScale(200),
    alignSelf: "center",
    borderRadius: moderateScale(5),
    marginTop: moderateVerticalScale(50),
  },
  addressText: {
    color: Colors.white,
    fontSize: textScale(14),
    textTransform: "uppercase",
  },
});
