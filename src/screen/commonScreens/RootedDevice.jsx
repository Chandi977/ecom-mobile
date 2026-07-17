import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, BackHandler } from 'react-native';
import React, { useEffect } from 'react';
import { ImagePath } from '../../utils/ImagePath';
import { moderateScale } from "../../utils/responsiveSize";

const RootedDevice = () => {
  
  const exitApp = () => {
    Alert.alert(
      "Exit App",
      "Are you sure you want to exit?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Exit",
          onPress: () => {
            BackHandler.exitApp();
          },
          style: "destructive"
        }
      ]
    );
  };

  // Optional: Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        exitApp();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.main}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Image
            source={ImagePath.spLogo}
            resizeMode="contain"
            style={styles.imageStyle}
          />
        </View>
        
        <Text style={styles.titleText}>Security Alert</Text>
        <Text style={styles.warningText}>⚠️ Rooted Device Detected</Text>
        
        <View style={styles.messageContainer}>
          <Text style={styles.subText}>
            For security reasons, this app cannot run on rooted or jailbroken devices.
          </Text>
          <Text style={styles.subText}>
            Please ensure your device is running on a secure, non-rooted environment.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.exitButton}
          onPress={exitApp}
          activeOpacity={0.8}
        >
          <Text style={styles.exitButtonText}>Exit Application</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RootedDevice;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
    width: '100%',
  },
  iconContainer: {
    backgroundColor: '#fff3e0',
    borderRadius: moderateScale(100),
    padding: moderateScale(20),
    marginBottom: moderateScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageStyle: {
    width: moderateScale(80),
    height: moderateScale(80),
  },
  titleText: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#e74c3c',
    marginBottom: moderateScale(8),
    letterSpacing: 0.5,
  },
  warningText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#f39c12',
    marginBottom: moderateScale(20),
    backgroundColor: '#fff3e0',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    overflow: 'hidden',
  },
  messageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
    marginBottom: moderateScale(32),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subText: {
    fontSize: moderateScale(14),
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: moderateScale(12),
  },
  exitButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: moderateScale(32),
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(12),
    width: '100%',
    alignItems: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exitButtonText: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});