import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/designSystem';
import api from '../../utils/api';

export default function SearchScreen({ navigation }: any) {
  const [from, setFrom] = useState('Hatfield');
  const [to, setTo] = useState('Centurion');
  const [recent, setRecent] = useState<string[]>(['Hatfield → Centurion', 'Menlyn → CBD']);
  const [favorites, setFavorites] = useState<string[]>(['Home → Work', 'School → Home']);
  const [error, setError] = useState<string | undefined>();

  const onSearch = async () => {
    if (!from.trim() || !to.trim()) {
      setError('Both fields required');
      return;
    }
    setError(undefined);
    navigation.navigate('Results', { from, to });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Where do you want to go?</Text>
      <Input label="From" value={from} onChangeText={setFrom} />
      <Input label="To" value={to} onChangeText={setTo} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button onPress={onSearch}>SEARCH ROUTES</Button>

      <Text style={styles.sectionTitle}>Recent Searches</Text>
      <FlatList
        data={recent}
        keyExtractor={(i) => i}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItem}><Text>{item}</Text></TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>Favorites ⭐</Text>
      <FlatList
        data={favorites}
        keyExtractor={(i) => i}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItem}><Text>{item}</Text></TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  header: { fontSize: typography.h3, fontWeight: '600', marginBottom: spacing.md },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.textSecondary },
  listItem: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  error: { color: colors.error, marginBottom: spacing.md },
});
