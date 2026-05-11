import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { goToCart, goToWishlist } from '../utils/navigation';

type CatalogFilter = {
  category?: string | string[];
  subcategory?: string | string[];
};

type CatalogNavItem = {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  filter: CatalogFilter;
  children?: CatalogNavItem[];
};

const PACKPRO_TAPE_CATEGORY_IDS = ['6557df64301ec4f2f4266141'];
const PACKPRO_CARRY_BAG_CATEGORY_IDS = [
  '6557df71301ec4f2f4266145',
  '689d73214687bb4e437542e0',
];
const PACKPRO_FOOD_WRAPPING_CATEGORY_IDS = [
  '69dcb22e733b8ba056529a9f',
  '679ca70f2833ca433fa0aa9c',
];

const catalogGroups: CatalogNavItem[] = [
  {
    key: 'corrugated-boxes',
    label: 'CORRUGATED BOXES',
    icon: 'cube-outline',
    filter: { category: '6557deab301ec4f2f4266131' },
  },
  {
    key: 'paper-bags',
    label: 'PAPER BAGS',
    icon: 'bag-outline',
    filter: { category: '6557df46301ec4f2f4266139' },
  },
  {
    key: 'poly-bags',
    label: 'POLY BAGS',
    icon: 'albums-outline',
    filter: { category: '6557df4f301ec4f2f426613d' },
  },
  {
    key: 'packpro',
    label: 'PACKPRO',
    icon: 'briefcase-outline',
    filter: {
      category: [
        ...PACKPRO_CARRY_BAG_CATEGORY_IDS,
        ...PACKPRO_FOOD_WRAPPING_CATEGORY_IDS,
        ...PACKPRO_TAPE_CATEGORY_IDS,
      ],
    },
    children: [
      {
        key: 'packpro-all',
        label: 'ALL PACKPRO',
        filter: {
          category: [
            ...PACKPRO_CARRY_BAG_CATEGORY_IDS,
            ...PACKPRO_FOOD_WRAPPING_CATEGORY_IDS,
            ...PACKPRO_TAPE_CATEGORY_IDS,
          ],
        },
      },
      {
        key: 'carry-bags',
        label: 'CARRY BAGS',
        filter: { category: PACKPRO_CARRY_BAG_CATEGORY_IDS },
      },
      {
        key: 'food-wrapping-papers',
        label: 'FOOD WRAPPING PAPERS',
        filter: { category: PACKPRO_FOOD_WRAPPING_CATEGORY_IDS },
      },
      {
        key: 'packpro-tapes',
        label: 'TAPES',
        filter: { category: PACKPRO_TAPE_CATEGORY_IDS },
      },
    ],
  },
  {
    key: 'rollabel',
    label: 'ROLLABEL',
    icon: 'pricetags-outline',
    filter: { category: '6557deb6301ec4f2f4266135' },
    children: [
      {
        key: 'rollabel-all',
        label: 'ALL ROLLABEL',
        filter: { category: '6557deb6301ec4f2f4266135' },
      },
      {
        key: 'direct-thermal-labels',
        label: 'DIRECT THERMAL LABELS',
        filter: { subcategory: '6557e1cb301ec4f2f426614c' },
      },
      {
        key: 'chromo-labels',
        label: 'CHROMO LABELS',
        filter: { subcategory: '6557e236301ec4f2f4266154' },
      },
    ],
  },
];

const drawerItems = [
  { label: 'Home', icon: 'home-outline', route: 'home' },
  { label: 'Categories', icon: 'grid-outline', route: 'categories' },
  { label: 'Search Products', icon: 'search-outline', route: 'search' },
  { label: 'Wishlist', icon: 'heart-outline', route: 'wishlist' },
  { label: 'Cart', icon: 'cart-outline', route: 'cart' },
  { label: 'My Orders', icon: 'receipt-outline', route: 'orders' },
  { label: 'Account', icon: 'person-outline', route: 'account' },
] as const;

function navigateDrawer(navigation: any, route: string) {
  if (route === 'home') {
    navigation.navigate('MainTabs', { screen: 'HomeTab', params: { screen: 'Home' } });
    return;
  }
  if (route === 'search') {
    navigation.navigate('MainTabs', { screen: 'HomeTab', params: { screen: 'Search' } });
    return;
  }
  if (route === 'wishlist') {
    goToWishlist(navigation);
    return;
  }
  if (route === 'cart') {
    goToCart(navigation);
    return;
  }
  if (route === 'orders') {
    navigation.navigate('OrdersDrawer');
    return;
  }
  navigation.navigate('MainTabs', { screen: 'ProfileTab' });
}

function navigateToCatalog(navigation: any, item: CatalogNavItem) {
  navigation.navigate('MainTabs', {
    screen: 'HomeTab',
    params: {
      screen: 'CategoryProducts',
      params: {
        catalog: {
          name: item.label,
          key: item.key,
          filter: item.filter,
        },
      },
    },
  });
  navigation.closeDrawer?.();
}

