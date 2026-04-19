import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  const stats = [
    { label: 'Total Assigned', count: '12', icon: 'clipboard', color: '#1E3A8A' },
    { label: 'Pending Audit', count: '05', icon: 'time', color: '#F59E0B' },
    { label: 'Resolved', count: '07', icon: 'checkmark-circle', color: '#10B981' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Department Insights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsGrid}>
          {stats.map((item, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
              <Text style={styles.statCount}>{item.count}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>Monthly Performance</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Resolution Rate: 85%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '85%' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 25, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1E3A8A' },
  content: { padding: 20 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, width: '31%', alignItems: 'center', elevation: 2 },
  statCount: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginVertical: 5 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', textAlign: 'center' },
  performanceSection: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E3A8A', marginBottom: 15 },
  progressContainer: { marginBottom: 10 },
  progressLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1E3A8A' }
});