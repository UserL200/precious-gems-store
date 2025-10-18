import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../theme/designSystem';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  leftIcon,
  rightIcon,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const showToggle = secureTextEntry;
  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, { borderColor }] }>
        {leftIcon}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {showToggle && (
          <TouchableOpacity onPress={() => setHidden((h) => !h)}>
            <Text style={{ color: colors.primary }}>{hidden ? 'Show' : 'Hide'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { marginBottom: spacing.xs, color: colors.textSecondary, fontSize: typography.caption },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  error: { marginTop: spacing.xs, color: colors.error },
});
