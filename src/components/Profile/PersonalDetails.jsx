import {
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import {
  PencilIcon,
  CameraIcon,
  PhotoIcon,
} from 'react-native-heroicons/solid';
import Colors from '../../utils/Colors';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ApiService from '../../service/APIService';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import InternalHeader from '../Header/InternalHeader';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import CustomBottomModal from '../General/CustomBottomModal';
import { showMessage } from 'react-native-flash-message';
import WrapperContainer from '../../utils/WrapperContainer';
import CommonButton from '../CommonButton';

const PersonalDetails = ({ route }) => {
  const navigation = useNavigation();
  const { user } = route.params;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [isGenderModalVisible, setShowGenderModal] = useState(false);
  const isFocused = useIsFocused();

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

  const indianPhoneRegex = /^(?:\+91|91)?[-\s]?[6-9]\d{9}$/;

  useEffect(() => {
    fetchSpecificUser(user?._id);
  }, [isFocused, user?._id]);

  const fetchSpecificUser = async id => {
    const response = await ApiService.GET_SPECIFIC_USER_DETAILS(id);
    if (response?.success === true) {
      setFirstName(response?.data?.first_name);
      setLastName(response?.data?.last_name);
      setEmail(response?.data?.email_address);
      setMobile(response?.data?.mobile_number);
      setGender(response?.data?.gender);
      setLoading(false);
    } else {
      showMessage({
        type: 'danger',
        icon: 'danger',
        message: 'Something Went Wrong Please try again after sometimes.',
      });
    }
  };

  const genderData = [{ title: 'Male' }, { title: 'Female' }];

  const pickImageFromCamera = async () => {
    console.log('Camera');
    let options = {
      mediaType: 'photos',
      quality: 0.1,
    };
    const result = await launchCamera(options);
    console.log(result);
    if (!result.didCancel) {
      setImage(result?.assets[0]?.uri);
      setShowModal(false);
    }
  };

  const pickImageFromGallery = async () => {
    console.log('Gallery');
    let options = {
      mediaType: 'photos',
      quality: 0.1,
    };
    const result = await launchImageLibrary(options);
    console.log('Gallery', result);
    if (!result.didCancel) {
      setImage(result?.assets[0]?.uri);
      setShowModal(false);
    }
  };

  const updateUserProfile = async () => {
    if (!firstName || !lastName || !mobile || !email) {
      showMessage({
        type: 'danger',
        icon: 'danger',
        message: 'Please fill all the details',
      });
      return;
    }
    if (!emailRegex.test(email)) {
      showMessage({
        type: 'danger',
        icon: 'danger',
        message: 'Please enter valid email id',
      });
      return;
    }
    if (!indianPhoneRegex.test(mobile)) {
      showMessage({
        type: 'danger',
        icon: 'danger',
        message: 'Please enter valid mobile number',
      });
      return;
    }
    let data = {
      first_name: firstName,
      last_name: lastName,
      mobile_number: mobile,
      email: email,
      id: user?._id,
    };
    console.log('Payload:', data);
    setLoading(true);
    try {
      const response = await ApiService.UPDATE_PROFILE(data);
      console.log(response, 'line 128');
      setLoading(false);
      if (response?.success) {
        showMessage({
          icon: 'success',
          type: 'success',
          message: 'User Profile Updated Successfully...',
        });
        navigation.goBack();
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <WrapperContainer isLoading={loading}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.white }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <InternalHeader title={'Profile Details'} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: moderateVerticalScale(30),paddingHorizontal:moderateScale(10) }}
        >
          {/* Image  */}
          <View style={{ alignSelf: 'center', alignItems: 'center' }}></View>
          {/* form inputs */}
          <View style={styles.formHolder}>
            <Text style={styles.formTitle}>First Name </Text>
            <View style={styles.inputBox}>
              <UserIcon size={textScale(25)} color={Colors.border_color} />
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={value => {
                  // Use a regular expression to replace any non-alphabetic characters with an empty string
                  const filteredValue = value.replace(/[^A-Za-z]/g, '');
                  setFirstName(filteredValue);
                }}
                // onChangeText={(value) => setFirstName(value)}
                placeholder="John"
                placeholderTextColor={Colors.border_color}
              />
            </View>

            <Text style={styles.formTitle}>Last Name </Text>
            <View style={styles.inputBox}>
              <UserIcon size={textScale(25)} color={Colors.border_color} />
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={value => {
                  // Use a regular expression to replace any non-alphabetic characters with an empty string
                  const filteredValue = value.replace(/[^A-Za-z]/g, '');
                  setLastName(filteredValue);
                }}
                // onChangeText={(value) => setLastName(value)}
                placeholder="Doe"
                placeholderTextColor={Colors.border_color}
              />
            </View>

            <Text style={styles.formTitle}>Email</Text>
            <View style={styles.inputBox}>
              <EnvelopeIcon size={textScale(25)} color={Colors.border_color} />
              <TextInput
                editable={false}
                style={styles.input}
                value={email}
                onChangeText={value => setEmail(value)}
                placeholder="example@gmail.com"
                placeholderTextColor={Colors.border_color}
              />
            </View>

            <Text style={styles.formTitle}>Mobile Number</Text>
            <View style={styles.inputBox}>
              <PhoneIcon size={textScale(25)} color={Colors.border_color} />
              <TextInput
                editable={false}
                style={styles.input}
                value={mobile}
                onChangeText={value => setMobile(value)}
                placeholder="1234#####"
                maxLength={10}
                placeholderTextColor={Colors.border_color}
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.btnContainer}>
            <CommonButton
              text={'Save'}
              textStyle={styles.btnText}
              buttonStyle={styles.btn}
              disabled={loading}
              isLoading={loading}
            />
          </View>
        </ScrollView>
        {/* Modal Popup */}
        <CustomBottomModal
          visible={isGenderModalVisible}
          message={'Choose Gender'}
          hideModal={() => setShowGenderModal(false)}
          data={genderData}
          selectedValue={text => {
            setGender(text);
            setShowGenderModal(false);
          }}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalView}>
            <View style={styles.modalButtonView}>
              <TouchableOpacity
                onPress={() => pickImageFromCamera()}
                style={styles.modalButton}
              >
                <CameraIcon size={25} color={Colors.forgetPassword} />
                <Text style={{ color: Colors.forgetPassword }}> Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickImageFromGallery()}
                style={styles.modalButton}
              >
                <PhotoIcon size={25} color={Colors.forgetPassword} />
                <Text style={{ color: Colors.forgetPassword }}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

