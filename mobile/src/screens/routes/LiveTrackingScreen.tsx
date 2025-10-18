import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Easing, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, spacing } from '../../theme/designSystem';
import { useRoute } from '@react-navigation/native';

export default function LiveTrackingScreen() {
  const [region, setRegion] = useState({
    latitude: -25.7479,
    longitude: 28.2293,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [locationGranted, setLocationGranted] = useState(false);
  const [connection, setConnection] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [bus, setBus] = useState<any | null>(null);
  const [path, setPath] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [stops, setStops] = useState<Array<any>>([]);
  const [follow, setFollow] = useState(true);
  const rotation = useRef(new Animated.Value(0)).current;
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        const pos = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    })();
  }, []);

  useEffect(() => {
    // Connect to WS
    const ws = new WebSocket('ws://localhost:3000/ws/bus');
    wsRef.current = ws;
    ws.onopen = () => {
      setConnection('connected');
      ws.send(JSON.stringify({ type: 'subscribe', routeId: 'route_201_demo', busNumber: '201' }));
    };
    ws.onclose = () => setConnection('disconnected');
    ws.onerror = () => setConnection('disconnected');
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'update') {
          setBus({
            latitude: data.latitude,
            longitude: data.longitude,
            heading: data.heading,
            status: data.status,
            etaSeconds: data.etaSeconds,
            updatedAt: data.updatedAt,
          });
          setStops(data.stops || []);
          setPath(data.path || []);
        }
      } catch {}
    };
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (bus && follow) {
      setRegion((r) => ({ ...r, latitude: bus.latitude, longitude: bus.longitude }));
    }
    if (bus) {
      Animated.timing(rotation, { toValue: bus.heading, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    }
  }, [bus, follow]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation={locationGranted}>
        {path.length > 1 && (
          <Polyline coordinates={path} strokeColor={colors.primary} strokeWidth={4} />
        )}
        {stops.map((s) => (
          <Marker key={s.id} coordinate={{ latitude: s.latitude, longitude: s.longitude }} title={s.name}>
            <View style={styles.stopGlow} />
          </Marker>
        ))}
        {bus && (
          <Marker coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}>
            <Animated.View style={{ transform: [{ rotate: rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }] }}>
              <Text style={styles.busIcon}>🚌</Text>
            </Animated.View>
          </Marker>
        )}
      </MapView>
      <View style={styles.topBar}>
        <Text>WS: {connection}</Text>
        {bus && <Text>ETA: {Math.ceil(bus.etaSeconds / 60)} min • {bus.status}</Text>}
      </View>
      <View style={styles.followBtn}>
        <TouchableOpacity style={styles.follow} onPress={() => setFollow((f) => !f)}>
          <Text style={{ color: '#fff' }}>{follow ? 'Following' : 'Follow Bus'}</Text>
        </TouchableOpacity>
      </View>
      {!locationGranted && (
        <View className="overlay"><Text>Grant location permission for live tracking</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlay: { position: 'absolute', top: spacing.lg, left: spacing.lg, right: spacing.lg, backgroundColor: '#fff', padding: spacing.md, borderRadius: 8 },
  stopGlow: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.gold, shadowColor: colors.gold, shadowOpacity: 0.8, shadowRadius: 10 },
  busIcon: { fontSize: 28 },
  topBar: { position: 'absolute', top: spacing.lg, left: spacing.lg, right: spacing.lg, backgroundColor: 'rgba(255,255,255,0.9)', padding: spacing.sm, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' },
  followBtn: { position: 'absolute', bottom: spacing.lg, right: spacing.lg },
  follow: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 20 },
});
