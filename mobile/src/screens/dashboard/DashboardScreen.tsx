import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme/designSystem';
import Button from '../../components/Button';
import TapToPayModal from '../../components/TapToPayModal';
import api from '../../utils/api';

export default function DashboardScreen({ navigation }: any) {
  const [balance, setBalance] = useState<number>(0);
  const [tapVisible, setTapVisible] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<'inactive' | 'active'>('inactive');

  const fetchBalance = async () => {
    const res = await api.get('/users/balance');
    setBalance(res.data.balance);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchBalance);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.balance}>Balance: R {balance.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BusCard')}>
        <Text style={styles.cardTitle}>TSHWANE BUS SERVICE</Text>
        <Text style={styles.cardSubtitle}>e-Bus Card</Text>
        <Text style={styles.cardNumber}>**** **** **** 1234</Text>
        <View style={{ alignItems: 'flex-end', gap: 12 }}>
          <Button size="medium" onPress={async () => {
            try {
              const res = await api.post('/cards/activate', { duration: 30 });
              // Store session data securely for NFC
              const { session, card } = res.data;
              const SecureStore = (await import('expo-secure-store')).default;
              await SecureStore.setItemAsync('nfcSession', JSON.stringify(session));
              await SecureStore.setItemAsync('virtualCard', JSON.stringify({ id: card.id }));
              setNfcStatus('active');
              setTapVisible(true);
            } catch (e) {}
          }}>ACTIVATE CARD</Button>
        </View>
      </TouchableOpacity>

      <Text style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>Recharge Balance</Text>
      <Button onPress={() => navigation.navigate('Recharge')}>ADD FUNDS</Button>

      <Text style={{ marginTop: spacing.lg }}>Recent Transactions</Text>
      <Button variant="outline" onPress={() => navigation.navigate('Tickets')}>View Tickets</Button>

      <Text style={{ marginTop: spacing.md }}>NFC Status: {nfcStatus === 'active' ? '✅ Ready' : '❌ Inactive'}</Text>

      <TapToPayModal visible={tapVisible} onClose={() => setTapVisible(false)} onSuccess={() => fetchBalance()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balance: { fontSize: typography.h4, fontWeight: '700' },
  card: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 12, padding: spacing.lg },
  cardTitle: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
  cardSubtitle: { color: '#fff', marginTop: spacing.sm },
  cardNumber: { color: '#fff', marginTop: spacing.xl, fontSize: typography.h3, letterSpacing: 2 },
});
