import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/designSystem';
import { useAppDispatch, useAppSelector } from '../../store';
import { login } from '../../store/slices/authSlice';

export default function LoginScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('john@tshwane.com');
  const [password, setPassword] = useState('test1234');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const onSubmit = () => {
    let valid = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setEmailError('Invalid email');
      valid = false;
    } else setEmailError(undefined);
    if (password.length < 4) {
      setPasswordError('Min 4 characters');
      valid = false;
    } else setPasswordError(undefined);
    if (!valid) return;
    dispatch(login({ email, password }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TSHWANE BUS</Text>
      <Input label="Email" placeholder="Enter email" value={email} onChangeText={setEmail} error={emailError} keyboardType="email-address" />
      <Input label="Password" placeholder="Enter password" value={password} onChangeText={setPassword} error={passwordError} secureTextEntry />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button onPress={onSubmit} loading={loading}>LOGIN</Button>
      <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>Don't have an account? Sign Up</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background, justifyContent: 'center' },
  title: { fontSize: typography.h2, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xl, color: colors.primary },
  link: { textAlign: 'center', marginTop: spacing.md, color: colors.primary },
  error: { color: colors.error, marginBottom: spacing.md },
});
