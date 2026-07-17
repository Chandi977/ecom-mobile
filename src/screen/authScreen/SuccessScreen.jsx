import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import Colors from '../../utils/Colors';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import { ImagePath } from '../../utils/ImagePath';
import { useNavigation } from '@react-navigation/native';
import WrapperContainer from '../../utils/WrapperContainer';
import CommonButton from '../../components/CommonButton';

const SuccessScreen = ({ route }) => {
  const { come, fromProductDetails } = route.params;
  const navigation = useNavigation();
  return (
    <WrapperContainer backgroundColor={Colors.forgetPassword}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ width: '100%', backgroundColor: Colors.forgetPassword }}>
          <Text style={styles.loginText}>Success</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.forgetPassword,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ImageBackground
            style={styles.bgImage}
            source={ImagePath.loginBg}
            resizeMode="stretch"
          >
            <View style={styles.v1}>
              {come === 'forgetPassword' && (
                <>
                  <Image
                    source={ImagePath.password}
                    resizeMode="contain"
                    style={styles.imageStyle}
                  />
                  <Text style={styles.text}>
                    Your password is changed successfully
                  </Text>
                  <CommonButton
                    handleAction={()=>navigation.navigate('Login')}
                    text={"Go Back to Login"}
                    buttonStyle={styles.button}
                    textStyle={styles.buttonText}
                  />
                </>
              )}
              {come === 'account' && (
                <>
                  <Image
                    source={ImagePath.account}
                    resizeMode="contain"
                    style={[
                      styles.imageStyle,
                      { width: '70%', height: moderateScale(200) },
                    ]}
                  />
                  <Text style={[styles.text, { width: '80%',marginTop:moderateVerticalScale(20) }]}>
                    Your account is successfully created
                  </Text>
                  <CommonButton
                    text={"Proceed"}
                    buttonStyle={styles.button}
                    textStyle={styles.buttonText}
                    handleAction={() => navigation.push('Login', { fromProductDetails })}
                  />
               </>
              )}
            </View>
          </ImageBackground>
        </View>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  loginText: {
    marginTop: moderateVerticalScale(80),
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
  v1: {
    flex: 1,
    overflow: 'hidden',
    paddingTop: moderateVerticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateVerticalScale(20),
  },
  imageStyle: {
    width: '80%',
    height: moderateScale(200),
  },
  text: {
    fontSize: textScale(20),
    textAlign: 'center',
    fontFamily: FontFamily.Montserrat_SemiBold,
    color: Colors.brandColor,
  },
  button: {
    width: '85%',
    alignSelf: 'center',
    borderWidth: 2,
    alignItems: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    borderColor: Colors.forgetPassword,
    backgroundColor: Colors.forgetPassword,
  },
  buttonText:{
    fontFamily:FontFamily.Montserrat_Medium,
    color:Colors.white,
    fontSize:textScale(16),
    padding:moderateVerticalScale(5)
  }
});