export default PersonalDetails;

const styles = StyleSheet.create({
  imageStyle: {
    height: moderateScale(100),
    width: moderateScale(100),
    marginTop: moderateVerticalScale(20),
    borderRadius: moderateScale(10),
  },
  editIcon: {
    backgroundColor: 'white',
    position: 'absolute',
    top: moderateScale(95),
    left: moderateScale(80),
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
  },
  uploadImageButton: {
    color: Colors.forgetPassword,
    marginTop: moderateVerticalScale(20),
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  formHolder: {
    marginHorizontal: moderateScale(10),
    marginTop: moderateScale(10),
  },
  formTitle: {
    color: Colors.black,
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Platform.OS === 'android' ? moderateScale(5) : moderateScale(10),
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: moderateScale(10),
    marginVertical: moderateVerticalScale(10),
  },
  input: {
    flex: 1,
    marginLeft: moderateScale(10),
    fontSize: textScale(16),
    color: Colors.border_color,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  btnContainer: {
    width: '90%',
    marginTop: moderateVerticalScale(20),
    alignSelf: 'center',
  },
  btn: {
    backgroundColor: Colors.forgetPassword,
    justifyContent: 'center',
    alignItems: 'center',
    // height: moderateScale(40),
    borderRadius: moderateScale(10),
  },
  btnText: {
    color: Colors.white,
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_SemiBold,
    padding: moderateScale(3),
  },
  modalView: {
    backgroundColor: Colors.white,
    width: '100%',
    bottom: moderateScale(2),
    height: moderateScale(60),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    position: 'absolute',
  },
  modalButtonView: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    padding: moderateScale(10),
  },
  modalButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(30),
  },
  initialsContainer: {
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: moderateScale(75),
    backgroundColor: Colors.brandColor,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: moderateScale(20),
  },
  initialsText: {
    fontSize: textScale(40),
    color: Colors.white,
    fontFamily: FontFamily.Montserrat_Bold,
  },
});
