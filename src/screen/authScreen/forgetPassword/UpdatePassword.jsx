import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ImageBackground,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../utils/Colors';
import Feather from 'react-native-vector-icons/Feather';
import { LockClosedIcon } from 'react-native-heroicons/outline';
import ApiService from '../../../service/APIService';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../../utils/responsiveSize';
import FontFamily from '../../../utils/FontFamily';
import { ImagePath } from '../../../utils/ImagePath';
import WrapperContainer from '../../../utils/WrapperContainer';
import CommonButton from '../../../components/CommonButton';

const UpdatePassword = props => {
  const navigation = useNavigation();
  const { email } = props.route.params;
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (newPassword.length > 0) {
      setErrorText('');
      setNewPasswordError('');
    }
    if (confirmPassword.length > 0) {
      setErrorText('');
      setConfirmPasswordError('');
    }
  }, [newPassword, confirmPassword]);
  const handleSubmit = async () => {
    if (newPassword.trim() === '' || confirmPassword.trim() === '') {
      // setErrorText("Passwords,Please fill the passwords!");
      setNewPasswordError('Please enter the new password!!');
      setConfirmPasswordError('Please enter the confirm password!!');
      return;
    }

    if (newPassword.length < 8 || confirmPassword.length < 8) {
      setErrorText('Password must be 8 characters long!!!');
      return;
    } else if (newPassword !== confirmPassword) {
      setErrorText('Both passwords must be same!!');
      return;
    } else {
      setIsLoading(true);
      let payload = {
        email_address: email,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };
      console.log(payload);
      try {
        const response = await ApiService.CHANGE_PASSWORD(payload);
        console.log(response, 'Line 74');

        setIsLoading(false);
        if (response && response?.message === 'Password updated successfully') {
          navigation.replace('SuccessScreen', { come: 'forgetPassword' });
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <WrapperContainer
      isLoading={isLoading}
      backgroundColor={Colors.forgetPassword}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ width: '100%', backgroundColor: Colors.forgetPassword }}>
          <Text style={styles.loginText}>Set a New Password</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: Colors.forgetPassword }}>
          <ImageBackground
            style={styles.bgImage}
            source={ImagePath.loginBg}
            resizeMode="stretch"
          >
            <View style={styles.v1}>
              <ScrollView>
                <View style={styles.contentContainer}>
                  <Text style={styles.inputText}>New Password</Text>
                  <View style={styles.inputBox}>
                    <LockClosedIcon
                      size={textScale(25)}
                      color={Colors.border_color}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter password"
                      value={newPassword}
                      onChangeText={value => setNewPassword(value)}
                      placeholderTextColor={Colors.border_color}
                      secureTextEntry={!showPassword}
                    />
                    <Feather
                      onPress={() => setShowPassword(!showPassword)}
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={textScale(20)}
                      color={Colors.border_color}
                    />
                  </View>
                  {newPasswordError && (
                    <Text style={styles.errorText}>{newPasswordError}</Text>
                  )}
                  <Text style={styles.inputText}>Confirm Password</Text>

                  <View style={styles.inputBox}>
                    <LockClosedIcon size={textScale(25)} color={'gray'} />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={value => setConfirmPassword(value)}
                      placeholder="Confirm Password"
                      placeholderTextColor={Colors.border_color}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <Feather
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={textScale(20)}
                      color={Colors.border_color}
                    />
                  </View>
                  {confirmPasswordError && (
                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                  )}
                  <CommonButton
                    buttonStyle={styles.button}
                    textStyle={styles.buttonText}
                    text={"Save and Continue"}
                    handleAction={()=>handleSubmit()}
                    disabled={isLoading}
                    isLoading={isLoading}
                  />
                  {errorText && (
                    <Text style={styles.errorText}>{errorText}</Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </ImageBackground>
        </View>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

export default UpdatePassword;

const styles = StyleSheet.create({
  loginText: {
    marginTop: moderateVerticalScale(40),
    alignSelf: 'center',
    fontSize: textScale(22),
    fontFamily: FontFamily.Montserrat_ExtraBold,
    color: Colors.white,
  },
  bgImage: {
    flex: 1,
    width: '100%',
    marginTop: moderateVerticalScale(10),
  },
  contentContainer: {
    marginHorizontal: moderateScale(30),
    marginTop: moderateVerticalScale(80),
  },
  inputText: {
    color: Colors.black,
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Medium,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    borderWidth: 1,
    borderColor: Colors.border_color,
    borderRadius: moderateScale(10),
    marginVertical: moderateVerticalScale(10),
  },
  input: {
    flex: 1,
    marginLeft: moderateScale(10),
    fontSize: textScale(16),
    color: Colors.black,
    padding: moderateScale(10),
    fontFamily: FontFamily.Montserrat_Medium,
  },
  button: {
    backgroundColor: Colors.forgetPassword,
    justifyContent: 'center',
    alignItems: 'center',
    height: moderateScale(50),
    borderRadius: moderateScale(10),
    marginTop: moderateVerticalScale(30),
  },
  buttonText: {
    fontSize: textScale(16),
    color: Colors.white,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  errorText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.red,
    marginVertical: moderateVerticalScale(10),
  },
  v1: {
    flex: 1,
    overflow: 'hidden',
    paddingTop: moderateVerticalScale(40),
  },
});
