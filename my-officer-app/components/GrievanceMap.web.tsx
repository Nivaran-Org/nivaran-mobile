import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GrievanceMap({ latitude, longitude }: any) {
  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={40} color="#94A3B8" />
      <Text style={styles.text}>Map View Active on Mobile</Text>
      <Text style={styles.coords}>GPS: {latitude}, {longitude}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#64748B', fontWeight: '700', marginTop: 10 },
  coords: { color: '#94A3B8', fontSize: 12, marginTop: 4 }
});