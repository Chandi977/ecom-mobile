import React from 'react';
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../../utils/Colors';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';

const UpdateModal = ({ visible, storeUrl, onLater }) => {
  const handleUpdate = async () => {
    if (!storeUrl) return;

    const canOpen = await Linking.canOpenURL(storeUrl);
    if (canOpen) {
      await Linking.openURL(storeUrl);
    }
  };

  return (
    <Modal
      transparent
      visible={Boolean(visible)}
      animationType="fade"
      onRequestClose={onLater}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Update available</Text>
          <Text style={styles.message}>
            A newer version of this app is available. Update now for the latest
            fixes and improvements.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onLater}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={[styles.buttonText, styles.secondaryText]}>
                Later
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUpdate}
              style={[styles.button, styles.primaryButton]}
            >
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: moderateScale(20),
  },
  card: {
    width: '100%',
    borderRadius: moderateScale(16),
    backgroundColor: Colors.white,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateVerticalScale(22),
  },
  title: {
    color: Colors.brandColor,
    fontSize: textScale(20),
    fontWeight: '700',
    marginBottom: moderateVerticalScale(10),
  },
  message: {
    color: Colors.term_condition,
    fontSize: textScale(14),
    lineHeight: textScale(21),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: moderateScale(12),
    marginTop: moderateVerticalScale(22),
  },
  button: {
    minWidth: moderateScale(96),
    alignItems: 'center',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateVerticalScale(10),
  },
  primaryButton: {
    backgroundColor: Colors.brandColor,
  },
  secondaryButton: {
    backgroundColor: Colors.backGround_grey,
  },
  buttonText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontWeight: '600',
  },
  secondaryText: {
    color: Colors.brandColor,
  },
});
