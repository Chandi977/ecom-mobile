import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../../utils/Colors';
import { moderateScale, textScale } from '../../utils/responsiveSize';

export default function SuccessPopup({
  showSuccessPopup,
  setShowSuccessPopup,
}) {
  return (
    <Modal transparent visible={Boolean(showSuccessPopup)} animationType="fade">
      <View style={styles.modalView}>
        <View style={styles.mainView}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowSuccessPopup(false)}
            style={styles.closeIcon}
          >
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>OK</Text>
          </View>
          <Text style={styles.heading}>Order Placed !!</Text>
          <Text style={styles.subHeading}>Order Placed Successfully!!!</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: moderateScale(20),
  },
  mainView: {
    width: '100%',
    maxWidth: moderateScale(300),
    alignItems: 'center',
    borderRadius: moderateScale(10),
    backgroundColor: Colors.white,
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(24),
  },
  closeIcon: {
    position: 'absolute',
    right: moderateScale(10),
    top: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: Colors.backGround_grey,
  },
  closeText: {
    color: Colors.forgetPassword,
    fontSize: textScale(12),
    fontWeight: '700',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(76),
    height: moderateScale(76),
    borderRadius: moderateScale(38),
    backgroundColor: Colors.green,
    marginBottom: moderateScale(16),
  },
  iconText: {
    color: Colors.white,
    fontSize: textScale(22),
    fontWeight: '700',
  },
  heading: {
    color: Colors.black,
    fontSize: textScale(18),
    fontWeight: '600',
    marginVertical: moderateScale(10),
    textAlign: 'center',
  },
  subHeading: {
    color: 'gray',
    fontSize: textScale(16),
    fontWeight: '400',
    textAlign: 'center',
  },
});
