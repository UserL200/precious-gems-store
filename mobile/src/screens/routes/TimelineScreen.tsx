import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/designSystem';
import api from '../../utils/api';

export default function TimelineScreen({ route, navigation }: any) {
  const { routeId } = route.params;
  const [routeData, setRouteData] = useState<any | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/routes/${routeId}`);
        setRouteData(res.data.route);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load route');
      } finally {
        setLoading(false);
      }
    })();
  }, [routeId]);

  const buyTicket = async () => {
    try {
      const res = await api.post('/tickets/purchase', { routeId: routeId, price: routeData.price });
      navigation.navigate('Dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Purchase failed');
    }
  };

  if (!routeData) return (
    <View style={styles.container}><Text>Loading...</Text></View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Tracking: Bus #{routeData.busNumber}</Text>
      <FlatList
        data={routeData.stops}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.stopRow}>
            <Text style={{ width: 60 }}>{item.time}</Text>
            <View style={styles.timeline}>
              <View style={[styles.dot, (index === 0 || index === routeData.stops.length - 1) && styles.dotFilled]} />
              {index < routeData.stops.length - 1 && <View style={styles.line} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stopName}>{item.name}</Text>
              {item.platform && <Text style={styles.platform}>{item.platform}</Text>}
            </View>
          </View>
        )}
      />
      <Text style={styles.total}>Total: R {Number(routeData.price).toFixed(2)}</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button variant="outline" onPress={() => navigation.goBack()}>Back</Button>
        <Button onPress={buyTicket}>Buy Ticket</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  header: { fontSize: typography.h4, marginBottom: spacing.md },
  stopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  timeline: { width: 20, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.textSecondary },
  dotFilled: { backgroundColor: colors.textSecondary },
  line: { width: 2, height: 24, backgroundColor: colors.border, marginTop: 2, marginBottom: 2 },
  stopName: { fontWeight: '600' },
  platform: { color: colors.textSecondary },
  total: { fontWeight: '700', marginVertical: spacing.md },
  error: { color: colors.error, marginBottom: spacing.md },
});
