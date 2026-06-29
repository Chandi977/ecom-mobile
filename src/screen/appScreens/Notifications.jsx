import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import Colors from '../../utils/Colors';
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
} from '../../utils/responsiveSize';
import FontFamily from '../../utils/FontFamily';
import WrapperContainer from '../../utils/WrapperContainer';
import InnerHeader from '../../components/Header/InnerHeader';
import ApiService from '../../service/APIService';
import StorageService from '../../utils/storageService';

const Notifications = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const loadFeed = useCallback(async () => {
    try {
      const token = await StorageService.getItem('authToken');
      if (!token) {
        setIsLoggedIn(false);
        setItems([]);
        return;
      }
      setIsLoggedIn(true);
      const res = await ApiService.GET_NOTIFICATIONS({ limit: 50 });
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      console.log('Failed to load notifications:', e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) loadFeed();
  }, [isFocused, loadFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handlePress = async (item) => {
    try {
      if (!item.isRead) {
        await ApiService.MARK_NOTIFICATION_READ(item._id);
        setItems((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (e) {
      console.log('mark read failed', e?.message);
    }
    // Deep-link based on the payload attached to the notification.
    const data = item.data || {};
    if (data.type === 'order') {
      navigation.navigate('My Order');
    } else if (data.type === 'product' && data.productId) {
      // ProductDetails needs the full product object, so fetch it first.
      try {
        const res = await ApiService.GET_SINGLE_PRODUCT(data.productId);
        if (res?.data) navigation.navigate('ProductDetails', { item: res.data });
      } catch (e) {
        console.log('product deep-link failed', e?.message);
      }
    }
  };

  const markAllRead = async () => {
    try {
      await ApiService.MARK_ALL_NOTIFICATIONS_READ();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.log('mark all read failed', e?.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, !item.isRead && styles.cardUnread]}
      onPress={() => handlePress(item)}
    >
      <View style={styles.iconBubble}>
        <Feather name="bell" size={moderateScale(18)} color={Colors.brandColor} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        {!!item.body && (
          <Text style={styles.cardMessage} numberOfLines={3}>
            {item.body}
          </Text>
        )}
        <Text style={styles.cardTime}>{moment(item.createdAt).fromNow()}</Text>
      </View>
    </TouchableOpacity>
  );

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <WrapperContainer backgroundColor={Colors.white} isLoading={loading}>
      <InnerHeader
        title="Notifications"
        rightComponent={
          hasUnread ? (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={styles.markAll}>Mark all</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {!isLoggedIn ? (
        <View style={styles.empty}>
          <Feather name="bell-off" size={moderateScale(48)} color={Colors.text_grey} />
          <Text style={styles.emptyText}>Please log in to see your notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderItem}
          contentContainerStyle={
            items.length === 0
              ? styles.emptyListContainer
              : { paddingBottom: moderateVerticalScale(20) }
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Feather name="bell-off" size={moderateScale(48)} color={Colors.text_grey} />
                <Text style={styles.emptyText}>No notifications yet.</Text>
              </View>
            ) : null
          }
        />
      )}
    </WrapperContainer>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: moderateScale(12),
    marginTop: moderateVerticalScale(10),
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  cardUnread: {
    backgroundColor: '#F7FAFF',
    borderColor: '#D6E4FF',
  },
  iconBubble: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: '#EEF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  cardBody: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    fontSize: textScale(14),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  unreadDot: {
    width: moderateScale(9),
    height: moderateScale(9),
    borderRadius: moderateScale(5),
    backgroundColor: Colors.red,
    marginLeft: moderateScale(8),
  },
  cardMessage: {
    fontSize: textScale(12.5),
    color: '#506078',
    marginTop: moderateVerticalScale(4),
    fontFamily: FontFamily.Montserrat_Regular,
    lineHeight: textScale(18),
  },
  cardTime: {
    fontSize: textScale(11),
    color: Colors.text_grey,
    marginTop: moderateVerticalScale(6),
    fontFamily: FontFamily.Montserrat_Regular,
  },
  markAll: {
    color: Colors.red,
    fontSize: textScale(12.5),
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(80),
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyText: {
    marginTop: moderateVerticalScale(12),
    fontSize: textScale(13),
    color: Colors.text_grey,
    fontFamily: FontFamily.Montserrat_Regular,
  },
});
