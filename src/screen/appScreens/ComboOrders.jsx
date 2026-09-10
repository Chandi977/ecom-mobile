import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Colors from '../../utils/Colors';
import { useNavigation } from '@react-navigation/native';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import WrapperContainer from '../../utils/WrapperContainer';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ApiService from '../../service/APIService';
import CartService from '../../service/CartService';

const getImageSrc = combo => {
  const firstImage = (combo?.images || []).find(Boolean);
  if (typeof firstImage === 'string') return firstImage;
  if (firstImage?.image) return firstImage.image;
  const firstItem = (combo?.items || []).find(item => item?.product?.images?.length);
  return firstItem?.product?.images?.[0]?.image || null;
};

const getPrice = combo => {
  const tier = Array.isArray(combo?.priceList) && combo.priceList.length
    ? combo.priceList[0]
    : null;
  if (tier) return tier.price;
  return combo?.price || 0;
};

const getContents = combo =>
  (combo?.items || []).reduce(
    (acc, item) => acc + (item?.quantity || 0),
    0,
  );

const formatINR = value =>
  value ? `₹${Number(value).toLocaleString('en-IN')}` : '';

const renderComboCard = (combo, onAdd) => {
  const imageSrc = getImageSrc(combo);
  const price = getPrice(combo);
  const contents = getContents(combo);

  return (
    <View key={combo?._id} style={styles.card}>
      <View style={styles.cardImageWrapper}>
        {imageSrc ? (
          <Image source={{ uri: imageSrc }} style={styles.cardImage} resizeMode="contain" />
        ) : (
          <View style={[styles.cardImage, styles.cardImageFallback]}>
            <Ionicons name="cube-outline" size={textScale(44)} color={Colors.border_grey} />
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {combo?.name || 'Combo'}
        </Text>
        {combo?.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {combo.description}
          </Text>
        ) : null}
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardPrice}>{formatINR(price)}</Text>
          <View style={styles.cardCountBadge}>
            <Text style={styles.cardCountText}>
              {combo?.items?.length || 0} products{contents > 0 ? ` · ${contents} units` : ''}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => onAdd(combo)}>
          <Feather name="shopping-cart" size={textScale(15)} color={Colors.white} />
          <Text style={styles.addButtonText}>Add bundle to cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ComboOrders = () => {
  const navigation = useNavigation();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await ApiService.GET_ALL_COMBOS();
        if (active) setCombos(response?.data || []);
      } catch (error) {
        console.log('GET_ALL_COMBOS failed:', error?.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = useCallback(async combo => {
    const items = (combo?.items || []).filter(item => item?.product && item?.quantity);
    if (!items.length) {
      Alert.alert('Combo orders', 'This combo has no products yet.');
      return;
    }
    let failures = 0;
    for (const item of items) {
      const result = await CartService.addToCart(item.product);
      if (!result?.success) failures += 1;
    }
    if (failures) {
      Alert.alert(
        'Combo orders',
        'Some products could not be added. Please try again.',
      );
    } else {
      Alert.alert(
        'Combo orders',
        `${(combo?.items || []).length} products added to your cart.`,
      );
    }
  }, []);

  const renderListHeader = () => (
    <View>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={textScale(24)} color={Colors.brandColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Combo Orders</Text>
      </View>
      <Text style={styles.subtitle}>
        Curated packaging bundles. Adding a combo drops every product in it into
        your cart at its regular pack size.
      </Text>
    </View>
  );

  return (
    <WrapperContainer isLoading={loading}>
      {combos.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          {renderListHeader()}
          <View style={styles.emptyInner}>
            <Ionicons name="cube-outline" size={textScale(56)} color={Colors.border_grey} />
            <Text style={styles.emptyText}>
              No combos are available right now. Check back soon.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={combos}
          keyExtractor={item => item?._id || String(item?.name || '')}
          renderItem={({ item }) => renderComboCard(item, handleAddToCart)}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </WrapperContainer>
  );
};

export default ComboOrders;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateVerticalScale(8),
    paddingBottom: moderateVerticalScale(6),
  },
  backButton: {
    marginRight: moderateScale(10),
    padding: moderateScale(4),
  },
  headerTitle: {
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(22),
    color: Colors.brandColor,
  },
  subtitle: {
    fontFamily: FontFamily.Montserrat_Regular,
    fontSize: textScale(14),
    color: Colors.text_grey,
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateVerticalScale(12),
    lineHeight: textScale(20),
  },
  listContent: {
    paddingBottom: moderateVerticalScale(24),
  },
  card: {
    flexDirection: 'row',
    marginHorizontal: moderateScale(16),
    marginBottom: moderateVerticalScale(12),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.border_grey,
    overflow: 'hidden',
  },
  cardImageWrapper: {
    width: 116,
    minHeight: 148,
    backgroundColor: Colors.backGround_grey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateVerticalScale(10),
  },
  cardTitle: {
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(15),
    color: Colors.brandColor,
    marginBottom: moderateVerticalScale(4),
  },
  cardDesc: {
    fontFamily: FontFamily.Montserrat_Regular,
    fontSize: textScale(12),
    color: Colors.text_grey,
    marginBottom: moderateVerticalScale(6),
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(8),
  },
  cardPrice: {
    fontFamily: FontFamily.Montserrat_Bold,
    fontSize: textScale(17),
    color: Colors.green,
  },
  cardCountBadge: {
    backgroundColor: Colors.yellow_background,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateVerticalScale(3),
  },
  cardCountText: {
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(11),
    color: Colors.yellow,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brandColor,
    borderRadius: moderateScale(8),
    paddingVertical: moderateVerticalScale(9),
  },
  addButtonText: {
    fontFamily: FontFamily.Montserrat_SemiBold,
    fontSize: textScale(13),
    color: Colors.white,
    marginLeft: moderateScale(6),
  },
  emptyState: {
    flex: 1,
  },
  emptyInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(32),
  },
  emptyText: {
    fontFamily: FontFamily.Montserrat_Regular,
    fontSize: textScale(14),
    color: Colors.text_grey,
    textAlign: 'center',
    marginTop: moderateVerticalScale(12),
  },
});