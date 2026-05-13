import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getComplaints, getOfficers } from '../../../services/api';

export default function StaffHistory() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [officer, setOfficer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchData = useCallback(async () => {
    try {
      const [cRes, oRes] = await Promise.all([getComplaints(), getOfficers()]);
      if (cRes.success) {
        // Filter complaints assigned to this officer
        const officerComplaints = cRes.data.filter(
          (c: any) => c.assigned_to?.toString() === id?.toString()
        );
        setComplaints(officerComplaints);
      }
      if (oRes.success) {
        const found = oRes.data?.find((o: any) => o.id?.toString() === id?.toString());
        setOfficer(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]));

  const filtered = complaints.filter(c => {
    if (filter === 'All') return true;
    if (filter === 'Resolved') return c.status === 'resolved';
    if (filter === 'Active') return c.status === 'in_progress';
    if (filter === 'Pending') return c.status === 'pending';
    return true;
  });

  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    active: complaints.filter(c => c.status === 'in_progress').length,
    pending: complaints.filter(c => c.status === 'pending').length,
    rate: complaints.length > 0
      ? Math.round((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100)
      : 0,
  };

  const statusColor: Record<string, { bg: string; text: string }> = {
    pending:     { bg: '#FEF3C7', text: '#D97706' },
    in_progress: { bg: '#DBEAFE', text: '#2563EB' },
    resolved:    { bg: '#DCFCE7', text: '#16A34A' },
    rejected:    { bg: '#FEE2E2', text: '#EF4444' },
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#1E3A8A" /></View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>{officer?.name || 'Officer'}</Text>
            <Text style={styles.headerSub}>{officer?.email || 'Case History'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{stats.total}</Text>
            <Text style={styles.statLbl}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#10B981' }]}>{stats.resolved}</Text>
            <Text style={styles.statLbl}>Resolved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#3B82F6' }]}>{stats.active}</Text>
            <Text style={styles.statLbl}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>{stats.rate}%</Text>
            <Text style={styles.statLbl}>Rate</Text>
          </View>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterBar}>
        {['All', 'Pending', 'Active', 'Resolved'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.activeTab]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No cases found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const sc = statusColor[item.status] || { bg: '#F1F5F9', text: '#64748B' };
          return (
            <TouchableOpacity
              style={styles.historyCard}
              onPress={() => router.push(`/(admin)/screens/case-details?id=${item.id}`)}
            >
              <View style={[styles.statusBar, { backgroundColor: sc.text }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text style={styles.caseId}>#{item.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="business-outline" size={12} color="#94A3B8" />
                    <Text style={styles.metaText}>{item.department || 'General'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                    <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString('en-IN')}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={{ alignSelf: 'center' }} />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 10,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  headerSub: { color: '#93C5FD', fontSize: 12, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16, padding: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statLbl: { fontSize: 10, color: '#93C5FD', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  activeTab: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  activeTabText: { color: '#fff' },
  historyCard: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
  },
  statusBar: { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  caseId: { fontSize: 11, fontWeight: '800', color: '#94A3B8' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  taskTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600', marginTop: 12 },
});