import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors, spacing, typography } from '../../theme/designSystem';
import api from '../../utils/api';
import QRCode from 'react-native-qrcode-svg';

export default function TicketsScreen() {
  const [tickets, setTickets] = useState<any[]>([]);

  const load = async () => {
    const res = await api.get('/tickets');
    setTickets(res.data.tickets);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Tickets</Text>
      <FlatList
        data={tickets}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.bus}>Bus #{item.busNumber}</Text>
            <Text style={styles.route}>{item.fromLocation} → {item.toLocation}</Text>
            <Text>R {Number(item.price).toFixed(2)}</Text>
            <View style={{ marginTop: spacing.md }}>
              <QRCode value={item.id} size={120} />
            </View>
            <Text>Status: {item.status}</Text>
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
  bus: { fontWeight: '700' },
  route: { color: colors.textSecondary, marginBottom: spacing.sm },
});
