import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/designSystem';
import { useAppDispatch, useAppSelector } from '../../store';
import { register } from '../../store/slices/authSlice';

export default function SignupScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errs, setErrs] = useState<{ [k: string]: string | undefined }>({});

  const onSubmit = async () => {
    const e: any = {};
    if (name.trim().length < 2) e.name = 'Min 2 characters';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Invalid email';
    if (!/^\+?27[0-9]{9}$/.test(phone)) e.phone = 'Phone must be +27XXXXXXXXX';
    if (password.length < 6) e.password = 'Min 6 characters';
    if (confirm !== password) e.confirm = 'Passwords do not match';
    setErrs(e);
    if (Object.keys(e).length > 0) return;
    const res = await dispatch(register({ name, email, password, phone }));
    if ((res as any).meta.requestStatus === 'fulfilled') {
      // Show success then go back to Login
      setTimeout(() => navigation.navigate('Login'), 1500);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Input label="Full Name" value={name} onChangeText={setName} error={errs.name} />
      <Input label="Email Address" value={email} onChangeText={setEmail} error={errs.email} keyboardType="email-address" />
      <Input label="Phone Number" value={phone} onChangeText={setPhone} error={errs.phone} />
      <Input label="Password" value={password} onChangeText={setPassword} error={errs.password} secureTextEntry />
      <Input label="Confirm Password" value={confirm} onChangeText={setConfirm} error={errs.confirm} secureTextEntry />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button onPress={onSubmit} loading={loading}>SIGN UP</Button>
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Already have an account? Login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  title: { fontSize: typography.h2, fontWeight: '700', textAlign: 'center', marginVertical: spacing.lg, color: colors.primary },
  link: { textAlign: 'center', marginTop: spacing.md, color: colors.primary },
  error: { color: colors.error, marginBottom: spacing.md },
});
