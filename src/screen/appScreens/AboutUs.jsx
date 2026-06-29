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

const AboutUs = () => {
  const navigation = useNavigation();

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  const renderBulletPoint = (title, text) => {
    return (
      <View style={styles.bulletRow}>
        <Feather name="check-circle" size={textScale(18)} color={Colors.yellow} style={styles.bulletIcon} />
        <View style={styles.bulletTextContainer}>
          <Text style={styles.bulletTitle}>{title}</Text>
          <Text style={styles.bulletDesc}>{text}</Text>
        </View>
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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.screenTitle}>About Us</Text>
            <Text style={styles.tagline}>Innovation in Action</Text>
            <Text style={styles.description}>
              Prem Industries India Limited is a leading manufacturer and provider of high-quality packaging products. We specialize in designing and delivering custom packaging solutions that satisfy the unique requirements of our clients across various business sectors.
            </Text>
          </View>

          {/* Vision & Mission */}
          <View style={styles.gridRow}>
            <View style={styles.gridCard}>
              <Feather name="eye" size={textScale(24)} color={Colors.yellow} />
              <Text style={styles.cardTitle}>Our Vision</Text>
              <Text style={styles.cardText}>
                To pioneer smart and sustainable packaging technologies globally, adding visual and operational value to every product we wrap.
              </Text>
            </View>
            <View style={styles.gridCard}>
              <Feather name="target" size={textScale(24)} color={Colors.yellow} />
              <Text style={styles.cardTitle}>Our Mission</Text>
              <Text style={styles.cardText}>
                To deliver top-grade, eco-friendly corrugated boxes, labels, and specialty tapes while ensuring outstanding durability and performance.
              </Text>
            </View>
          </View>

          {/* Core Offerings */}
          <Text style={styles.sectionHeader}>Our Core Brands & Products</Text>
          <View style={styles.bulletCard}>
            {renderBulletPoint('PACKPRO™', 'Specialized BOPP tapes, food wrapping paper, carry handle tapes, and customized adhesive products.')}
            <View style={styles.separator} />
            {renderBulletPoint('ROLLABEL™', 'High-accuracy Direct Thermal and Chromo barcode labels suitable for e-commerce, retail, and logistics.')}
            <View style={styles.separator} />
            {renderBulletPoint('Corrugated Packaging', 'Robust and custom-sized shipping boxes designed to protect items through rough transit cycles.')}
            <View style={styles.separator} />
            {renderBulletPoint('Eco Carrier Bags', 'Biodegradable paper and poly-bags tailored to reduce environmental footprint while maintaining structural integrity.')}
          </View>

          {/* Contact Details */}
          <Text style={styles.sectionHeader}>Contact Information</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactRow} onPress={() => handleLinkPress('tel:+918447247227')}>
              <Feather name="phone" size={textScale(18)} color={Colors.brandColor} />
              <Text style={styles.contactText}>+91 84472 47227</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.contactRow} onPress={() => handleLinkPress('mailto:ecommerce@premindustries.in')}>
              <Feather name="mail" size={textScale(18)} color={Colors.brandColor} />
              <Text style={styles.contactText}>ecommerce@premindustries.in</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.contactRow} onPress={() => handleLinkPress('https://store.prempackaging.com')}>
              <Feather name="globe" size={textScale(18)} color={Colors.brandColor} />
              <Text style={styles.contactText}>store.prempackaging.com</Text>
            </TouchableOpacity>
          </View>

          {/* Legal Links Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.outlineButton} 
              onPress={() => navigation.navigate('Privacy Policy')}
            >
              <Feather name="file-text" size={textScale(16)} color={Colors.brandColor} />
              <Text style={styles.outlineButtonText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.outlineButton} 
              onPress={() => navigation.navigate('Terms And Conditions')}
            >
              <Feather name="shield" size={textScale(16)} color={Colors.brandColor} />
              <Text style={styles.outlineButtonText}>Terms & Conditions</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSpacing} />
        </ScrollView>
      </View>
    </WrapperContainer>
  );
};

export default AboutUs;

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
  heroSection: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(18),
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: moderateVerticalScale(15),
  },
  screenTitle: {
    fontSize: textScale(24),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
  },
  tagline: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.yellow,
    marginTop: moderateVerticalScale(2),
    marginBottom: moderateVerticalScale(10),
  },
  description: {
    fontSize: textScale(13),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.emailText,
    lineHeight: textScale(19),
    textAlign: 'justify',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(15),
    gap: moderateScale(10),
  },
  gridCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
    marginTop: moderateVerticalScale(6),
    marginBottom: moderateVerticalScale(4),
  },
  cardText: {
    fontSize: textScale(11),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.text_grey,
    textAlign: 'center',
    lineHeight: textScale(15),
  },
  sectionHeader: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.text_grey,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: moderateVerticalScale(8),
    marginTop: moderateVerticalScale(5),
    paddingLeft: moderateScale(5),
  },
  bulletCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    paddingVertical: moderateVerticalScale(5),
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: moderateVerticalScale(15),
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: moderateVerticalScale(10),
    paddingHorizontal: moderateScale(15),
  },
  bulletIcon: {
    marginTop: moderateVerticalScale(2),
    marginRight: moderateScale(12),
  },
  bulletTextContainer: {
    flex: 1,
  },
  bulletTitle: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.brandColor,
  },
  bulletDesc: {
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.text_grey,
    marginTop: moderateVerticalScale(2),
    lineHeight: textScale(16),
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border_grey,
    marginHorizontal: moderateScale(15),
  },
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    paddingVertical: moderateVerticalScale(5),
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: moderateVerticalScale(15),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    paddingHorizontal: moderateScale(15),
    gap: moderateScale(15),
  },
  contactText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Medium,
    color: Colors.emailText,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(10),
    marginTop: moderateVerticalScale(10),
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    height: moderateVerticalScale(45),
    borderWidth: 1.5,
    borderColor: Colors.brandColor,
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    gap: moderateScale(8),
  },
  outlineButtonText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
  },
  footerSpacing: {
    height: moderateVerticalScale(40),
  },
});
