import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Animated, Platform } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import * as SecureStore from 'expo-secure-store';
import Button from './Button';
import api from '../utils/api';
import { colors, spacing, typography } from '../theme/designSystem';

export default function TapToPayModal({ visible, onClose, onSuccess }: { visible: boolean; onClose: () => void; onSuccess: (r: any) => void }) {
  const [status, setStatus] = useState<'ready' | 'processing' | 'success' | 'error'>('ready');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      startPulseAnimation();
      initializeNFC();
    }
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, [visible]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  };

  const initializeNFC = async () => {
    try {
      await NfcManager.start();
      if (Platform.OS === 'android') {
        await NfcManager.requestTechnology(NfcTech.IsoDep);
      } else {
        await NfcManager.requestTechnology(NfcTech.Ndef);
      }

      setStatus('processing');

      const sessionJson = await SecureStore.getItemAsync('nfcSession');
      const cardJson = await SecureStore.getItemAsync('virtualCard');
      if (!sessionJson || !cardJson) throw new Error('Card not activated');
      const session = JSON.parse(sessionJson);
      const card = JSON.parse(cardJson);

      const payload = buildSignedPayload(card.id, 12.0, session.sessionId, session.encryptionKey); // demo amount
      // In real HCE, this would be transceived to the reader; for demo we call backend directly
      const res = await api.post(
        '/transactions/tap-pay',
        payload.body,
        { headers: { 'X-NFC-Signature': payload.signature } }
      );

      setStatus('success');
      onSuccess(res.data);
      setTimeout(onClose, 1500);
    } catch (e) {
      setStatus('error');
    } finally {
      try { await NfcManager.cancelTechnologyRequest(); } catch {}
    }
  };

  const buildSignedPayload = (cardId: string, amount: number, sessionId: string, key: string) => {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).slice(2);
    const body = { cardId, amount, timestamp, nonce, readerId: 'reader_dev', busNumber: '201' };
    const data = JSON.stringify(body);
    // simple HMAC in JS; in production use native crypto
    // @ts-ignore
    const signature = require('crypto-js').HmacSHA256(data, key).toString();
    return { body, signature };
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {status === 'ready' && (
            <>
              <Animated.View style={[styles.nfcIcon, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.icon}>📱</Text>
              </Animated.View>
              <Text style={styles.title}>Ready to Tap</Text>
              <Text style={styles.subtitle}>Hold your phone near the reader</Text>
            </>
          )}
          {status === 'processing' && (
            <>
              <View style={styles.spinner} />
              <Text style={styles.title}>Processing...</Text>
              <Text style={styles.subtitle}>Communicating with reader</Text>
            </>
          )}
          {status === 'success' && (
            <>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.title}>Payment Successful!</Text>
              <Text style={styles.subtitle}>Fare deducted</Text>
            </>
          )}
          {status === 'error' && (
            <>
              <Text style={styles.errorIcon}>❌</Text>
              <Text style={styles.title}>Payment Failed</Text>
              <Text style={styles.subtitle}>Please try again</Text>
              <Button onPress={initializeNFC}>Retry</Button>
              <Button variant="outline" onPress={onClose}>Close</Button>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '85%', alignItems: 'center' },
  nfcIcon: { marginBottom: spacing.md },
  icon: { fontSize: 72 },
  title: { fontSize: typography.h3, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  subtitle: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  successIcon: { fontSize: 72, marginBottom: spacing.md },
  errorIcon: { fontSize: 72, marginBottom: spacing.md },
  spinner: { width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: colors.primary, borderTopColor: 'transparent' },
});
