import React, { memo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AppHeaderVariant = 'home' | 'listing' | 'utility' | 'slim';

interface AppHeaderProps {
  variant?: AppHeaderVariant;
  title?: string;
  cartCount?: number;
  wishlistCount?: number;
  onMenu?: () => void;
  onBack?: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
  onWishlist?: () => void;
  onCart?: () => void;
  activeSearch?: boolean;
  searchValue?: string;
  onChangeSearch?: (v: string) => void;
  onClearSearch?: () => void;
  searchPlaceholder?: string;
  autoFocusSearch?: boolean;
}

function HeaderIcon({
  name,
  count,
  onPress,
}: {
  name: keyof typeof Ionicons.glyphMap;
  count?: number;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.iconButton} activeOpacity={0.78} onPress={onPress}>
      <Ionicons name={name} size={20} color="#182C5A" />
      {!!count && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const AppHeader = memo(function AppHeader({
  variant = 'home',
  title,
  cartCount = 0,
  wishlistCount = 0,
  onMenu,
  onBack,
  onSearch,
  onFilter,
  onWishlist,
  onCart,
  activeSearch = false,
  searchValue,
  onChangeSearch,
  onClearSearch,
  searchPlaceholder = 'Search packaging products',
  autoFocusSearch = false,
}: AppHeaderProps) {
  const showSearchRow = variant === 'home' || variant === 'listing';
  const showActions = variant !== 'slim';
  const isHome = variant === 'home';
  const showMenuAction = !isHome && showActions && !!onFilter;
  const showSearchRowMenuButton = isHome && !!onFilter;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconSquare}
          activeOpacity={0.78}
          onPress={isHome ? onMenu : onBack}
        >
          <Ionicons
            name={isHome ? 'menu' : 'arrow-back'}
            size={isHome ? 24 : 22}
            color="#182C5A"
          />
        </TouchableOpacity>

        {isHome ? (
          <TouchableOpacity style={styles.brand} activeOpacity={0.82} onPress={onSearch}>
            <Image
              source={require('../../assets/prem-logo-head.png')}
              style={styles.logoMark}
              resizeMode="contain"
            />
            <View style={styles.brandText}>
              <Text style={styles.brandName} numberOfLines={1}>Prem Industries</Text>
              <Text style={styles.brandSub} numberOfLines={1}>Packaging Store</Text>
            </View>
          </TouchableOpacity>
        ) : variant === 'slim' ? (
          <View style={styles.brand}>
            <Image
              source={require('../../assets/prem-logo-head.png')}
              style={styles.logoMark}
              resizeMode="contain"
            />
            <View style={styles.brandText}>
              <Text style={styles.brandName} numberOfLines={1}>Prem Industries</Text>
              <Text style={styles.brandSub} numberOfLines={1}>
                {title || 'Packaging Store'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.titleWrap}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title || ''}
            </Text>
          </View>
        )}

        {showActions && (
          <View style={styles.actions}>
            {showMenuAction && (
              <HeaderIcon name="menu-outline" onPress={onFilter} />
            )}
            <HeaderIcon name="heart-outline" count={wishlistCount} onPress={onWishlist} />
            <HeaderIcon name="cart-outline" count={cartCount} onPress={onCart} />
          </View>
        )}
      </View>

      {showSearchRow && (
        <View style={styles.searchRow}>
          {activeSearch ? (
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#697184" />
              <TextInput
                style={styles.searchInput}
                value={searchValue}
                onChangeText={onChangeSearch}
                placeholder={searchPlaceholder}
                placeholderTextColor="#697184"
                autoFocus={autoFocusSearch}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                autoComplete="off"
                importantForAutofill="no"
                textContentType="none"
                returnKeyType="search"
              />
              {!!searchValue?.length && (
                <TouchableOpacity onPress={onClearSearch} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="#697184" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.searchBox} activeOpacity={0.82} onPress={onSearch}>
              <Ionicons name="search" size={18} color="#697184" />
              <Text style={styles.searchText} numberOfLines={1}>{searchPlaceholder}</Text>
            </TouchableOpacity>
          )}
          {showSearchRowMenuButton && (
            <TouchableOpacity style={styles.filterButton} activeOpacity={0.82} onPress={onFilter}>
              <Ionicons name="menu-outline" size={19} color="#fff" />
              <Text style={styles.filterText}>Menu</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

export default AppHeader;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAF0',
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  iconSquare: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F3F6FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  logoMark: { width: 34, height: 34 },
  brandText: { flex: 1, minWidth: 0, marginLeft: 8 },
  brandName: {
    color: '#182C5A',
    fontSize: 16,
    fontWeight: '800',
  },
  brandSub: {
    color: '#737B8F',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
  },
  titleText: {
    color: '#182C5A',
    fontSize: 16,
    fontWeight: '800',
  },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F3F6FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#E92227',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  searchBox: {
    flex: 1,
    minWidth: 0,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F4F6FA',
    borderWidth: 1,
    borderColor: '#E3E7EF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchText: { color: '#697184', fontSize: 13, marginLeft: 8, flex: 1 },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#111',
    paddingVertical: 0,
  },
  filterButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#182C5A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  filterText: { color: '#fff', fontWeight: '800', fontSize: 12, marginLeft: 5 },
});
