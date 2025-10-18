import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors, spacing, typography } from '../../theme/designSystem';
import api from '../../utils/api';

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);

  const load = async () => {
    const res = await api.get('/transactions');
    setTransactions(res.data.transactions);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ fontWeight: '700' }}>{item.type === 'recharge' ? '💳 Recharge' : '🎫 Ticket Purchase'}</Text>
            <Text style={{ color: item.amount >= 0 ? colors.success : colors.error }}>
              {item.amount >= 0 ? '+' : ''}R {Number(item.amount).toFixed(2)}
            </Text>
            <Text style={{ color: colors.textSecondary }}>{new Date(item.createdAt).toLocaleString()}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  header: { fontSize: typography.h3, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: 8, marginBottom: spacing.md },
});
