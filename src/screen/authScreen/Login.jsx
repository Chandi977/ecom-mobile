import {
  DeviceEventEmitter,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import CommonButton from '../../components/CommonButton';
import Colors from '../../utils/Colors';
import FontFamily from '../../utils/FontFamily';
import { showErrorMessage, showSuccessMessage, parseStoredUser } from '../../utils/HelperFunction';
import { ImagePath } from '../../utils/ImagePath';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import WrapperContainer from '../../utils/WrapperContainer';
import ApiService from '../../service/APIService';
import { registerForPush } from '../../service/pushNotifications';
import {
  getGoogleAuthConfigMessage,
  getGoogleSigninConfig,
  isGoogleAuthConfigured,
} from '../../service/googleAuthConfig';
import StorageService from '../../utils/storageService';
import GuestCartService from '../../utils/GuestCartService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [password, setPassword] = useState('');
  const [emailValidationText, setEmailValidationText] = useState('');
  const [passwordValidationText, setPasswordValidationText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorText, setShowErrorText] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const googleSigninConfig = getGoogleSigninConfig();

    if (googleSigninConfig) {
      GoogleSignin.configure(googleSigninConfig);
    }
  }, []);

  useEffect(() => {
    if (validateEmail(email)) {
      setEmailError(false);
      setEmailValidationText('');
    }

    if (password.length > 0) {
      setPasswordError(false);
      setPasswordValidationText('');
    }

    if (email.length > 0) {
      if (!validateEmail(email)) {
        setEmailError(true);
        setEmailValidationText('Please enter a valid email!');
        return;
      } else if (email.length === 0) {
        setEmailError(false);
        setEmailValidationText('');
        return;
      } else if (email.length > 0) {
        setErrorMessage('');
      }
    }
  }, [email, password]);

  const persistAuthSession = async responseData => {
    const sessionUser = responseData?.user;
    const accessToken = responseData?.Token || responseData?.token;
    const refreshToken =
      responseData?.RefreshToken || responseData?.refreshToken;

    if (!accessToken || !sessionUser) {
      showErrorMessage('Login response is missing authentication data.');
      return;
    }

    try {
      await StorageService.setItem('authToken', accessToken);
      await StorageService.setItem('user_data', sessionUser);

      if (refreshToken) {
        await StorageService.setItem('refreshToken', refreshToken);
      }
    } catch (e) {
      console.log('Error in Saving data:', e?.message);
    }

    showSuccessMessage('You have successfully logged in');
    setEmail('');
    setPassword('');
    setShowErrorText(false);
    setErrorMessage('');

    const loggedInUser = parseStoredUser(sessionUser);
    try {
      if (loggedInUser?._id) {
        await GuestCartService.mergeToUser(loggedInUser._id);
        DeviceEventEmitter.emit('cartUpdated');
      }
    } catch (e) {
      console.log('Error merging guest cart:', e?.message);
    }

    // Re-register the push token now that we're authenticated so this device
    // links to the user and can receive targeted notifications.
    registerForPush().catch(e => console.log('Push link on login failed:', e?.message));

    navigation.replace('Drawer', { userData: sessionUser });
  };
  const validateEmail = emailValue => {
    // const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?<!\.\.)$/;
    return regex.test(emailValue);
  };

  const handleEmojiForEmail = value => {
    const emojiRegex =
      /(?:[\u2700-\u27BF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF])/g;
    const filteredText = value.replace(emojiRegex, '');
    setEmail(filteredText);
  };

  const handleEmojiForPassword = value => {
    const emojiRegex =
      /(?:[\u2700-\u27BF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF])/g;
    const filteredText = value.replace(emojiRegex, '');
    setPassword(filteredText);
  };

  const handleLogin = async () => {
    if (email.trim() === '') {
      setEmailError(true);
      setEmailValidationText('Please enter the Email!');
    }
    if (password.trim() === '') {
      setPasswordValidationText('Please enter the Password!');
      return;
    } else if (!validateEmail(email)) {
      setEmailError(true);
      setEmailValidationText('Please enter a valid Email!');
      return;
    } else if (email.length > 0 && password.length > 0) {
      setEmailError(false);
      setPasswordError(false);
    }

    const loginUser = {
      email_address: email,
      password: password,
    };

    try {
      setLoading(true);
      const response = await ApiService.LOGIN_USER(loginUser);
      console.log('Server Response:', response?.data);
      if (response?.success) {
        await persistAuthSession(response?.data);
      } else {
        setShowErrorText(true);
        setErrorMessage('Invalid Credentials!!');
        setEmail('');
        setPassword('');
        showErrorMessage('Invalid Credentials!!');
      }
      setLoading(false);
    } catch (e) {
      console.log(e?.message);
      setLoading(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleGoogleLogin = async () => {
    const googleSigninConfig = getGoogleSigninConfig();

    if (!googleSigninConfig) {
      showErrorMessage(getGoogleAuthConfigMessage());
      return;
    }

    try {
      setLoading(true);
      GoogleSignin.configure(googleSigninConfig);

      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      const response = await GoogleSignin.signIn();
      if (response?.type && response.type !== 'success') {
        return;
      }

      const credential = response?.data?.idToken || response?.idToken;
      if (!credential) {
        showErrorMessage('Google sign-in did not return a valid token.');
        return;
      }

      const backendResponse = await ApiService.GOOGLE_LOGIN({ credential });
      if (backendResponse?.success) {
        await persistAuthSession(backendResponse?.data);
        return;
      }

      setShowErrorText(true);
      setErrorMessage('Google authentication failed.');
      showErrorMessage('Google authentication failed.');
    } catch (e) {
      if (
        e?.code === statusCodes.SIGN_IN_CANCELLED ||
        e?.code === statusCodes.IN_PROGRESS
      ) {
        return;
      }

      if (e?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showErrorMessage(
          'Google Play Services are not available on this device.',
        );
        return;
      }

      console.log('Google login error:', e?.message);
      showErrorMessage('Unable to sign in with Google right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WrapperContainer
      isLoading={loading}
      backgroundColor={Colors.forgetPassword}
    >
      <View style={styles.main}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View
            style={{ width: '100%', backgroundColor: Colors.forgetPassword }}
          >
            <Text style={styles.loginText}>Welcome back!</Text>
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
                    <Text style={styles.inputText}>Email</Text>

                    <View style={styles.inputBox}>
                      <Fontisto
                        name="email"
                        size={moderateScale(25)}
                        color={Colors.border_color}
                      />
                      <TextInput
                        style={styles.input}
                        value={email}
                        autoCapitalize={'none'}
                        onChangeText={value => handleEmojiForEmail(value)}
                        placeholder="Enter your Email"
                        placeholderTextColor={Colors.border_color}
                      />
                    </View>

                    {emailError && (
                      <Text style={styles.errorText}>
                        {emailValidationText}
                      </Text>
                    )}

                    <Text style={styles.inputText}>Password</Text>

                    <View style={styles.inputBox}>
                      <Feather
                        name="lock"
                        size={textScale(25)}
                        color={Colors.border_color}
                      />
                      <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        placeholder="Enter Password"
                        value={password}
                        onChangeText={value => handleEmojiForPassword(value)}
                        secureTextEntry={!showPassword}
                        placeholderTextColor={Colors.border_color}
                      />

                      <Feather
                        onPress={() => setShowPassword(!showPassword)}
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={textScale(20)}
                        color={Colors.border_color}
                      />
                    </View>

                    {passwordError && (
                      <Text style={styles.errorText}>
                        {passwordValidationText}
                      </Text>
                    )}

                    <Text
                      onPress={() => navigation.navigate('forgetPassword')}
                      style={styles.forgotPasswordText}
                    >
                      Forgot Password ?
                    </Text>
                    <CommonButton
                      isLoading={loading}
                      disabled={loading}
                      handleAction={() => handleLogin()}
                      text={'Log In'}
                      buttonStyle={styles.button}
                      textStyle={styles.buttonText}
                    />

                    <TouchableOpacity
                      activeOpacity={0.85}
                      disabled={loading}
                      onPress={handleGoogleLogin}
                      style={[
                        styles.googleButton,
                        !isGoogleAuthConfigured && styles.googleButtonDisabled,
                        loading && styles.googleButtonDisabled,
                      ]}
                    >
                      <FontAwesome
                        name="google"
                        size={moderateScale(18)}
                        color={Colors.forgetPassword}
                      />
                      <Text style={styles.googleButtonText}>
                        {loading ? 'Signing in...' : 'Continue with Google'}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.lowerSignUpHolder}>
                      <Text style={styles.forgotPasswordText}>New User? </Text>
                      <Text
                        onPress={() => navigation.navigate('SignUp')}
                        style={styles.signUpText}
                      >
                        Sign Up
                      </Text>
                    </View>

                    {showErrorText && (
                      <View style={[styles.errorHolder, { marginTop: 10 }]}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            </ImageBackground>
          </View>
        </KeyboardAvoidingView>
      </View>
    </WrapperContainer>
  );
};

export default Login;

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  bgImage: {
    flex: 1,
    width: '100%',
    marginTop: moderateVerticalScale(10),
  },
  loginText: {
    marginTop: moderateVerticalScale(80),
    alignSelf: 'center',
    fontSize: textScale(22),
    fontFamily: FontFamily.Montserrat_ExtraBold,
    color: Colors.white,
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
  },
  forgotPasswordText: {
    alignSelf: 'flex-end',
    color: Colors.black,
    fontSize: textScale(14),
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
    borderWidth: 1,
    borderColor: Colors.forgetPassword,
    backgroundColor: Colors.white,
    minHeight: moderateScale(50),
    borderRadius: moderateScale(10),
    marginTop: moderateVerticalScale(14),
  },
  googleButtonDisabled: {
    opacity: 0.55,
  },
  googleButtonText: {
    color: Colors.forgetPassword,
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  errorText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.red,
  },
  v1: {
    flex: 1,
    overflow: 'hidden',
    paddingTop: moderateVerticalScale(40),
  },
  lowerSignUpHolder: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: moderateVerticalScale(20),
    alignItems: 'center',
  },
  signUpText: {
    color: Colors.forgetPassword,
    fontSize: textScale(14),
    textDecorationLine: 'underline',
    fontFamily: FontFamily.Montserrat_Medium,
  },
});
