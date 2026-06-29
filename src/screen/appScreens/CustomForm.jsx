import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import Colors from '../../utils/Colors';
import FontFamily from '../../utils/FontFamily';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../service/APIService';
import WrapperContainer from '../../utils/WrapperContainer';
import InnerHeader from '../../components/Header/InnerHeader';
import CommonButton from '../../components/CommonButton';
import {
  showErrorMessage,
  showSuccessMessage,
} from '../../utils/HelperFunction';

const CustomForm = () => {
  const [companyName, setCompanyName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [moq, setMoq] = useState('');
  const [queryDetails, setQueryDetails] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactPersonEmail, setContactPersonEmail] = useState('');
  const [contactPersonMobile, setContactPersonMobile] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const validatePhone = phone => {
    return phone.length === 10 && /^\d+$/.test(phone);
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
  const validateNumber = value => {
    return /^\d+$/.test(value);
  };

  const handleMobileChange = text => {
    if (text === '' || validateNumber(text)) {
      setContactPersonMobile(text);
    }
  };

  const handleSubmit = async () => {
    if (
      companyName.trim() === '' ||
      productCategory.trim() === '' ||
      moq.trim() === '' ||
      queryDetails.trim() === '' ||
      contactPersonName.trim() === '' ||
      contactPersonMobile.trim() === ''
    ) {
      showErrorMessage('Need to field all the filed');
      return;
    }
    if (!validateEmail(contactPersonEmail)) {
      showErrorMessage('Need to field correct Email id.');
      return;
    }
    if (!validatePhone(contactPersonMobile)) {
      showErrorMessage('Need to field correct Mobile Number.');
      return;
    }
    const data = {
      company_name: companyName,
      contact_person_email: contactPersonEmail,
      contact_person_mobile_number: contactPersonMobile,
      contact_person_name: contactPersonName,
      moq: moq,
      product_category: productCategory,
      rich_text: queryDetails,
    };
    try {
      setLoading(true);
      const response = await ApiService.CUSTOM_PACKAGING(data);
      if (response?.success === true) {
        showSuccessMessage(response?.message);
        navigation.goBack();
      } else {
        showErrorMessage(response?.message);
      }
      console.log(response, 'line 101');
    } catch (error) {
      console.log(error, 'line 99');
    } finally {
      setCompanyName('');
      setProductCategory('');
      setMoq('');
      setQueryDetails('');
      setContactPersonName('');
      setContactPersonEmail('');
      setContactPersonMobile('');
      setLoading(false);
    }
    console.log('Submit Button Clicked', data);
  };

  return (
    <WrapperContainer isLoading={loading}>
      <View style={styles.view1}>
        {/* HeaderView */}
        <InnerHeader title="Custom Packaging Form" containerStyle={styles.headerHolder} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? moderateScale(10) : moderateScale(20)
          }
        >
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ width: '95%', alignSelf: 'center',backgroundColor:Colors.white }}
          >
            <View style={styles.inputBoxHolderView}>
              <Text style={styles.label}>
                Company Name
                <Text style={{ color: 'red' }}> *</Text>
              </Text>
              <TextInput
                placeholder="Company Name"
                placeholderTextColor={Colors.black}
                value={companyName}
                onChangeText={text => setCompanyName(text)}
                style={styles.inputBoxHolder}
                autoFocus={true}
              />
            </View>
            <View style={styles.inputBoxHolderView}>
              <Text style={styles.label}>
                Product Category
                <Text style={{ color: 'red' }}> *</Text>
              </Text>
              <TextInput
                placeholder="Product Category"
                placeholderTextColor={Colors.black}
                value={productCategory}
                onChangeText={text => setProductCategory(text)}
                style={styles.inputBoxHolder}
              />
            </View>
            <View style={styles.inputBoxHolderView}>
              <Text style={styles.label}>
                MOQ
                <Text style={{ color: 'red' }}> *</Text>
              </Text>
              <TextInput
                placeholder="MOQ"
                placeholderTextColor={Colors.black}
                value={moq}
                onChangeText={text => setMoq(text)}
                style={styles.inputBoxHolder}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputBoxHolderView}>
              <Text style={styles.label}>
                Query Details
                <Text style={{ color: 'red' }}> *</Text>
              </Text>
              <TextInput
                multiline={true}
                placeholder="Query Details"
                placeholderTextColor={Colors.black}
                value={queryDetails}
                onChangeText={text => setQueryDetails(text)}
                style={styles.inputBoxHolder}
              />
            </View>
            <View style={styles.inputBoxHolderView}>
              <Text style={styles.label}>
                Contact Person Name
                <Text style={{ color: 'red' }}> *</Text>
              </Text>
              <TextInput
                placeholder="Contact Person Name"
                placeholderTextColor={Colors.black}
                value={contactPersonName}
                onChangeText={text => setContactPersonName(text)}
                style={styles.inputBoxHolder}
              />
            </View>
            <View style={styles.inputBoxHolderView}>
              <Text style={styles.label}>
                Contact Person Email
                <Text style={{ color: 'red' }}> *</Text>
              </Text>
              <TextInput
                autoCapitalize="none"
                placeholder="Contact Person Email"
                placeholderTextColor={Colors.black}
                value={contactPersonEmail}
                onChangeText={text => setContactPersonEmail(text)}
                style={styles.inputBoxHolder}
              />
            </View>
            <View style={styles.inputBoxHolderView}>
              <Text style={styles.label}>
                Contact Person Mobile Number
                <Text style={{ color: 'red' }}> *</Text>
              </Text>
              <TextInput
                keyboardType="number-pad"
                placeholder="Contact Person Mobile Number"
                placeholderTextColor={Colors.black}
                value={contactPersonMobile}
                onChangeText={handleMobileChange}
                style={styles.inputBoxHolder}
                maxLength={10}
              />
            </View>
            <CommonButton
              handleAction={() => handleSubmit()}
              text={'Submit'}
              buttonStyle={styles.buttonHolder}
              textStyle={styles.buttonText}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </WrapperContainer>
  );
};

export default CustomForm;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  label: {
    fontFamily: FontFamily.Montserrat_Medium,
    color: Colors.brandColor,
    fontSize: textScale(15),
  },
  inputBoxHolder: {
    borderWidth: 2,
    width: '100%',
    borderRadius: moderateScale(5),
    height: moderateScale(60),
    borderColor: Colors.back,
    backgroundColor: Colors.back,
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(14),
    paddingHorizontal: moderateScale(10),
  },
  inputBoxHolderView: {
    marginVertical: moderateVerticalScale(10),
    width: '95%',
    alignSelf: 'center',
    gap: moderateVerticalScale(10),
  },
  headerHolder: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    padding: moderateScale(10),
    backgroundColor:Colors.white,
    marginTop:moderateVerticalScale(-20)
  },
  buttonText: {
    fontFamily: FontFamily.Montserrat_Medium,
    fontSize: textScale(15),
    color: Colors.white,
    textAlign: 'center',
  },
  buttonHolder: {
    width: '90%',
    padding: moderateScale(15),
    backgroundColor: '#14254C',
    borderRadius: moderateScale(10),
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: moderateVerticalScale(20),
    marginBottom: moderateVerticalScale(40),
  },
  view1: {
    flex: 1,
  },
});
