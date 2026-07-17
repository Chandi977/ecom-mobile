import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Feather from "react-native-vector-icons/Feather";
import { moderateScale, textScale } from "../../utils/responsiveSize";
import Colors from "../../utils/Colors";
import CustomButton from "./CustomButton";
import FontFamily from "../../utils/FontFamily";

const CustomBottomModal = ({
  visible,
  hideModal,
  message,
  data,
  selectedValue,
}) => {
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
          {data.map((item, index) => (
            <View key={index} style={{ alignItems: "center" }}>
              <CustomButton
                name={item?.title}
                handleAction={() => selectedValue(item?.title)}
              />
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default CustomBottomModal;

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
});
