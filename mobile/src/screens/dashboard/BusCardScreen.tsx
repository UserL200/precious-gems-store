import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/designSystem';

export default function BusCardScreen() {
  return (
    <View style={styles.container}>
      <Text>QR/NFC coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
});
