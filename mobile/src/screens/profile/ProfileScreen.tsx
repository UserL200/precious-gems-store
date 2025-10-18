import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/designSystem';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Button variant="outline" onPress={() => navigation.navigate('TransactionHistory')}>Transaction History</Button>
      <Button variant="outline" onPress={() => navigation.navigate('Favorites')}>Favorites</Button>
      <Button variant="outline" onPress={() => navigation.navigate('Settings')}>Settings</Button>
      <Button onPress={() => dispatch(logout())}>LOGOUT</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  name: { fontSize: typography.h3, fontWeight: '700' },
  email: { color: colors.textSecondary, marginBottom: spacing.lg },
});
