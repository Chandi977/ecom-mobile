import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { navigationRef } from './navigationRef';
import CustomForm from '../screen/appScreens/CustomForm';
import Login from '../screen/authScreen/Login';
import ForgetPassword from '../screen/authScreen/forgetPassword/ForgetPassword';
import OTP from '../screen/authScreen/OTP';
import SuccessScreen from '../screen/authScreen/SuccessScreen';
import Signup from '../screen/authScreen/Signup';
import UpdatePassword from '../screen/authScreen/forgetPassword/UpdatePassword';
import DrawerNavigation from '../navigation/DrawerNavigation';
import ProductDetails from '../components/ProductDetails';
import PersonalDetails from '../components/Profile/PersonalDetails';
import MyOrders from '../components/Profile/MyOrders';
import CategoryDetailsTwo from '../components/Home/CategoryDetailsTwo';
import Profile from '../screen/appScreens/Profile';
import ShippingDetails from '../components/Profile/ShippingDetails';
import AddAddress from '../components/Profile/AddAddress';
import Cart from '../screen/appScreens/Cart';
import Wishlist from '../components/Profile/Wishlist';
import SuccessPage from '../components/General/SuccessPage';
import ShowAddressPage from '../components/showAddresspage';
import ChekoutScreen from "../screen/appScreens/ChekoutScreen";
import SelectAddress from "../components/selectAddress";
import OrderDetails from "../components/Profile/OrderDetails"
import PaymentFailedScreen from "../components/General/PaymentFailedScreen";
import AboutUs from '../screen/appScreens/AboutUs';
import PrivacyPolicy from '../screen/appScreens/PrivacyPolicy';
import TermsAndConditions from '../screen/appScreens/TermsAndConditions';
import Report from '../screen/appScreens/Report';
import Settings from '../screen/appScreens/Settings';
import AccountPrivacy from '../screen/appScreens/AccountPrivacy';
import ContactUs from '../screen/appScreens/ContactUs';
import Notifications from '../screen/appScreens/Notifications';

const Stack = createStackNavigator();

const StackNavigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Drawer" component={DrawerNavigation} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="AccountPrivacy" component={AccountPrivacy} />
        <Stack.Screen name="Contact Us" component={ContactUs} />
        <Stack.Screen name="About Us" component={AboutUs} />
        <Stack.Screen name="Privacy Policy" component={PrivacyPolicy} />
        <Stack.Screen name="Terms And Conditions" component={TermsAndConditions} />
        <Stack.Screen name="Report" component={Report} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="forgetPassword" component={ForgetPassword} />
        <Stack.Screen name="Otp" component={OTP} />
        <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
        <Stack.Screen name="SignUp" component={Signup} />
        <Stack.Screen name="UpdatePassword" component={UpdatePassword} />
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
        <Stack.Screen name="My Order" component={MyOrders} />
        <Stack.Screen
          name="CategoryDetailsTwo"
          component={CategoryDetailsTwo}
        />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Shipping Address" component={ShippingDetails} />
        <Stack.Screen name="AddAddress" component={AddAddress} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="WishList2" component={Wishlist} />
        <Stack.Screen name="SuccessPage" component={SuccessPage} />
        <Stack.Screen name="PaymentFailedScreen" component={PaymentFailedScreen} />
        <Stack.Screen name="Show Address" component={ShowAddressPage} />
        <Stack.Screen name='Checkout' component={ChekoutScreen}/>
        <Stack.Screen name='Final Review' component={SelectAddress} />
         <Stack.Screen name='OrderDetails' component={OrderDetails}/>
        
        {/* 
       
       
    
        
        <Stack.Screen name='BottomNavigation' component={BottomNavigation} options={{headerShown:false}}/>
        
        <Stack.Screen name='Payment' component={PaymentScreen} />
       
        
       
        <Stack.Screen name='Wishlist' component={Favourite} options={{headerShown:false}}/>
        <Stack.Screen name='CategoryDetails' component={CategoryDetails} options={{headerShown:false}}/>
        <Stack.Screen name='Filter' component={FilterScreen} options={{headerShown:false}}/>
       
        
       
        
        
         */}
        <Stack.Screen
          name="Custom Form"
          component={CustomForm}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigation;

const styles = StyleSheet.create({});
