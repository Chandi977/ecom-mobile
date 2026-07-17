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

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  const renderSection = (title, content) => {
    return (
      <View style={styles.sectionContainer} key={title}>
        <Text style={styles.sectionTitle}>{title}</Text>
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
          <Text style={styles.screenTitle}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Effective Date: June 23, 2026</Text>

          <Text style={styles.introText}>
            At Prem Industries India Limited, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy delineates the manner in which we collect, utilize, disclose, and protect your personal information when you engage with our product packaging services and visit our mobile application, collectively referred to as "Services."
          </Text>

          {renderSection(
            'Acceptance of Terms',
            'By using our Services, you consent to the terms and conditions outlined in this Privacy Policy. If you do not agree with any part of this policy, please do not use our Services.'
          )}

          {renderSection(
            'How We Obtain and Collect Your Personal Information',
            'We collect personal information from you when you interact with our Services, including when you:\n• Place an order for our product packaging services.\n• Create an account on our application.\n• Contact us for customer support or inquiries.\n• Subscribe to our newsletter or marketing communications.\n• Participate in surveys, contests, or promotions.\n• Browse our application (through cookies and similar tracking technologies).'
          )}

          {renderSection(
            'Information We Collect',
            'The personal information we may collect includes but is not limited to:\n• Your name, contact information, and shipping address.\n• Payment details (such as credit card or gateway tokens).\n• Information related to your transactions and orders history.\n• Device type, identifiers, operating system, and diagnostics.'
          )}

          {renderSection(
            'Use of Personal Information',
            'We use your personal information for various business purposes, including but not limited to:\n• Processing, packing, and satisfying your packaging orders.\n• Providing customer assistance and addressing inquiries.\n• Sending you updates, notifications, and promotional emails.\n• Personalizing your experience and recommending relevant products.\n• Conducting analytics to improve our application and services.\n• Complying with regulatory and legal obligations.'
          )}

          {renderSection(
            'Disclosure of Personal Information',
            'We do not share, exchange, or lease your personal information to third parties without your consent, except as outlined in this Privacy Policy. We may disclose your data to:\n• Service providers and partners who assist us in providing services (such as delivery and payment partners).\n• Legal authorities, either when compelled by law or to safeguard our rights and interests.\n• Successor entities in the event of a merger, acquisition, or reorganization.'
          )}

          {renderSection(
            'Retention of Your Personal Information',
            'We keep your personal information for as long as necessary to achieve the objectives stated in this Privacy Policy, unless legal obligations or permissions permit or require a longer retention period.'
          )}

          {renderSection(
            'Data Transfers',
            'Your personal data might be moved to and held on servers situated in different nations. We implement appropriate measures to guarantee that your information is handled securely and in compliance with relevant data protection regulations.'
          )}

          {renderSection(
            'Changes to this Privacy Policy',
            'We reserve the right to periodically modify this Privacy Policy to account for shifts in our practices or other operational, legal, or regulatory requirements. We recommend that you regularly revisit this page for any updates.'
          )}

          {renderSection(
            'Contact Us',
            'If you have any queries about this Privacy Policy or how we handle your personal information, please contact us at ecommerce@premindustries.in or ecommerce@premindustries.com.'
          )}

          <Text style={styles.thankYou}>
            Thank you for choosing Prem Industries India Limited.
          </Text>

          <View style={styles.footerSpacing} />
        </ScrollView>
      </View>
    </WrapperContainer>
  );
};

export default PrivacyPolicy;

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
