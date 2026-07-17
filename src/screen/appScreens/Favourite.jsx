import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { ArrowLeftIcon } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";
import { HeartIcon } from "react-native-heroicons/solid";
import Colors from "../../components/Colors";
import {
  responsiveFontSize,
  responsivePadding,
} from "../../components/Responsive";
import { SafeAreaView } from "react-native-safe-area-context";

const Favorite = ({ showWishlist, setShowWishlist }) => {
  const staticImageURL = "https://picsum.photos/300";
  const navigation = useNavigation();

  return (
    <View style={styles.main}>
      <SafeAreaView style={{backgroundColor:Colors.white}}/>
      <StatusBar backgroundColor={Colors.white} barStyle={"dark-content"}/>
      <View style={{ backgroundColor: "white" }}>
        <View style={styles.headerView}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftIcon
              size={responsivePadding(20)}
              color={Colors.forgetPassword}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Wishlist</Text>
          <Text></Text>
        </View>
      </View>

      {/* content */}

      <View style={styles.card}>
        <View style={styles.cartImageHolder}>
          <Image source={{ uri: staticImageURL }} style={styles.cartImage} />
        </View>
        <View style={{ width: 150, marginTop: 10 }}>
          <Text
            style={[
              styles.orderTitle,
              { color: Colors.forgetPassword, fontWeight: "600" },
            ]}
          >
            3 Ply Corrugated Box{" "}
          </Text>
          <Text style={styles.orderTitle}>8X8 inches(10 pcs)</Text>
        </View>
        <View>
          <View style={{ marginLeft: 20 }}>
            <HeartIcon size={responsivePadding(20)} color={"red"} />
          </View>
          <Text
            style={{
              color: "black",
              marginRight: 20,
              fontWeight: "600",
              fontSize: responsiveFontSize(16),
            }}
          >
            ₹ {2000}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cartImageHolder}>
          <Image source={{ uri: staticImageURL }} style={styles.cartImage} />
        </View>
        <View style={{ width: 150, marginTop: 10 }}>
          <Text
            style={[
              styles.orderTitle,
              { color: Colors.forgetPassword, fontWeight: "600" },
            ]}
          >
            3 Ply Corrugated Box{" "}
          </Text>
          <Text style={styles.orderTitle}>8X8 inches(10 pcs)</Text>
        </View>
        <View>
          <View style={{ marginLeft: 20 }}>
            <HeartIcon size={responsivePadding(20)} color={"red"} />
          </View>
          <Text
            style={{
              color: "black",
              marginRight: 20,
              fontWeight: "600",
              fontSize: responsiveFontSize(16),
            }}
          >
            ₹ {2000}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cartImageHolder}>
          <Image source={{ uri: staticImageURL }} style={styles.cartImage} />
        </View>
        <View style={{ width: 150, marginTop: 10 }}>
          <Text
            style={[
              styles.orderTitle,
              { color: Colors.forgetPassword, fontWeight: "600" },
            ]}
          >
            3 Ply Corrugated Box{" "}
          </Text>
          <Text style={styles.orderTitle}>8X8 inches(10 pcs)</Text>
        </View>
        <View>
          <View style={{ marginLeft: 20 }}>
            <HeartIcon size={responsivePadding(20)} color={"red"} />
          </View>
          <Text
            style={{
              color: "black",
              marginRight: 20,
              fontWeight: "600",
              fontSize: responsiveFontSize(16),
            }}
          >
            ₹ {2000}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Favorite;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.back,
  },
  headerView: {
    marginHorizontal: responsivePadding(10),
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: Colors.black,
    fontSize: responsiveFontSize(18),
    fontWeight: "400",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: responsivePadding(10),
    marginTop: 10,
    elevation: 5,
    borderRadius: 10,
  },
  cartImage: {
    width: responsivePadding(30),
    height: responsivePadding(30),
  },
  cartImageHolder: {
    padding: 20,
  },
  orderTitle: {
    color: "black",
    textTransform: "uppercase",
    fontSize: responsiveFontSize(13),
  },
});
