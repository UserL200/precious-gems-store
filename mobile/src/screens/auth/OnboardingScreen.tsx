import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography } from '../../theme/designSystem';
import Button from '../../components/Button';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const slides = [
    { title: 'Find Your Bus', subtitle: 'Search routes quickly' },
    { title: 'Buy Tickets Instantly', subtitle: 'Secure digital payments' },
    { title: 'Track in Real-Time', subtitle: 'Live bus tracking' },
  ];

  const next = () => {
    if (index < slides.length - 1) setIndex(index + 1);
    else navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{slides[index].title}</Text>
      <Text style={styles.subtitle}>{slides[index].subtitle}</Text>
      <View style={styles.footer}>
        <Text style={styles.skip} onPress={() => navigation.replace('Login')}>Skip</Text>
        <Button onPress={next}>{index === slides.length - 1 ? 'Done' : 'Next'}</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  title: { fontSize: typography.h1, fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  subtitle: { fontSize: typography.h3, color: colors.textSecondary },
  footer: { position: 'absolute', bottom: spacing.xl, width: width - spacing.xl * 2 },
  skip: { textAlign: 'right', marginBottom: spacing.md, color: colors.textSecondary },
});
