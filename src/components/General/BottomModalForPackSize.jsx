import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Colors from "../../utils/Colors";
import { moderateScale, textScale } from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";
import Feather from "react-native-vector-icons/Feather";
const BottomModalForPackSize = ({ visible, hideModal, message, data, selectedValue }) => {
    // console.log(data,"Line 9")
    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={visible}
        statusBarTranslucent
        onRequestClose={hideModal}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { flex: 0 }]}>
            <TouchableOpacity style={styles.closeButton} onPress={hideModal}>
              <Feather name="x" size={textScale(25)} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.messageText}>{message}</Text>
            {data?.map((item, index) => (
              <View key={index} style={{ alignItems: "center" }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => selectedValue(item)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{item?.number}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    );
  };
  

export default BottomModalForPackSize

const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      backgroundColor: Colors.white,
      padding: moderateScale(20),
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      gap: moderateScale(10),
    },
    closeButton: {
      alignSelf: "flex-end",
    },
    messageText: {
      fontFamily: FontFamily.Montserrat_Medium,
      fontSize: textScale(18),
      color: Colors.red,
      textAlign: "center",
    },
    button: {
      backgroundColor: Colors.forgetPassword,
      justifyContent: "center",
      alignItems: "center",
      // height: responsivePadding(30),
      width: "100%",
      padding: moderateScale(10),
      borderRadius: moderateScale(10),
      // marginStart: responsivePadding(10),
      // marginBottom: responsivePadding(30),
    },
    buttonText: {
      fontSize: textScale(16),
      color: Colors.white,
      fontFamily:FontFamily.Montserrat_SemiBold
    },
  });
  
