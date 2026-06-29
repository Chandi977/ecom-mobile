import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../../utils/Colors';
import { EnvelopeIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../service/APIService';
import FontFamily from '../../../utils/FontFamily';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../../utils/responsiveSize';
import { ImagePath } from '../../../utils/ImagePath';
import WrapperContainer from '../../../utils/WrapperContainer';
import CommonButton from '../../../components/CommonButton';

const ForgetPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (email.length > 0) {
      setErrorText('');
    }
  }, [email]);

  const handleEmojiForEmail = value => {
    const emojiRegex =
      /(?:[\u2700-\u27BF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF])/g;
    const filteredText = value.replace(emojiRegex, '');
    setEmail(filteredText);
  };

  const validateEmail = email => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
      return false;
    }
    // Additional check to avoid consecutive dots in domain part
    const domainPart = email.split('@')[1];
    if (domainPart.includes('..')) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (email.trim() === '') {
      setErrorText('Email address is required');
      return;
    }
    if (!validateEmail(email)) {
      setErrorText('Enter a valid email');
      return;
    } else {
      setErrorText('');
      sendCode(email);
    }
  };
  const sendCode = async email => {
    navigation.replace('Otp', { email: email });
    setIsLoading(true);
    try {
      const Data = {
        email: email,
      };
      const response = await ApiService.SEND_OTP_ON_EMAIL(Data);
      console.log(response);
      if (response?.message === 'User not found') {
        setIsLoading(false);
        setErrorText('You are not a registered User!!');
      }
      if (response && response?.message === 'OTP generated successfully') {
        setIsLoading(false);
        navigation.replace('Otp', { email: email });
        setEmail('');
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e?.message);
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
          <Text style={styles.loginText}>Forgot Password ?</Text>
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
                  <View style={styles.starView}>
                    <Text style={styles.inputText}>Email</Text>
                    <Text style={[styles.inputText, { color: Colors.red }]}>
                      *
                    </Text>
                  </View>

                  <View style={styles.inputBox}>
                    <EnvelopeIcon
                      size={textScale(22)}
                      color={Colors.border_color}
                    />
                    <TextInput
                      style={styles.input}
                      value={email}
                      autoCapitalize="none"
                      onChangeText={value => handleEmojiForEmail(value)}
                      placeholder="Enter registered Email"
                      placeholderTextColor={Colors.border_color}
                    />
                  </View>
                  {errorText && (
                    <Text style={styles.errorText}>{errorText}</Text>
                  )}
                    <CommonButton
                      text={"Send OTP"}
                      handleAction={()=>handleSubmit()}
                      buttonStyle={styles.button}
                      textStyle={styles.buttonText}
                      disabled={isLoading}
                      isLoading={isLoading}
                    />
                 
                  <Text
                    onPress={() => navigation.push('Login')}
                    style={styles.forgotPasswordText}
                  >
                    Back to Sign in
                  </Text>
                </View>
              </ScrollView>
            </View>
          </ImageBackground>
        </View>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({
  starView: {
    flexDirection: 'row',
    gap: moderateScale(3),
    alignItems: 'center',
  },
  loginText: {
    marginTop: moderateVerticalScale(80),
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
    borderColor: 'gray',
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
    fontFamily: FontFamily.Montserrat_Medium,
  },
  v1: {
    flex: 1,
    overflow: 'hidden',
    paddingTop: moderateVerticalScale(40),
  },
  errorText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.red,
  },
  forgotPasswordText: {
    marginTop: moderateScale(20),
    color: Colors.black,
    textAlign: 'center',
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Medium,
  },
});
