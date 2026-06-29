import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import Colors from '../../utils/Colors';
import { ImagePath } from '../../utils/ImagePath';
import { useNavigation } from '@react-navigation/native';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import WrapperContainer from '../../utils/WrapperContainer';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TermsAndConditions = () => {
  const navigation = useNavigation();

  const renderSection = (num, title, content) => {
    return (
      <View style={styles.sectionContainer} key={title}>
        <Text style={styles.sectionTitle}>{num}. {title}</Text>
        <Text style={styles.sectionText}>{content}</Text>
      </View>
    );
  };

  return (
    <WrapperContainer isLoading={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" color={Colors.black} size={textScale(24)} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={ImagePath.headerImage} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>Terms of Sale</Text>
          <Text style={styles.lastUpdated}>Effective Date: June 23, 2026</Text>

          <Text style={styles.introText}>
            Thank you for choosing Prem Industries India Limited for your packaging needs. These Terms of Sale govern your purchase of our products and outline the rights and responsibilities of both parties involved in the transaction. By placing an order with us, you agree to these terms. Please read them carefully before making a purchase.
          </Text>

          {renderSection(
            '1',
            'Ordering Process',
            '1.1 Order Placement: You may place orders for our products through our mobile application or other authorized sales channels. By doing so, you confirm that you are of legal age to enter into a binding contract.\n\n1.2 Order Confirmation: Upon placing an order, you will receive an order confirmation notification. This serves as acknowledgment that we have received your order. Please review it for accuracy and notify us immediately of any discrepancies.\n\n1.3 Payment: Payment for orders can be made via the payment methods provided in our application. We use secure payment processing to protect your financial information.'
          )}

          {renderSection(
            '2',
            'Product Information',
            '2.1 Product Descriptions: Our aim is to offer precise and comprehensive product descriptions. Nevertheless, we cannot guarantee that product descriptions or other content on our app are devoid of errors.\n\n2.2 Pricing: All prices for our products are listed in Indian Rupees (INR) and are subject to change without notice. The price you see at the time of your order placement will be the final price, excluding any applicable taxes or shipping charges.'
          )}

          {renderSection(
            '3',
            'Shipping and Delivery',
            '3.1 Shipping Times: We make every effort to process and ship orders promptly. Estimated delivery times are provided for your reference, but we do not guarantee specific delivery dates. Delays due to factors beyond our control, such as carrier issues or force majeure events, may occur.\n\n3.2 Shipping Costs: Shipping costs are calculated based on factors such as order weight, dimensions, and destination. You will see the shipping cost during the checkout process.\n\n3.3 Risk of Loss: The risk of loss or damage to products passes to you upon delivery. If you believe your order is lost or damaged during transit, please refer to our Shipping Policy for further instructions.'
          )}

          {renderSection(
            '4',
            'Returns and Exchanges',
            '4.1 Return Eligibility: We generally do not accept returns. Instead, we offer replacements in exceptional cases where an issue is substantiated with valid evidence.\n\n4.2 Return Process: To initiate a return or replacement, contact our customer support team for an RMA (Return Merchandise Authorization) number. You are responsible for return shipping costs unless the return is due to our error.'
          )}

          {renderSection(
            '5',
            'Privacy Policy',
            '5.1 Privacy Protection: Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.'
          )}

          {renderSection(
            '6',
            'Contact Information',
            'If you have questions or concerns about these Terms of Sale or any aspect of your order, please contact our customer support team at ecommerce@premindustries.in or call us at +91-8447247227.'
          )}

          {renderSection(
            '7',
            'Changes to Terms',
            'We reserve the right to modify these Terms of Sale at any time. Any changes will be effective immediately upon posting in our application. It is your responsibility to review these terms periodically.'
          )}

          <Text style={styles.thankYou}>
            By completing a purchase with Prem Industries India Limited, you agree to these Terms of Sale. We appreciate your business and are committed to providing you with high-quality packaging solutions.
          </Text>

          <View style={styles.footerSpacing} />
        </ScrollView>
      </View>
    </WrapperContainer>
  );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    height: moderateVerticalScale(55),
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border_grey,
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: moderateScale(140),
    height: moderateVerticalScale(35),
  },
  headerPlaceholder: {
    width: moderateScale(40),
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateVerticalScale(15),
  },
  screenTitle: {
    fontSize: textScale(24),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
  },
  lastUpdated: {
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.text_grey,
    marginTop: moderateVerticalScale(4),
    marginBottom: moderateVerticalScale(15),
  },
  introText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Medium,
    color: Colors.emailText,
    lineHeight: textScale(20),
    textAlign: 'justify',
    marginBottom: moderateVerticalScale(10),
  },
  sectionContainer: {
    marginTop: moderateVerticalScale(18),
  },
  sectionTitle: {
    fontSize: textScale(16),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
    marginBottom: moderateVerticalScale(6),
  },
  sectionText: {
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.term_condition,
    lineHeight: textScale(19),
    textAlign: 'justify',
  },
  thankYou: {
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_MediumItalic,
    color: Colors.brandColor,
    textAlign: 'center',
    marginTop: moderateVerticalScale(30),
    marginBottom: moderateVerticalScale(10),
  },
  footerSpacing: {
    height: moderateVerticalScale(40),
  },
});
