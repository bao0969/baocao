import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This screen is hidden from navigation (href: null in _layout.tsx)
// Kept as placeholder to satisfy the router file requirement
export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Explore</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#170f23', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 16 },
});
