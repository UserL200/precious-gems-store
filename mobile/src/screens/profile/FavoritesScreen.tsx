import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme/designSystem';
import api from '../../utils/api';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);

  const load = async () => {
    const res = await api.get('/favorites');
    setFavorites(res.data.favorites);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favorites</Text>
      <FlatList
        data={favorites}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={{ fontWeight: '700' }}>{item.nickname || `${item.fromLocation} → ${item.toLocation}`}</Text>
            <Text style={{ color: colors.textSecondary }}>{item.fromLocation} → {item.toLocation}</Text>
          </TouchableOpacity>
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
