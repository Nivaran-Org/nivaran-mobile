import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data based on your "Active" grievance category
const ACTIVE_GRIEVANCES = [
  {
    id: 'GRV-9821',
    issue: 'Street Light Not Working',
    department: 'Electricity',
    description: 'The street lights in the entire lane have been flickering and are now completely out for two days.',
    status: 'IN PROGRESS',
    submittedBy: 'Kiran Deshmukh',
    date: '2026-04-20',
    time: '10:45 AM',
    color: '#3B82F6',
  },
  {
    id: 'GRV-8742',
    issue: 'Water Supply Contamination',
    department: 'Water Supply',
    description: 'The tap water smells of chlorine and has a yellowish tint since this morning.',
    status: 'ON-SITE INSPECTION',
    submittedBy: 'Rajesh Kumar',
    date: '2026-04-21',
    time: '02:15 PM',
    color: '#22C55E',
  }
];

export default function ActiveCasesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Active Cases</Text>
          <Text style={styles.headerSubtitle}>जारी शिकायतें</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {ACTIVE_GRIEVANCES.map((item) => (
          <View key={item.id} style={styles.caseCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.caseId}>{item.id}</Text>
              <View style={[styles.statusPill, { backgroundColor: `${item.color}15` }]}>
                <Text style={[styles.statusText, { color: item.color }]}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.issueTitle}>{item.issue}</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>

            <View style={styles.divider} />

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={14} color="#64748B" />
                <Text style={styles.infoLabel}>User: </Text>
                <Text style={styles.infoValue}>{item.submittedBy}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
                <Text style={styles.infoLabel}>Date: </Text>
                <Text style={styles.infoValue}>{item.date}</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={14} color="#64748B" />
                <Text style={styles.infoLabel}>Time: </Text>
                <Text style={styles.infoValue}>{item.time}</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="business-outline" size={14} color="#64748B" />
                <Text style={styles.infoLabel}>Dept: </Text>
                <Text style={styles.infoValue}>{item.department}</Text>
              </View>
            </View>

            <Pressable style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Update Progress</Text>
              <Ionicons name="chevron-forward" size={16} color="white" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { marginRight: 15, padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: 'white' },
  headerSubtitle: { fontSize: 12, color: '#93C5FD', fontWeight: '700' },
  scrollBody: { padding: 18 },
  caseCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  caseId: { fontSize: 12, fontWeight: '800', color: '#94A3B8' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  issueTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  descriptionText: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center', width: '45%' },
  infoLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginLeft: 4 },
  infoValue: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  actionButton: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: { color: 'white', fontWeight: '800', fontSize: 14 },
});