import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../utils/Colors';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import ApiService from '../../service/APIService';
import { ImagePath } from '../../utils/ImagePath';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import WrapperContainer from '../../utils/WrapperContainer';
import CommonButton from '../../components/CommonButton';

export default function Signup({ route }) {
  const navigation = useNavigation();
  const fromProductDetails = route?.params?.fromProductDetails ?? false;
  const [firstName, setFirstName] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastName, setLastName] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [selectedRole, setSelectedRole] = useState('Select Role');
  const [selectedGender, setSelectedGender] = useState('Select Gender');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // states to show/hide passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function ValidateMobileNumber(mobile) {
    const indianRegex = /^[6-9]\d{9}$/;
    if (indianRegex.test(mobile) && mobile.length !== 10) {
      return false;
    } else {
      return true;
    }
  }

  function ValidateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
      return false;
    }
    const domainPart = email.split('@')[1];
    if (domainPart.includes('..')) {
      return false;
    }
    return true;
  }

  useEffect(() => {
    if (firstName.length > 0) {
      console.log('kkkk');
      setFirstNameError('');
    }
    if (lastName.length > 0) {
      setLastNameError('');
    }
    if (email.length > 0) {
      setEmailError('');
    }
    if (mobile.length > 0) {
      setMobileError('');
    }
    if (mobile.length < 10 && mobile.length > 0) {
      setMobileError('Please enter valid 10 digit mobile number');
    }
    if (password.length > 0) {
      setPasswordError('');
    }
    if (confirmPassword.length > 0) {
      setConfirmPasswordError('');
    }
    if (password === confirmPassword) {
      setError('');
    }
  }, [firstName, lastName, email, mobile, password, confirmPassword]);


  const handleSignUp = async () => {
    navigation.push('Otp', {
                  email: email,
                  initial: 'registration',
                }),
    console.log('Clicked on the button');

    let isValid = true;

    // Validate First Name
    if (firstName.trim() === '') {
      setFirstNameError('Please Enter First Name');
      isValid = false;
    } else {
      setFirstNameError('');
    }

    // Validate Last Name
    if (lastName.trim() === '') {
      setLastNameError('Please Enter Last Name');
      isValid = false;
    } else {
      setLastNameError('');
    }

    // Validate Email
    if (email.trim() === '') {
      setEmailError('Please enter a valid email address!');
      isValid = false;
    } else if (!ValidateEmail(email)) {
      setEmailError('Please enter a valid email address!');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate Mobile
    if (mobile.trim() === '') {
      setMobileError('Please Enter Mobile Number');
      isValid = false;
    } else if (!ValidateMobileNumber(mobile)) {
      setMobileError('Please enter a valid mobile number!');
      isValid = false;
    } else {
      setMobileError('');
    }

    // Validate Password
    if (password.trim() === '') {
      setPasswordError('Please Enter Password');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Passwords must be 8 characters long!');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validate Confirm Password
    if (confirmPassword.trim() === '') {
      setConfirmPasswordError('Please Enter Confirm Password');
      isValid = false;
    } else if (confirmPassword.length < 8) {
      setConfirmPasswordError('Passwords must be 8 characters long!');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords must match!');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!isValid) {
      console.log('Validation Failed. Please check the errors.');
      return;
    }

    // Prepare User Data
    const data = {
      first_name: firstName,
      last_name: lastName,
      email_address: email,
      password: password,
      mobile_number: mobile,
      role: selectedRole === 'Admin' ? 'admin' : 'user',
      gender: selectedGender === 'Male' ? 'male' : 'female',
    };

    console.log('Object:', data);

    try {
      setLoading(true);
        const response = await ApiService.SIGNUP_USER(data);
      if (response?.success) {
        Alert.alert(
          'Sign Up',
          'Your account was created successfully! Please verify your account to proceed further.',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () =>
                navigation.push('Otp', {
                  email: email,
                  initial: 'registration',
                  fromProductDetails,
                }),
            },
          ],
        );
      } else if (
        response?.success === false &&
        response?.message === 'User already exists.'
      ) {
        Alert.alert('Sign Up Error', response?.message);
      }
    } catch (error) {
      console.error('Sign Up Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);

      // Clear Input Fields
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobile('');
      setSelectedRole('Select Role');
      setSelectedGender('Select Gender');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <WrapperContainer
      isLoading={loading}
      backgroundColor={Colors.forgetPassword}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ width: '100%', backgroundColor: Colors.forgetPassword }}>
          <Text style={styles.loginText}>Register</Text>
        </View>

        <View style={{ flex: 1, backgroundColor: Colors.forgetPassword }}>
          <ImageBackground
            style={styles.bgImage}
            source={ImagePath.loginBg}
            resizeMode="stretch"
          >
            <View style={styles.v1}>
              <ScrollView
                style={{ overflow: 'hidden' }}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.contentContainer}>
                  <View style={styles.starView}>
                    <Text style={styles.inputText}>First Name</Text>
                    <Text style={[styles.inputText, { color: Colors.red }]}>
                      *
                    </Text>
                  </View>
                  <View style={styles.inputBox}>
                    <UserIcon
                      size={textScale(25)}
                      color={Colors.border_color}
                    />
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={value => setFirstName(value)}
                      placeholder="John"
                      placeholderTextColor={Colors.border_color}
                    />
                  </View>
                  {firstNameError && (
                    <Text style={styles.errorText}>{firstNameError}</Text>
                  )}
                  <View style={styles.starView}>
                    <Text style={styles.inputText}>Last Name</Text>
                    <Text style={[styles.inputText, { color: Colors.red }]}>
                      *
                    </Text>
                  </View>
                  <View style={styles.inputBox}>
                    <UserIcon
                      size={textScale(25)}
                      color={Colors.border_color}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Doe"
                      value={lastName}
                      onChangeText={value => setLastName(value)}
                      placeholderTextColor={Colors.border_color}
                    />
                  </View>
                  {lastNameError && (
                    <Text style={styles.errorText}>{lastNameError}</Text>
                  )}
                  <View style={styles.starView}>
                    <Text style={styles.inputText}>Email Address</Text>
                    <Text style={[styles.inputText, { color: Colors.red }]}>
                      *
                    </Text>
                  </View>
                  <View style={styles.inputBox}>
                    <EnvelopeIcon
                      size={textScale(25)}
                      color={Colors.border_color}
                    />
                    <TextInput
                      style={styles.input}
                      autoCapitalize="none"
                      placeholder="example@site.com"
                      keyboardType="email-address"
                      placeholderTextColor={Colors.border_color}
                      value={email}
                      onChangeText={value => setEmail(value)}
                    />
                  </View>
                  {emailError && (
                    <Text style={styles.errorText}>{emailError}</Text>
                  )}
                  <View style={styles.starView}>
                    <Text style={styles.inputText}>Mobile Number</Text>
                    <Text style={[styles.inputText, { color: Colors.red }]}>
                      *
                    </Text>
                  </View>

                  <View style={styles.inputBox}>
                    <PhoneIcon
                      size={textScale(25)}
                      color={Colors.border_color}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="1234######"
                      maxLength={10}
                      keyboardType="number-pad"
                      placeholderTextColor={Colors.border_color}
                      value={mobile}
                      onChangeText={value => setMobile(value)}
                    />
                  </View>
                  {mobileError && (
                    <Text style={styles.errorText}>{mobileError}</Text>
                  )}
                  <View style={styles.starView}>
                    <Text style={styles.inputText}>Choose Password</Text>
                    <Text style={[styles.inputText, { color: Colors.red }]}>
                      *
                    </Text>
                  </View>

                  <View style={styles.inputBox}>
                    <LockClosedIcon
                      size={textScale(25)}
                      color={Colors.border_color}
                    />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={value => setPassword(value)}
                      secureTextEntry={!showPassword}
                      placeholder="Minimum 8 characters"
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
                    <Text style={styles.errorText}>{passwordError}</Text>
                  )}
                  <View style={styles.starView}>
                    <Text style={styles.inputText}>Re-enter Password</Text>
                    <Text style={[styles.inputText, { color: Colors.red }]}>
                      *
                    </Text>
                  </View>

                  <View style={styles.inputBox}>
                    <LockClosedIcon
                      size={textScale(25)}
                      color={Colors.border_color}
                    />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={value => setConfirmPassword(value)}
                      secureTextEntry={!showConfirmPassword}
                      placeholder="*****"
                      placeholderTextColor={'gray'}
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
                  {error && <Text style={styles.errorText}>{error}</Text>}
                
                    <CommonButton
                      text={"Sign Up"}
                      handleAction={()=>handleSignUp()}
                      buttonStyle={styles.button}
                      textStyle={styles.buttonText}
                      isLoading={loading}
                      disabled={loading}
                    />
                  
                </View>
              </ScrollView>
            </View>
          </ImageBackground>
        </View>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
}

const styles = StyleSheet.create({
  starView: {
    flexDirection: 'row',
    gap: moderateScale(3),
    alignItems: 'center',
  },
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
    marginTop: moderateVerticalScale(30),
    // borderWidth:2,
    // borderColor:Colors.white
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
  button: {
    backgroundColor: Colors.forgetPassword,
    justifyContent: 'center',
    alignItems: 'center',
    height: moderateScale(50),
    borderRadius: moderateScale(10),
    marginVertical: moderateVerticalScale(15),
    marginBottom: '10%',
  },
  buttonText: {
    fontSize: textScale(16),
    color: Colors.white,
    fontFamily: FontFamily.Montserrat_Medium,
  },
  v1: {
    flex: 1,
    overflow: 'hidden',
    paddingTop: moderateVerticalScale(45),
  },
  errorText: {
    fontFamily: FontFamily.Montserrat_Regular,
    fontSize: textScale(12),
    color: Colors.red,
    marginBottom: moderateVerticalScale(5),
  },
});
