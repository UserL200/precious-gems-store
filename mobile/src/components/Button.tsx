import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/designSystem';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
}: ButtonProps) {
  const styleSet = styles(variant, size, disabled);
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled || loading} style={styleSet.container}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} />
      ) : (
        <View style={styleSet.content}>
          {leftIcon}
          <Text style={styleSet.label}>{children}</Text>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = (variant: ButtonProps['variant'], size: ButtonProps['size'], disabled: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor:
        variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.gold : 'transparent',
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: variant === 'outline' ? colors.primary : 'transparent',
      opacity: disabled ? 0.6 : 1,
      borderRadius: 8,
      paddingVertical: size === 'small' ? spacing.sm : size === 'medium' ? spacing.md : spacing.lg,
      paddingHorizontal: spacing.xl,
    },
    content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
    label: {
      color: variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff',
      fontSize: size === 'small' ? typography.caption : size === 'medium' ? typography.body : typography.h4,
      fontWeight: '600',
    },
  });