export default function AppDrawerContent(props: any) {
  const { navigation } = props;
  const rootNavigation = navigation.getParent?.();
  const { user, token, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const signedIn = !!token;
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Guest customer';

  const toggleCatalogGroup = (key: string) => {
    setExpandedGroups((current) => ({ ...current, [key]: !current[key] }));
  };

  const renderCatalogItem = (item: CatalogNavItem) => {
    const hasChildren = !!item.children?.length;
    const isExpanded = !!expandedGroups[item.key];

    return (
      <View key={item.key}>
        <TouchableOpacity
          style={styles.catalogItem}
          activeOpacity={0.76}
          onPress={() => (hasChildren ? toggleCatalogGroup(item.key) : navigateToCatalog(navigation, item))}
        >
          <Ionicons name={item.icon || 'ellipse-outline'} size={17} color="#182C5A" />
          <Text style={styles.catalogLabel} numberOfLines={1}>
            {item.label}
          </Text>
          <Ionicons
            name={hasChildren ? (isExpanded ? 'chevron-up' : 'chevron-down') : 'chevron-forward'}
            size={15}
            color="#A4ABBA"
          />
        </TouchableOpacity>

        {hasChildren && isExpanded && (
          <View style={styles.catalogChildren}>
            {item.children?.map((child) => (
              <TouchableOpacity
                key={child.key}
                style={styles.catalogChildItem}
                activeOpacity={0.76}
                onPress={() => navigateToCatalog(navigation, child)}
              >
                <View style={styles.subBullet} />
                <Text style={styles.catalogChildLabel} numberOfLines={1}>
                  {child.label}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#A4ABBA" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.wrap}>
      <View style={styles.brandBlock}>
        <Image
          source={require('../../assets/prem-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>Prem Industries</Text>
        <Text style={styles.brandSub}>Packaging Store</Text>
      </View>

      <View style={styles.userBox}>
        <View style={styles.avatar}>
          <Ionicons name={signedIn ? 'person' : 'person-outline'} size={22} color="#182C5A" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.userMeta} numberOfLines={1}>
            {signedIn ? user?.email_address || 'Signed in' : 'Sign in for orders and saved cart'}
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{wishlistCount}</Text>
          <Text style={styles.metricLabel}>Wishlist</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{cartCount}</Text>
          <Text style={styles.metricLabel}>Cart</Text>
        </View>
      </View>

      <View style={styles.navList}>
        {drawerItems.map((item) => {
          if (item.route === 'categories') {
            return (
              <View key={item.route} style={styles.navGroup}>
                <TouchableOpacity
                  style={styles.navItem}
                  activeOpacity={0.76}
                  onPress={() => setCategoriesExpanded((current) => !current)}
                >
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color="#182C5A" />
                  <Text style={styles.navLabel}>{item.label}</Text>
                  <Ionicons
                    name={categoriesExpanded ? 'chevron-up' : 'chevron-down'}
                    size={17}
                    color="#A4ABBA"
                  />
                </TouchableOpacity>

                {categoriesExpanded && (
                  <View style={styles.catalogList}>
                    {catalogGroups.map(renderCatalogItem)}
                  </View>
                )}
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={item.route}
              style={styles.navItem}
              activeOpacity={0.76}
              onPress={() => navigateDrawer(navigation, item.route)}
            >
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color="#182C5A" />
              <Text style={styles.navLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={17} color="#A4ABBA" />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        {signedIn ? (
          <TouchableOpacity style={styles.authButton} activeOpacity={0.78} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color="#C62828" />
            <Text style={styles.authTextDanger}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.authButton}
            activeOpacity={0.78}
            onPress={() => rootNavigation?.navigate('Login')}
          >
            <Ionicons name="log-in-outline" size={18} color="#182C5A" />
            <Text style={styles.authText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, backgroundColor: '#F6F8FC', paddingBottom: 22 },
  brandBlock: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAF0',
  },
  logo: { width: 138, height: 70, alignSelf: 'flex-start' },
  brandTitle: { color: '#182C5A', fontSize: 20, fontWeight: '900', marginTop: 6 },
  brandSub: { color: '#E92227', fontSize: 12, fontWeight: '800', marginTop: 2 },
  userBox: {
    margin: 14,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userName: { color: '#111827', fontWeight: '800', fontSize: 14 },
  userMeta: { color: '#737B8F', fontSize: 11, marginTop: 2 },
  metrics: {
    marginHorizontal: 14,
    backgroundColor: '#182C5A',
    borderRadius: 12,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  metric: { flex: 1, alignItems: 'center' },
  metricDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.22)' },
  metricValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  metricLabel: { color: '#D9E0F3', fontSize: 11, marginTop: 2, fontWeight: '700' },
  navList: { paddingHorizontal: 10, paddingTop: 10 },
  navGroup: { marginBottom: 7 },
  navItem: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 7,
  },
  navLabel: { flex: 1, color: '#182C5A', fontSize: 14, fontWeight: '800', marginLeft: 10 },
  catalogList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: -2,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E7EBF2',
  },
  catalogItem: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  catalogLabel: { flex: 1, color: '#182C5A', fontSize: 13, fontWeight: '900', marginLeft: 9 },
  catalogChildren: {
    borderLeftWidth: 1,
    borderLeftColor: '#E7EBF2',
    marginLeft: 12,
    paddingLeft: 12,
    paddingBottom: 4,
  },
  catalogChildItem: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingRight: 4,
  },
  subBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E92227',
    marginRight: 10,
  },
  catalogChildLabel: { flex: 1, color: '#2F3D59', fontSize: 12, fontWeight: '800' },
  footer: { marginTop: 'auto', paddingHorizontal: 14, paddingTop: 12 },
  authButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E1E5EE',
  },
  authText: { color: '#182C5A', fontWeight: '900', marginLeft: 7 },
  authTextDanger: { color: '#C62828', fontWeight: '900', marginLeft: 7 },
});
