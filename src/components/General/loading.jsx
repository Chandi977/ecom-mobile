import { View, StyleSheet, ActivityIndicator } from "react-native";
import React from "react";

export default function Loading({ size, color }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:'transparent'
  },
});
