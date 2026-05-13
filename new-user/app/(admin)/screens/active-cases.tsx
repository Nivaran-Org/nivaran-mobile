import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getComplaints } from '../../../services/api';

export default function ActiveCasesScreen() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getComplaints();
      if (res.success) {
        // Active cases are usually 'in_progress'
        const active = (res.data ?? []).filter((c: any) => c.status === 'in_progress');
        setComplaints(active);
      }
    } catch (e) {
      console.error('fetchActiveCases:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* Header - Rounded */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Active Cases</Text>
          <Text style={styles.headerSubtitle}>Currently in progress</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollBody}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />
        }
      >
        {complaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No active cases found</Text>
          </View>
        ) : (
          complaints.map((item) => (
            <View key={item.id} style={styles.caseCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.caseId}>ID: {item.id}</Text>
                <View style={[styles.statusPill, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.statusText, { color: '#2563EB' }]}>IN PROGRESS</Text>
                </View>
              </View>

              <Text style={styles.issueTitle}>{item.title}</Text>
              <Text style={styles.descriptionText} numberOfLines={3}>{item.description}</Text>

              <View style={styles.divider} />

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="business-outline" size={14} color="#64748B" />
                  <Text style={styles.infoLabel}>Dept: </Text>
                  <Text style={styles.infoValue}>{item.department || 'General'}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.infoLabel}>Date: </Text>
                  <Text style={styles.infoValue}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="alert-circle-outline" size={14} color="#64748B" />
                  <Text style={styles.infoLabel}>Priority: </Text>
                  <Text style={styles.infoValue}>{item.priority || 'Normal'}</Text>
                </View>
              </View>

              <Pressable style={styles.actionButton} onPress={() => router.push(`/(admin)/screens/case-details?id=${item.id}`)}>
                <Text style={styles.actionButtonText}>View Full Details</Text>
                <Ionicons name="chevron-forward" size={16} color="white" />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  backButton: { marginRight: 15, padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: 'white' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
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
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#94A3B8', fontWeight: '600' }
});