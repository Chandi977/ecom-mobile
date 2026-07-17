import { StyleSheet, Text, View, Image, Switch, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
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
import StorageService from '../../utils/storageService';
import ApiService from '../../service/APIService';
import { showErrorMessage, showSuccessMessage } from '../../utils/HelperFunction';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  smsNotifications: true,
  personalizedRecommendations: true,
  usageAnalytics: true,
};

const AccountPrivacy = () => {
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // Local cache first so the UI is populated instantly / works offline & for guests.
      const storedPrefs = await StorageService.getItem('privacy_preferences');
      if (storedPrefs) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...storedPrefs });
      }

      const token = await StorageService.getItem('authToken');
      if (!token) {
        return;
      }
      setIsLoggedIn(true);

      // Server is the source of truth for signed-in users.
      setLoading(true);
      const response = await ApiService.GET_PRIVACY_PREFERENCES();
      const serverPrefs = response?.data;
      if (serverPrefs) {
        const merged = { ...DEFAULT_PREFERENCES, ...serverPrefs };
        setPreferences(merged);
        await StorageService.setItem('privacy_preferences', merged);
      }
    } catch (e) {
      console.log('Error loading privacy preferences:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const previous = preferences;
    const updated = {
      ...preferences,
      [key]: !preferences[key],
    };

    // Optimistic update + local cache.
    setPreferences(updated);
    try {
      await StorageService.setItem('privacy_preferences', updated);
    } catch (e) {
      console.log('Error caching privacy preferences:', e);
    }

    if (!isLoggedIn) {
      showSuccessMessage('Preferences updated successfully');
      return;
    }

    try {
      await ApiService.UPDATE_PRIVACY_PREFERENCES({ [key]: updated[key] });
      showSuccessMessage('Preferences updated successfully');
    } catch (e) {
      console.log('Error saving privacy preferences:', e);
      // Roll back so the toggle reflects the real server state.
      setPreferences(previous);
      await StorageService.setItem('privacy_preferences', previous);
      showErrorMessage('Could not update preferences. Please try again.');
    }
  };

  const renderPrivacySwitch = (key, title, description, icon) => {
    return (
      <View style={styles.switchRow} key={key}>
        <View style={styles.iconContainer}>
          <Feather name={icon} size={textScale(22)} color={Colors.brandColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.switchTitle}>{title}</Text>
          <Text style={styles.switchDescription}>{description}</Text>
        </View>
        <Switch
          value={preferences[key]}
          onValueChange={() => handleToggle(key)}
          trackColor={{ false: Colors.border_grey, true: Colors.yellow }}
          thumbColor={preferences[key] ? Colors.brandColor : Colors.backGround_grey}
        />
      </View>
    );
  };

  return (
    <WrapperContainer isLoading={loading}>
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
          <Text style={styles.screenTitle}>Account Privacy</Text>
          <Text style={styles.screenSubtitle}>
            Manage how your data is used and configure your notification and sharing preferences.
          </Text>

          <Text style={styles.sectionHeader}>Communications</Text>
          <View style={styles.card}>
            {renderPrivacySwitch(
              'emailNotifications',
              'Email Notifications',
              'Receive order updates, billing receipts, and promotional offers via email.',
              'mail'
            )}
            <View style={styles.separator} />
            {renderPrivacySwitch(
              'smsNotifications',
              'SMS Notifications',
              'Receive real-time shipping tracking alerts and OTP updates on your phone.',
              'message-square'
            )}
          </View>

          <Text style={styles.sectionHeader}>Personalization & Tracking</Text>
          <View style={styles.card}>
            {renderPrivacySwitch(
              'personalizedRecommendations',
              'Personalized Offers',
              'Allow us to customize product lists, deals, and recommendations based on your preferences.',
              'sliders'
            )}
            <View style={styles.separator} />
            {renderPrivacySwitch(
              'usageAnalytics',
              'Usage Analytics',
              'Share anonymous app usage diagnostics and crash reports to help us improve user experience.',
              'bar-chart-2'
            )}
          </View>

          {/* Privacy Note Card */}
          <View style={styles.noteCard}>
            <Feather name="shield" size={textScale(24)} color={Colors.brandColor} />
            <View style={styles.noteTextContainer}>
              <Text style={styles.noteTitle}>Your Data Security</Text>
              <Text style={styles.noteDescription}>
                We do not sell, exchange, or rent your personal information to third parties. All personal data is encrypted and handled securely in accordance with our Privacy Policy.
              </Text>
            </View>
          </View>

          <View style={styles.footerSpacing} />
        </ScrollView>
      </View>
    </WrapperContainer>
  );
};

export default AccountPrivacy;

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
    marginBottom: moderateVerticalScale(15),
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    paddingVertical: moderateVerticalScale(5),
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    paddingHorizontal: moderateScale(15),
  },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: Colors.yellow_background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  textContainer: {
    flex: 1,
    paddingRight: moderateScale(10),
  },
  switchTitle: {
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.brandColor,
  },
  switchDescription: {
    fontSize: textScale(11),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.text_grey,
    marginTop: moderateVerticalScale(3),
    lineHeight: textScale(15),
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border_grey,
    marginLeft: moderateScale(63),
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: Colors.yellow_background,
    borderColor: Colors.yellow,
    borderWidth: 0.5,
    borderRadius: moderateScale(10),
    padding: moderateScale(15),
    marginTop: moderateVerticalScale(25),
    alignItems: 'flex-start',
    gap: moderateScale(12),
  },
  noteTextContainer: {
    flex: 1,
  },
  noteTitle: {
    fontSize: textScale(15),
    fontFamily: FontFamily.Montserrat_Bold,
    color: Colors.brandColor,
    marginBottom: moderateVerticalScale(4),
  },
  noteDescription: {
    fontSize: textScale(12),
    fontFamily: FontFamily.Montserrat_Regular,
    color: Colors.brandColor,
    lineHeight: textScale(17),
  },
  footerSpacing: {
    height: moderateVerticalScale(40),
  },
});
