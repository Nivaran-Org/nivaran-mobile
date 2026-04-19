import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// Import from the ROOT components folder we moved earlier
import GrievanceMap from '../../components/GrievanceMap';

export default function DetailsScreen() {
  const params = useLocalSearchParams();

  const lat = parseFloat(params.latitude as string) || 31.6340;
  const lon = parseFloat(params.longitude as string) || 74.8723;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <GrievanceMap latitude={lat} longitude={lon} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>COMPLAINANT</Text>
          <Text style={styles.value}>{params.user}</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>REPORTED ISSUE</Text>
          <Text style={styles.issueValue}>{params.issue}</Text>
          
          <View style={styles.timeBadge}>
             <Ionicons name="time-outline" size={14} color="#64748B" />
             <Text style={styles.timeText}>{params.date} | {params.time}</Text>
          </View>

          <TouchableOpacity style={styles.resolveBtn}>
            <Text style={styles.resolveText}>MARK AS RESOLVED</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  mapContainer: { height: 300, width: '100%' },
  infoSection: { padding: 25 },
  label: { fontSize: 10, fontWeight: '900', color: '#94A3B8', letterSpacing: 1, marginBottom: 5 },
  value: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  issueValue: { fontSize: 18, fontWeight: '700', color: '#1E3A8A', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 30 },
  timeText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  resolveBtn: { backgroundColor: '#1E3A8A', padding: 20, borderRadius: 15, alignItems: 'center' },
  resolveText: { color: '#FFF', fontWeight: '900', fontSize: 15 }
});