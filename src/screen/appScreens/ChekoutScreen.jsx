import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "../../utils/Colors";
import { useNavigation } from "@react-navigation/native";
import ApiService from "../../service/APIService";
import Loading from "../../components/General/loading";
import InternalHeader from "../../components/Header/InternalHeader";
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  textScale,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";
import FastImage from "react-native-fast-image";
import { showMessage } from "react-native-flash-message";
import StateData from "../../assets/data/State.json";
import AntDesign from "react-native-vector-icons/AntDesign";

export default function ChekoutScreen({ route }) {
  const { cartProducts, user, discountedAmount } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [fullNameError, setFullNameError] = useState(null);
  const [mobileError, setMobileError] = useState(null);
  const [gstInError, setGstInError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [pinCodeError, setPinCodeError] = useState(null);
  const [landMarkError, setLandmarkError] = useState(null);
  const [townError, setTownError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [stateError, setStateError] = useState(null);

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gst, setGst] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");
  // const [selectedSate, setSelectedState] = useState("");
  // const [state, setState] = useState(StateData);
  // const [showStateDropdown, setShowStateDropdown] = useState(false);
  // const [searchStateText, setSearchStateText] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [state, setState] = useState(StateData); // Set initial state to StateData
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [searchStateText, setSearchStateText] = useState("");

  const validateGSTRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z0-9]{1}[A-Z0-9]{1}$/;
  const placeholderImage = "https://prempackaging.com/img/logo.png";

  const handleSearchChange = (text) => {
    setSearchStateText(text); // Update search text

    if (text === "") {
      // If search text is empty, show the full state list
      setState(StateData);
    } else {
      // Filter states based on the search text (case-insensitive)
      const filteredStates = StateData.filter((stateName) =>
        stateName.name.toLowerCase().includes(text.toLowerCase())
      );
      setState(filteredStates);
    }
  };

  function getCartTotal() {
    return cartProducts.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  function calculateAmounts() {
    let totalAmount12 = 0;
    let totalAmount18 = 0;

    cartProducts.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      if (item.category === "6557deab301ec4f2f4266131") {
        totalAmount12 += itemTotal;
      } else {
        totalAmount18 += itemTotal;
      }
    });

    const gst12Charges = totalAmount12 * 0.12;
    const gst18Charges = totalAmount18 * 0.18;

    const totalGST = gst12Charges + gst18Charges;

    return {
      totalAmount12,
      totalAmount18,
      totalGST,
    };
  }

  const { totalAmount12, totalAmount18, totalGST } = calculateAmounts();

  const validatePhone = (phone) => {
    return phone.length === 10 && /^\d+$/.test(phone);
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
      return false;
    }
    // Additional check to avoid consecutive dots in domain part
    const domainPart = email.split("@")[1];
    if (domainPart.includes("..")) {
      return false;
    }
    return true;
  };

  const handleAddAddress = async () => {
    if (
      !fullName ||
      !address ||
      !city ||
      !phone ||
      !email ||
      !gst ||
      !pincode ||
      !landmark ||
      !selectedState
    ) {
      setFullNameError(!fullName ? "Please enter the full name" : "");
      setMobileError(!phone ? "Please enter the mobile number" : "");
      setGstInError(!gst ? "Please enter the GSTIN number" : "");
      setAddressError(!address ? "Please enter the address" : "");
      setPinCodeError(!pincode ? "Please enter the PinCode" : "");
      setLandmarkError(!landmark ? "Please enter the landmark" : "");
      setTownError(!city ? "Please enter the town/city" : "");
      setEmailError(!email ? "Please enter the email id" : "");
      setStateError(!selectedState ? "Please enter the state name" : "");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!validatePhone(phone)) {
      setMobileError("Please enter a valid mobile number");
      return;
    }
    if (!validateGSTRegex.test(gst)) {
      setGstInError("Please enter the valid GSTIN number");
      return;
    }
    try {
      setLoading(true);
      const data = {
        id: user?._id,
        newAddress: {
          name: fullName,
          mobile: phone,
          gstin: gst,
          address: address,
          pincode: pincode,
          landmark: landmark,
          town: city,
          state: selectedState,
          email: email,
        },
      };
      const temp_address = [
        {
          name: fullName,
          mobile: phone,
          gstin: gst,
          address,
          pincode,
          landmark,
          town: city,
          email,
          state:selectedState,
        },
      ];
      console.log(data, "Line 165");
      const response = await ApiService.ADD_ADDRESS(data);
      if (response?.success === true) {
        showMessage({
          message: "Address added Successfully",
          type: "success",
          color: Colors.white,
          backgroundColor: Colors.green,
        });
        setLoading(false);
        navigation.replace("Show Address", {
          contact_address: temp_address,
          cartProducts,
          user,
          discountedAmount,
        });
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong");
      setLoading(false);
    }
  };

  const handleChangeAddress = async () => {
    console.log("Clicked on the change Address Button");
    navigation.replace("Shipping Address", {
      routeName: "Billing Address",
      cartProducts: cartProducts,
      user: user,
      discountedAmount: discountedAmount,
    });
  };

  const handleStateSelection = (state) => {
    setSelectedState(state.name);
    setShowStateDropdown(false);
    setSearchStateText("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.back }}>
      <StatusBar barStyle={"dark-content"} backgroundColor={Colors.white} />
      <SafeAreaView style={{ backgroundColor: Colors.white }} />
      <InternalHeader title={"Billing Details"} />
      <ScrollView style={styles.container}>
        {/* main content */}
        <View style={styles.content}>
          <View style={styles.changeHolder}>
            <Text style={styles.billingHeading}>Your Shipping Address</Text>
            <TouchableOpacity
              style={{ width: "30%", alignItems: "center" }}
              onPress={handleChangeAddress}
            >
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          {/* form inputs */}
          <View style={styles.formHolder}>
            <View>
              <Text style={styles.formTitle}>
                Full Name
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                placeholder="Full Name"
                onChangeText={(value) => {
                  setFullName(value);
                  if (value) setFullNameError("");
                }}
                style={styles.formInput}
                placeholderTextColor={Colors.border_color}
              />
              {fullNameError && (
                <Text style={styles.errorText}>{fullNameError}</Text>
              )}
            </View>

            <View>
              <Text style={styles.formTitle}>
                Mobile
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                placeholder="Mobile"
                keyboardType="number-pad"
                maxLength={10}
                onChangeText={(value) => {
                  setPhone(value);
                  if (validatePhone(value)) setMobileError("");
                }}
                style={styles.formInput}
                placeholderTextColor={Colors.border_color}
              />
              {mobileError && (
                <Text style={styles.errorText}>{mobileError}</Text>
              )}
            </View>
            <View>
              <Text style={styles.formTitle}>
                GSTIN
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                placeholder="GSTIN"
                onChangeText={(value) => {
                  setGst(value);
                  if (value) setGstInError("");
                }}
                style={styles.formInput}
                placeholderTextColor={Colors.border_color}
              />
              {gstInError && <Text style={styles.errorText}>{gstInError}</Text>}
            </View>
            <View>
              <Text style={styles.formTitle}>
                Address
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                placeholder="Address"
                onChangeText={(value) => {
                  setAddress(value);
                  if (value) setAddressError("");
                }}
                style={styles.formInput}
                placeholderTextColor={Colors.border_color}
              />
              {addressError && (
                <Text style={styles.errorText}>{addressError}</Text>
              )}
            </View>
            <View>
              <Text style={styles.formTitle}>
                Pin Code
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                placeholder="Pin Code"
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={(value) => {
                  setPincode(value);
                  if (value) setPinCodeError("");
                }}
                style={styles.formInput}
                placeholderTextColor={Colors.border_color}
              />
              {pinCodeError && (
                <Text style={styles.errorText}>{pinCodeError}</Text>
              )}
            </View>
            <View>
              <Text style={styles.formTitle}>
                Landmark
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                placeholder="Landmark"
                onChangeText={(value) => {
                  setLandmark(value);
                  if (value) setLandmarkError("");
                }}
                style={styles.formInput}
                placeholderTextColor={Colors.border_color}
              />
              {landMarkError && (
                <Text style={styles.errorText}>{landMarkError}</Text>
              )}
            </View>
            <View>
              <Text style={styles.formTitle}>
                Town/City
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                placeholder="Town/ City"
                onChangeText={(value) => {
                  setCity(value);
                  if (value) setTownError(""); // Clear the error
                }}
                style={styles.formInput}
                placeholderTextColor={Colors.border_color}
              />
              {townError && <Text style={styles.errorText}>{townError}</Text>}
            </View>
            <View>
              <Text style={styles.formTitle}>
                Email address
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                placeholder="Email Address"
                autoCapitalize="none"
                onChangeText={(value) => {
                  setEmail(value);
                  if (value) setEmailError(""); // Clear the error
                }}
                style={styles.formInput}
                placeholderTextColor={Colors.border_color}
              />
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>
            <View>
              <Text style={styles.formTitle}>
                State
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.stateHolder}
                onPress={() => setShowStateDropdown(!showStateDropdown)}
              >
                <Text style={styles.text}>
                  {selectedState || "Select State"}
                </Text>
                <View style={styles.iconHolder}>
                  <AntDesign
                    name="caretdown"
                    size={20}
                    color={Colors.border_color}
                  />
                </View>
              </TouchableOpacity>
              {showStateDropdown && (
                <View style={styles.dropdownContent}>
                  <TextInput
                    keyboardType="default"
                    label={"Search*"}
                    style={styles.formInput}
                    placeholderTextColor={Colors.text_grey}
                    onChangeText={handleSearchChange}
                    value={searchStateText}
                    placeholder="Search State"
                  />
                  {/* Use the filtered state list here */}
                  {state.length > 0 ? (
                    state.map((state, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => handleStateSelection(state)}
                      >
                        <Text style={styles.text}>{state.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.text}>No states found</Text>
                  )}
                </View>
              )}
            </View>
            {stateError && <Text style={styles.errorText}>{stateError}</Text>}
          </View>
          {/* Your order view section */}
          <View style={styles.yourOrderView}>
            <Text style={styles.yourOrderText}>Your Order</Text>

            <View style={styles.lowerView}>
              <Text style={styles.lowerText}>Product</Text>
              <Text style={styles.lowerText}>Total</Text>
            </View>
            <View style={styles.divider} />
            {cartProducts?.length &&
              cartProducts?.map((item, index) => {
                // console.log(item, "line 337");
                return (
                  <View style={styles.lowerView} key={index}>
                    <View style={styles.cartImageHolder}>
                      <FastImage
                        style={styles.cartImage}
                        source={{
                          uri: item?.product?.images[0]?.image,
                          priority: FastImage.priority.high,
                          cache: FastImage.cacheControl.web,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </View>

                    <View style={{ width: "60%" }}>
                      <Text style={styles.itemName}>
                        {item?.category === "6557deab301ec4f2f4266131"
                          ? "Corrugated Box"
                          : ""}
                        {"\n"} {item?.product?.name}{" "}
                        {"\n"}
                        {item?.quantity} x {item?.price}
                      </Text>
                    </View>
                    <View style={{ width: "15%" }}>
                      <Text style={styles.priceText}>
                        ₹{item.quantity * item.price}
                      </Text>
                    </View>
                  </View>
                );
              })}

            <View style={styles.divider} />
            <View style={styles.freightChargesHolder}>
              <View style={{ width: "70%" }}>
                <Text style={styles.freightChargesText}>Total GST Charges</Text>
                <Text
                  style={[styles.freightChargesText, { color: Colors.red }]}
                >
                  * 12% for corrugated-box and 18% for all other products
                </Text>
              </View>
              <Text style={styles.priceText}>{totalGST.toFixed(2)}</Text>
            </View>
            <View style={styles.freightChargesHolder}>
              <View style={{ width: "70%" }}>
                <Text style={styles.freightChargesText}>Total Amount</Text>
              </View>
              <Text style={styles.priceText}>₹{getCartTotal() + totalGST}</Text>
            </View>
          </View>

          {/* Message View */}
          {/* <View style={styles.messageView}>
            <Text style={styles.messageText}>
              Cash on delivery: Please contact us if you require {"\n"}{" "}
              assistance or wish to make alternate arrangements.
            </Text>
          </View> */}
          {/* Select Address Button */}
          {loading ? (
            <Loading size={20} color={Colors.forgetPassword} />
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleAddAddress()}
              style={styles.addressButton}
            >
              <Text style={styles.addressText}>Select Address</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    backgroundColor: Colors.white,
  },
  changeHolder: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerView: {
    paddingTop: moderateVerticalScale(20),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: moderateScale(10),
    marginBottom: moderateVerticalScale(10),
  },
  content: {
    marginTop: moderateVerticalScale(10),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(5),
    marginHorizontal: moderateScale(10),
  },
  billingHeading: {
    color: Colors.forgetPassword,
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_SemiBold,
    marginLeft: moderateScale(10),
    marginVertical: moderateVerticalScale(10),
  },
  formHolder: {
    marginHorizontal: moderateScale(10),
    marginTop: moderateVerticalScale(10),
    gap: moderateScale(10),
  },
  formTitle: {
    color: Colors.forgetPassword,
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(15),
  },
  formInput: {
    borderWidth: 1,
    borderColor: Colors.border_color,
    color: Colors.forgetPassword,
    marginVertical: moderateVerticalScale(10),
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  divider: {
    borderWidth: moderateScale(0.5),
    borderColor: Colors.border_color,
    alignSelf: "center",
    width: "100%",
  },
  yourOrderView: {
    marginTop: moderateVerticalScale(10),
    marginHorizontal: moderateScale(10),
  },
  yourOrderText: {
    color: Colors.forgetPassword,
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(20),
    letterSpacing: scale(1),
  },
  lowerView: {
    flexDirection: "row",
    gap: moderateScale(10),
    alignItems: "center",
    marginHorizontal: moderateScale(10),
    marginVertical: moderateVerticalScale(10),
  },
  lowerText: {
    color: Colors.forgetPassword,
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(15),
    marginBottom: moderateScale(10),
  },
  cartImage: {
    width: "100%",
    height: moderateScale(100),
    borderRadius: moderateScale(5),
  },
  cartImageHolder: {
    width: "20%",
    height: moderateScale(75),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  freightChargesHolder: {
    marginTop: moderateVerticalScale(10),
    marginHorizontal: moderateScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateVerticalScale(20),
  },
  freightChargesText: {
    color: Colors.forgetPassword,
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  messageView: {
    width: "90%",
    alignSelf: "center",
    borderWidth: moderateScale(1),
    padding: moderateScale(5),
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors.border_color,
    backgroundColor: Colors.backGroundMessage,
    marginBottom: moderateVerticalScale(19),
    borderRadius: moderateScale(5),
  },
  messageText: {
    color: Colors.messageText,
    fontSize: textScale(11),
    fontFamily: FontFamily.Montserrat_Regular,
    textAlign: "center",
    lineHeight: scale(15),
  },
  addressButton: {
    backgroundColor: Colors.forgetPassword,
    justifyContent: "center",
    alignItems: "center",
    height: moderateScale(40),
    width: moderateScale(300),
    alignSelf: "center",
    borderRadius: moderateScale(5),
    marginBottom: moderateScale(25),
  },
  addressText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  changeText: {
    color: Colors.blue,
    fontSize: textScale(18),
    fontFamily: FontFamily.Montserrat_SemiBold,
    textDecorationLine: "underline",
  },
  itemName: {
    color: Colors.black,
    textTransform: "uppercase",
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_Regular,
  },
  priceText: {
    color: Colors.black,
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(14),
    textAlign: "right",
  },
  errorText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.red,
  },
  text: {
    color: Colors.border_color,
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_SemiBold,
    padding: moderateScale(10),
    width: "80%",
  },
  stateHolder: {
    borderWidth: 1,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: moderateScale(5),
    borderColor: Colors.border_color,
    marginTop: moderateVerticalScale(10),
  },
  iconHolder: {
    width: "20%",
    padding: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});
