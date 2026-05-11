import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { CartCountProvider, useCartCount } from './src/context/CartCountContext';
import { WishlistCountProvider, useWishlistCount } from './src/context/WishlistCountContext';
import AppDrawerContent from './src/components/AppDrawerContent';
import AppSplash from './src/components/AppSplash';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import BrandProductsScreen from './src/screens/BrandProductsScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import UtrPaymentScreen from './src/screens/UtrPaymentScreen';
import SearchScreen from './src/screens/SearchScreen';
import CategoryProductsScreen from './src/screens/CategoryProductsScreen';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();
const Drawer = createDrawerNavigator();

function HomeStack() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="BrandProducts" component={BrandProductsScreen} />
      <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

function CartTabIcon({ focused, color, size }: { focused: boolean; color: string; size: number }) {
  const count = useCartCount();
  return (
    <Ionicons
      name={focused ? 'cart' : 'cart-outline'}
      size={size}
      color={color}
    />
  );
}

function ProfileTabIcon({ focused, color, size }: { focused: boolean; color: string; size: number }) {
  return (
    <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'HomeTab') {
            return (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={size}
                color={color}
              />
            );
          }
          if (route.name === 'CartTab') {
            return <CartTabIcon focused={focused} color={color} size={size} />;
          }
          return <ProfileTabIcon focused={focused} color={color} size={size} />;
        },
        tabBarActiveTintColor: '#182C5A',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: 'Cart' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Account' }} />
    </Tab.Navigator>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(17,24,39,0.38)',
        drawerStyle: { width: 304, backgroundColor: '#F6F8FC' },
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} />
      <Drawer.Screen name="WishlistDrawer" component={WishlistScreen} />
      <Drawer.Screen name="OrdersDrawer" component={OrdersScreen} />
    </Drawer.Navigator>
  );
}

// Wrap the navigator so modal-style auth screens are available app-wide.
function Root() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Main" component={MainDrawer} />
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="Signup" component={SignupScreen} />
      <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <RootStack.Screen name="Checkout" component={CheckoutScreen} />
      <RootStack.Screen name="UtrPayment" component={UtrPaymentScreen} />
      <RootStack.Screen name="Orders" component={OrdersScreen} />
      <RootStack.Screen name="Wishlist" component={WishlistScreen} />
      <RootStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </RootStack.Navigator>
  );
}

export default function App() {
  const navRef = React.useRef<NavigationContainerRef<any>>(null);
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <AppSplash />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartCountProvider>
            <WishlistCountProvider>
              <CartProvider>
                <WishlistProvider>
                  <NavigationContainer ref={navRef}>
                    <Root />
                    <StatusBar style="light" />
                  </NavigationContainer>
                </WishlistProvider>
              </CartProvider>
            </WishlistCountProvider>
          </CartCountProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
