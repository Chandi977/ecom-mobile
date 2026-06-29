import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';
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
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ContactUs = () => {
  const navigation = useNavigation();

  const handleAction = (url) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't open link", err));
  };

  const renderContactCard = (icon, title, desc, actionUrl, buttonText) => {
    return (
      <View style={styles.card} key={title}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Feather name={icon} size={textScale(22)} color={Colors.brandColor} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{desc}</Text>
          </View>
        </View>
        {buttonText && actionUrl ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => handleAction(actionUrl)}>
            <Text style={styles.actionButtonText}>{buttonText}</Text>
            <Feather name="arrow-right" size={textScale(14)} color={Colors.white} />
          </TouchableOpacity>
        ) : null}
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
          <Text style={styles.screenTitle}>Contact Us</Text>
          <Text style={styles.screenSubtitle}>
            Have questions or need assistance? Reach out to us through any of the channels below. We are here to help!
          </Text>

          {/* Contact Methods */}
          {renderContactCard(
            'phone',
            'Phone Call',
            '+91 84472 47227',
            'tel:+918447247227',
            'Call Now'
          )}

          {renderContactCard(
            'message-circle',
            'WhatsApp Chat',
            '+91 84472 47227',
            'whatsapp://send?phone=+918447247227&text=Hi,%20I%20have%20an%20enquiry.',
            'Chat on WhatsApp'
          )}

          {renderContactCard(
            'mail',
            'Email Support',
            'ecommerce@premindustries.in',
            'mailto:ecommerce@premindustries.in',
            'Send Email'
          )}

          {/* Working Hours */}
          {renderContactCard(
            'clock',
            'Working Hours',
            'Monday - Saturday\n9:00 AM - 6:00 PM IST',
            null,
            null
          )}

          {/* Address */}
          {renderContactCard(
            'map-pin',
            'Corporate Address',
            'C-209, Bulandshahar Road, Industrial Area, Ghaziabad, Uttar Pradesh, India - 201009',
            'https://maps.google.com/?q=C-209,+Bulandshahar+Road,+Industrial+Area,+Ghaziabad,+Uttar+Pradesh,+India',
            'Open Map Location'
          )}

          {/* Social Media Handles */}
          <Text style={styles.sectionHeader}>Follow Us</Text>
          <View style={styles.socialCard}>
            <View style={styles.socialRow}>
              <TouchableOpacity 
                style={styles.socialIconBtn} 
                onPress={() => handleAction('https://www.facebook.com/PremIndustriesIndiaLimited/')}
              >
                <FontAwesome name="facebook" size={textScale(24)} color="#1877F2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialIconBtn} 
                onPress={() => handleAction('https://www.instagram.com/prem_packaging/?hl=en')}
              >
                <FontAwesome name="instagram" size={textScale(24)} color="#E4405F" />
                <Text style={styles.socialText}>Instagram</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            <View style={styles.socialRow}>
              <TouchableOpacity 
                style={styles.socialIconBtn} 
                onPress={() => handleAction('https://in.linkedin.com/company/prem-packaging')}
              >
                <FontAwesome name="linkedin" size={textScale(24)} color="#0A66C2" />
                <Text style={styles.socialText}>LinkedIn</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialIconBtn} 
                onPress={() => handleAction('https://www.youtube.com/@premindustries9251/videos')}
              >
                <FontAwesome name="youtube-play" size={textScale(24)} color="#CD201F" />
                <Text style={styles.socialText}>YouTube</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Form Prompt */}
          <View style={styles.promptCard}>
            <Feather name="message-square" size={textScale(24)} color={Colors.brandColor} />
            <View style={styles.promptTextContainer}>
              <Text style={styles.promptTitle}>Need to report a specific issue?</Text>
              <Text style={styles.promptDescription}>
                You can file a support ticket directly inside the app to track bugs, order errors, or payments.
              </Text>
              <TouchableOpacity 
                style={styles.promptButton}
                onPress={() => navigation.navigate('Report')}
              >
                <Text style={styles.promptButtonText}>File a Report</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerSpacing} />
        </ScrollView>
      </View>
    </WrapperContainer>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backGround_grey,
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
    paddingHorizontal: moderateScale(15),
    paddingTop: moderateVerticalScale(10),
  },
  screenTitle: {
    fontSize: textScale(24),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
    marginBottom: moderateVerticalScale(5),
  },
  screenSubtitle: {
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.text_grey,
    lineHeight: textScale(18),
    marginBottom: moderateVerticalScale(20),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(15),
    marginBottom: moderateVerticalScale(12),
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.yellow_background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(15),
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
  },
  cardDesc: {
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_Medium,
    color: Colors.text_grey,
    marginTop: moderateVerticalScale(3),
    lineHeight: textScale(18),
  },
  actionButton: {
    backgroundColor: Colors.brandColor,
    height: moderateVerticalScale(36),
    borderRadius: moderateScale(6),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateVerticalScale(12),
    gap: moderateScale(8),
  },
  actionButtonText: {
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.white,
  },
  sectionHeader: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.text_grey,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: moderateVerticalScale(8),
    marginTop: moderateVerticalScale(15),
    paddingLeft: moderateScale(5),
  },
  socialCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    paddingVertical: moderateVerticalScale(5),
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: moderateVerticalScale(15),
  },
  socialRow: {
    flexDirection: 'row',
    paddingVertical: moderateVerticalScale(10),
  },
  socialIconBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
  },
  socialText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.emailText,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border_grey,
    marginHorizontal: moderateScale(20),
  },
  promptCard: {
    flexDirection: 'row',
    backgroundColor: Colors.yellow_background,
    borderColor: Colors.yellow,
    borderWidth: 0.5,
    borderRadius: moderateScale(10),
    padding: moderateScale(15),
    marginTop: moderateVerticalScale(15),
    alignItems: 'flex-start',
    gap: moderateScale(12),
  },
  promptTextContainer: {
    flex: 1,
  },
  promptTitle: {
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
    marginBottom: moderateVerticalScale(4),
  },
  promptDescription: {
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.brandColor,
    lineHeight: textScale(17),
    marginBottom: moderateVerticalScale(10),
  },
  promptButton: {
    backgroundColor: Colors.yellow,
    alignSelf: 'flex-start',
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateVerticalScale(6),
    borderRadius: moderateScale(5),
  },
  promptButtonText: {
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.white,
  },
  footerSpacing: {
    height: moderateVerticalScale(40),
  },
});
