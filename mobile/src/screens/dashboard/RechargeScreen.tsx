import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors, spacing, typography } from '../../theme/designSystem';
import api from '../../utils/api';

export default function RechargeScreen() {
  const [amount, setAmount] = useState('100');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      const value = parseFloat(amount);
      const res = await api.post('/users/recharge', { amount: value, paymentMethod: 'card', paymentToken: 'tok_dev' });
      setMessage(`Recharge successful. New balance: R ${res.data.newBalance.toFixed(2)}`);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Recharge failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recharge Balance</Text>
      <Input label="Amount (ZAR)" value={amount} onChangeText={setAmount} />
      {!!message && <Text style={styles.success}>{message}</Text>}
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button onPress={submit} loading={loading}>ADD FUNDS</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  title: { fontSize: typography.h3, marginBottom: spacing.lg },
  success: { color: colors.success, marginBottom: spacing.md },
  error: { color: colors.error, marginBottom: spacing.md },
});
