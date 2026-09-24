import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import Colors from "../../utils/Colors";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ApiService from "../../service/APIService";
import LoginPopup from "../General/loginPopup";
import {
  moderateScale,
  moderateVerticalScale,
  textScale,
  width,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";
import { showMessage } from "react-native-flash-message";
import StorageService from "../../utils/storageService";
import { parseStoredUser, showSuccessMessage } from "../../utils/HelperFunction";
import CartService from "../../service/CartService";
import ProductImage from "../product/ProductImage";
import {
  formatCardPrice,
  getPrimaryPriceTier,
  getProductCardBadge,
  getProductCardSummary,
  getProductDisplayName,
  isInStock,
} from "../../utils/productCatalog";

const getLineProductId = line => {
  const lineProduct = line?.product;
  if (typeof lineProduct === "string") return lineProduct;
  return lineProduct?._id || line?.productId || line?.product_id || "";
};

export default function PopularProducts({
  data,
  brandNameById = {},
  onEndReached,
  loadingMore = false,
  ListHeaderComponent,
}) {
  const navigation = useNavigation();
  const [wishlist, setWishlist] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [localWishlistUpdates, setLocalWishlistUpdates] = useState({});
  const [cartProductIds, setCartProductIds] = useState(new Set());

  const fetchWishlist = async () => {
    try {
      const user = await StorageService.getItem("user_data");
      if (user) {
        const userData = parseStoredUser(user);
        const response = await ApiService.GET_WISHLIST_PRODUCTS(userData?._id);
        if (response?.success) {
          setWishlist(response?.data?.products || []);
          setLocalWishlistUpdates({});
        }
      }
    } catch (error) {
      if (__DEV__) console.log("Error fetching wishlist", error);
    }
  };

  const fetchCartProducts = useCallback(async () => {
    try {
      const cart = await CartService.getCart();
      setCartProductIds(
        new Set((cart || []).map(getLineProductId).filter(Boolean)),
      );
    } catch (error) {
      if (__DEV__) console.log("Error fetching cart products", error?.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
      fetchCartProducts();
    }, [fetchCartProducts])
  );

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((item) => item.product?._id).filter(Boolean)),
    [wishlist],
  );

  const isItemInWishlist = (productId) => {
    if (localWishlistUpdates[productId] !== undefined) {
      return localWishlistUpdates[productId];
    }
    return wishlistIds.has(productId);
  };

  const handleAddToCart = async (product) => {
    const tier = getPrimaryPriceTier(product);
    try {
      const result = await CartService.addToCart(product, {
        packSize: tier.number,
        price: tier.SP,
        quantity: 1,
      });
      if (result?.success) {
        setCartProductIds(prev => new Set([...prev, product?._id].filter(Boolean)));
        showMessage({
          message: "Product Added to cart successfully",
          type: "success",
          icon: "success",
        });
        DeviceEventEmitter.emit("cartUpdated");
      } else {
        showMessage({
          message: "Unable to add product to cart. Please try again.",
          type: "danger",
          icon: "danger",
        });
      }
    } catch (e) {
      if (__DEV__) console.log("Error adding to cart:", e);
      showMessage({
        message: "Unable to add product to cart. Please try again.",
        type: "danger",
        icon: "danger",
      });
    }
  };

  const handleSaveToWishList = async (product) => {
    const tier = getPrimaryPriceTier(product);
    const user = await StorageService.getItem("user_data");
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    try {
      const userData = parseStoredUser(user);
      const currentStatus = isItemInWishlist(product._id);

      setLocalWishlistUpdates((prev) => ({
        ...prev,
        [product._id]: !currentStatus,
      }));

      if (currentStatus) {
        const response = await ApiService.REMOVE_FROM_WISHLIST({
          product: product._id,
          user: userData._id,
        });

        if (!response?.success) {
          setLocalWishlistUpdates((prev) => ({
            ...prev,
            [product._id]: currentStatus,
          }));
          throw new Error("Failed to remove from wishlist");
        }
        showSuccessMessage("Product removed from wishlist");
      } else {
        const wishlistData = {
          product: {
            product: product?._id,
            packSize: tier.number,
            price: tier.SP,
            quantity: 1,
            stock: 1000,
            totalWeight: tier.number,
            totalPackWeight: 0,
          },
          user: userData?._id,
        };

        const response = await ApiService.ADD_TO_WISHLIST(wishlistData);
        if (!response?.success) {
          setLocalWishlistUpdates((prev) => ({
            ...prev,
            [product._id]: currentStatus,
          }));
          throw new Error("Failed to add to wishlist");
        }
        showSuccessMessage("Product added to wishlist");
      }

      await fetchWishlist();
    } catch (error) {
      if (__DEV__) console.log("Error updating wishlist", error);
      showMessage({
        message: error.message || "Error updating wishlist",
        type: "danger",
        icon: "danger",
      });
    }
  };

  const renderCard = ({ item }) => {
    const tier = getPrimaryPriceTier(item);
    const badge = getProductCardBadge(item);
    const showMrp = tier.MRP > tier.SP;
    const title = getProductDisplayName(item, { brandNameById });
    const summary = getProductCardSummary(item);
    const inStock = isInStock(item);
    const inCart = cartProductIds.has(item?._id);

    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.9}
        onPress={() => navigation.push("ProductDetails", { item })}
      >
        {!!badge && (
          <View
            style={[
              styles.badge,
              badge === "SALE" ? styles.badgeSale : styles.badgePopular,
            ]}
          >
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.heartIconHolder}
          onPress={() => handleSaveToWishList(item)}
        >
          <AntDesign
            name={isItemInWishlist(item._id) ? "heart" : "hearto"}
            size={moderateScale(20)}
            color={isItemInWishlist(item._id) ? Colors.red : Colors.text_grey}
          />
        </TouchableOpacity>

        <View style={styles.imageHolder}>
          <ProductImage product={item} style={styles.image} />
        </View>

        <View style={styles.textHolder}>
          <Text numberOfLines={2} style={styles.title}>
            {title || item?.name}
          </Text>
          {!!summary && (
            <Text numberOfLines={1} style={styles.summary}>
              {summary}
            </Text>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{formatCardPrice(tier.SP)}</Text>
            {showMrp && (
              <Text style={styles.mrpText}>{formatCardPrice(tier.MRP)}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            !inStock
              ? navigation.push("ProductDetails", { item })
              : inCart
              ? navigation.navigate("Cart")
              : handleAddToCart(item)
          }
          style={[styles.button, !inStock && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {!inStock ? "VIEW PRODUCT" : inCart ? "GO TO CART" : "ADD TO CART"}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item?._id || String(index)}
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.brandColor} />
            </View>
          ) : null
        }
      />
      {showLoginPopup && (
        <LoginPopup
          showLoginPopup={showLoginPopup}
          setShowLoginPopup={setShowLoginPopup}
        />
      )}
    </View>
  );
}

const CARD_WIDTH = (width - moderateScale(36)) / 2;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: moderateScale(12),
    paddingBottom: moderateVerticalScale(80),
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: moderateVerticalScale(12),
  },
  item: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: Colors.border_grey,
    overflow: "hidden",
  },
  imageHolder: {
    width: "100%",
    height: moderateScale(140),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingTop: moderateScale(24),
    paddingHorizontal: moderateScale(12),
    paddingBottom: moderateScale(8),
  },
  image: {
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  textHolder: {
    width: "100%",
    paddingHorizontal: moderateScale(12),
    paddingTop: moderateScale(4),
    gap: moderateVerticalScale(3),
  },
  title: {
    fontSize: textScale(12.5),
    color: Colors.brandColor,
    textAlign: "left",
    textTransform: "capitalize",
    fontFamily: FontFamily.Montserrat_Bold,
    lineHeight: textScale(17),
    minHeight: textScale(34),
  },
  summary: {
    fontSize: textScale(10.5),
    color: Colors.text_grey,
    textAlign: "left",
    fontFamily: FontFamily.Montserrat_Medium,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: moderateScale(6),
    marginTop: moderateVerticalScale(2),
  },
  priceText: {
    fontSize: textScale(17),
    color: Colors.brandColor,
    fontFamily: FontFamily.Montserrat_ExtraBold,
  },
  mrpText: {
    fontSize: textScale(11),
    color: Colors.text_grey,
    textDecorationLine: "line-through",
    fontFamily: FontFamily.Montserrat_SemiBold,
  },
  badge: {
    position: "absolute",
    top: moderateScale(8),
    left: moderateScale(8),
    zIndex: 2,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(3),
  },
  badgeSale: {
    backgroundColor: Colors.red,
  },
  badgePopular: {
    backgroundColor: Colors.brandColor,
  },
  badgeText: {
    color: Colors.white,
    fontSize: textScale(9),
    fontFamily: FontFamily.Montserrat_ExtraBold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heartIconHolder: {
    position: "absolute",
    top: moderateScale(6),
    right: moderateScale(6),
    zIndex: 2,
    padding: moderateScale(5),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.white,
  },
  button: {
    width: "100%",
    marginTop: moderateVerticalScale(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brandColor,
    paddingVertical: moderateScale(10),
  },
  buttonDisabled: {
    backgroundColor: Colors.outOfStock,
  },
  buttonText: {
    fontSize: textScale(11),
    textAlign: "center",
    fontFamily: FontFamily.Montserrat_ExtraBold,
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  footerLoader: {
    paddingVertical: moderateVerticalScale(16),
    alignItems: "center",
    justifyContent: "center",
  },
});
