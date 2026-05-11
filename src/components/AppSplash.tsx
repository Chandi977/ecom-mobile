import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function AppSplash() {
  return (
    <View style={styles.screen}>
      <View style={styles.logoWrap}>
        <Image
          source={require('../../assets/prem-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>Prem Industries</Text>
      <Text style={styles.subtitle}>Packaging store</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  logoWrap: {
    width: 168,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  logo: { width: 168, height: 112 },
  title: {
    color: '#182C5A',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#E92227',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 6,
    textTransform: 'uppercase',
  },
});
