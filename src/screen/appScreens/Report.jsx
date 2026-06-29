import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Colors from '../../utils/Colors';
import { useNavigation } from '@react-navigation/native';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import ApiService from '../../service/APIService';
import WrapperContainer from '../../utils/WrapperContainer';
import InnerHeader from '../../components/Header/InnerHeader';
import CommonButton from '../../components/CommonButton';
import StorageService from '../../utils/storageService';
import { parseStoredUser, showErrorMessage, showSuccessMessage } from '../../utils/HelperFunction';

const Report = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Bug');
  const [message, setMessage] = useState('');

  const categories = [
    { id: 'Bug', label: 'Bug Report', icon: 'bug' },
    { id: 'Order', label: 'Order Issue', icon: 'shopping-bag' },
    { id: 'Payment', label: 'Payment Issue', icon: 'credit-card' },
    { id: 'Feedback', label: 'App Feedback', icon: 'smile' },
    { id: 'Other', label: 'Other Support', icon: 'help-circle' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userStr = await StorageService.getItem('user_data');
      if (userStr) {
        const userData = parseStoredUser(userStr);
        if (userData) {
          setName(`${userData.first_name || ''} ${userData.last_name || ''}`.trim());
          setEmail(userData.email_address || '');
          setPhone(userData.mobile_number || '');
        }
      }
    } catch (e) {
      console.log('Error fetching user data in Report:', e);
    }
  };

  const validateEmail = (mail) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    return regex.test(mail);
  };

  const validatePhone = (num) => {
    return num.length === 10 && /^\d+$/.test(num);
  };

  const handleSubmit = async () => {
    if (name.trim() === '' || email.trim() === '' || phone.trim() === '' || message.trim() === '') {
      showErrorMessage('Please fill out all the fields.');
      return;
    }

    if (!validateEmail(email)) {
      showErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!validatePhone(phone)) {
      showErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const payload = {
      name: name,
      email: email,
      phone: phone,
      category: category,
      message: message,
    };

    try {
      setLoading(true);
      const response = await ApiService.SUBMIT_REPORT(payload);
      
      // The API response might return 201 or success block
      // In APIService, it returns response.data
      if (response && (response.message || response.data)) {
        showSuccessMessage('Your report has been submitted successfully.');
        navigation.goBack();
      } else {
        showSuccessMessage('Report submitted successfully.');
        navigation.goBack();
      }
    } catch (error) {
      console.log('Error submitting report:', error);
      showErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WrapperContainer isLoading={loading}>
      <View style={styles.container}>
        <InnerHeader title="Report an Issue" containerStyle={styles.header} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Introductory Text */}
            <Text style={styles.intro}>
              Found a bug or experiencing an issue? Submit the form below, and our support team will look into it right away.
            </Text>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Your Name
                <Text style={styles.asterisk}> *</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={Colors.text_grey}
                value={name}
                onChangeText={(text) => setName(text)}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address
                <Text style={styles.asterisk}> *</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor={Colors.text_grey}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => setEmail(text)}
              />
            </View>

            {/* Mobile Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mobile Number
                <Text style={styles.asterisk}> *</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor={Colors.text_grey}
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              />
            </View>

            {/* Issue Category Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Select Category
                <Text style={styles.asterisk}> *</Text>
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsContainer}
                contentContainerStyle={styles.chipsContent}
              >
                {categories.map((item) => {
                  const isSelected = category === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                      onPress={() => setCategory(item.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Message Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Issue Description / Feedback
                <Text style={styles.asterisk}> *</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the issue you encountered in detail..."
                placeholderTextColor={Colors.text_grey}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={message}
                onChangeText={(text) => setMessage(text)}
              />
            </View>

            {/* Submit Button */}
            <CommonButton
              handleAction={handleSubmit}
              text="Submit Report"
              buttonStyle={styles.submitBtn}
              textStyle={styles.submitBtnText}
            />

            <View style={styles.footerSpacing} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </WrapperContainer>
  );
};

export default Report;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border_grey,
    marginTop: moderateVerticalScale(-20),
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(15),
    paddingTop: moderateVerticalScale(15),
  },
  intro: {
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_Medium,
    color: Colors.text_grey,
    lineHeight: textScale(18),
    marginBottom: moderateVerticalScale(20),
    textAlign: 'center',
    paddingHorizontal: moderateScale(10),
  },
  inputGroup: {
    marginBottom: moderateVerticalScale(15),
  },
  label: {
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.brandColor,
    fontSize: textScale(14),
    marginBottom: moderateVerticalScale(8),
  },
  asterisk: {
    color: Colors.red,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: moderateScale(8),
    borderColor: Colors.border_grey,
    backgroundColor: Colors.backGround_grey,
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(14),
    paddingHorizontal: moderateScale(12),
    height: moderateScale(50),
    color: Colors.black,
  },
  textArea: {
    height: moderateScale(120),
    paddingTop: moderateScale(12),
    paddingBottom: moderateScale(12),
  },
  chipsContainer: {
    flexDirection: 'row',
    marginTop: moderateVerticalScale(2),
  },
  chipsContent: {
    gap: moderateScale(8),
    paddingRight: moderateScale(15),
  },
  chip: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.brandColor,
    borderColor: Colors.brandColor,
  },
  chipUnselected: {
    backgroundColor: Colors.white,
    borderColor: Colors.border_grey,
  },
  chipText: {
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  chipTextUnselected: {
    color: Colors.text_grey,
  },
  submitBtn: {
    width: '100%',
    height: moderateScale(50),
    backgroundColor: Colors.brandColor,
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateVerticalScale(15),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  submitBtnText: {
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(15),
    color: Colors.white,
  },
  footerSpacing: {
    height: moderateVerticalScale(50),
  },
});
