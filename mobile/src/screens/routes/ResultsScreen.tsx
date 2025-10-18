import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme/designSystem';
import api from '../../utils/api';

export default function ResultsScreen({ route, navigation }: any) {
  const { from, to } = route.params;
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/routes/search', { params: { from, to } });
        setRoutes(res.data.routes);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load routes');
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{from} → {to}</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => {}}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Timeline', { routeId: item.id })}>
            <View style={styles.cardLeft} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bus}>Bus #{item.busNumber}</Text>
              <Text style={styles.time}>{item.departure} → {item.arrival}</Text>
              <Text style={styles.meta}>{item.duration} min • {item.transfers || 0} transfer</Text>
            </View>
            <Text style={styles.price}>R {Number(item.price).toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  header: { fontSize: typography.h3, fontWeight: '600', marginBottom: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: 8, marginBottom: spacing.md, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  cardLeft: { width: 6, height: '100%', backgroundColor: colors.primary, borderRadius: 4, marginRight: spacing.md },
  bus: { fontWeight: '700' },
  time: { color: colors.textSecondary, marginTop: 2 },
  meta: { color: colors.textSecondary, marginTop: 2 },
  price: { fontWeight: '700' },
  error: { color: colors.error, marginBottom: spacing.md },
});
