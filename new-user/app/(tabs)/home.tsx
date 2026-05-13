import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Platform, StatusBar,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getComplaints } from '../../services/api';
import { router, useFocusEffect } from 'expo-router';
import { FileText, Clock, CheckCircle, Loader, MapPin, Plus, ChevronRight } from 'lucide-react-native';

type Complaint = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  department: string;
  latitude: string;
  longitude: string;
  created_at: string;
  photo_url: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  pending:     '#d97706',
  in_progress: '#2563eb',
  resolved:    '#16a34a',
  rejected:    '#dc2626',
};

const STATUS_LABEL: Record<string, string> = {
  pending:     'Pending',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  rejected:    'Rejected',
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getComplaints();
      if (res.success) setComplaints(res.data ?? []);
    } catch (e) {
      console.error('fetchComplaints:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch every time the tab gains focus → new complaints appear immediately after filing
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const stats = {
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved:   complaints.filter(c => c.status === 'resolved').length,
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTop}>
            <Text style={styles.chakra}>☸  </Text>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'Citizen'} 👋</Text>
          </Text>
          <Text style={styles.subGreeting}>Track your civic complaints</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(tabs)/report')}>
          <Plus size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#16a34a"
            colors={['#16a34a']}
          />
        }
        contentContainerStyle={styles.scroll}
      >
        {/* ── Stats grid ── */}
        <View style={styles.statsGrid}>
          <StatCard label="Total"       value={stats.total}      color="#374151" bg="#f3f4f6" icon={<FileText   size={20} color="#374151" />} />
          <StatCard label="Pending"     value={stats.pending}    color="#d97706" bg="#fef3c7" icon={<Clock       size={20} color="#d97706" />} />
          <StatCard label="In Progress" value={stats.inProgress} color="#2563eb" bg="#dbeafe" icon={<Loader      size={20} color="#2563eb" />} />
          <StatCard label="Resolved"    value={stats.resolved}   color="#16a34a" bg="#dcfce7" icon={<CheckCircle size={20} color="#16a34a" />} />
        </View>

        <Text style={styles.sectionTitle}>MY COMPLAINTS</Text>

        {/* ── Empty state ── */}
        {complaints.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No complaints yet</Text>
            <Text style={styles.emptySub}>Pull down to refresh, or file your first complaint below.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/report')}>
              <Plus size={16} color="#fff" />
              <Text style={styles.emptyBtnText}>File a Complaint</Text>
            </TouchableOpacity>
          </View>
        ) : (
          complaints.map(c => {
            const color = STATUS_COLOR[c.status] ?? '#6b7280';
            const label = STATUS_LABEL[c.status] ?? c.status;
            return (
              /* ── Tappable card → complaint detail ── */
              <TouchableOpacity
                key={c.id}
                style={styles.card}
                activeOpacity={0.75}
                onPress={() => router.push(`/complaint/${c.id}`)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{c.title}</Text>
                  <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.badgeText, { color }]}>{label}</Text>
                  </View>
                </View>

                <Text style={styles.cardDesc} numberOfLines={2}>{c.description}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.metaRow}>
                    <MapPin size={12} color="#9ca3af" />
                    <Text style={styles.metaText} numberOfLines={1}>{c.department || '—'}</Text>
                  </View>
                  <View style={styles.footerRight}>
                    <Text style={styles.cardDate}>
                      {new Date(c.created_at).toLocaleDateString('en-IN')}
                    </Text>
                    <ChevronRight size={14} color="#9ca3af" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, color, bg, icon }: {
  label: string; value: number; color: string; bg: string; icon: React.ReactNode;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: bg }]}>{icon}</View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' },

  header: {
    backgroundColor: '#15803d',
    paddingTop: Platform.OS === 'web' ? 24 : (StatusBar.currentHeight ?? 40) + 12,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerTop:   { flexDirection: 'row', alignItems: 'center' },
  chakra:      { fontSize: 20, color: '#bbf7d0' },
  greeting:    { fontSize: 20, fontWeight: '700', color: '#fff' },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#f97316',
    justifyContent: 'center', alignItems: 'center',
  },

  scroll: { padding: 16, paddingBottom: 100 },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 20,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d1fae5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 30, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#6b7280', fontWeight: '700', marginTop: 3, letterSpacing: 0.4 },

  sectionTitle: {
    fontSize: 11, fontWeight: '800', color: '#6b7280',
    letterSpacing: 1.2, marginBottom: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#d1fae5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  cardTitle:  { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  badge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:  { fontSize: 11, fontWeight: '700' },
  cardDesc:   { fontSize: 13, color: '#6b7280', lineHeight: 19, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText:   { fontSize: 12, color: '#9ca3af', flex: 1 },
  footerRight:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDate:   { fontSize: 12, color: '#9ca3af' },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySub:   { fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#16a34a',
    paddingHorizontal: 22, paddingVertical: 13, borderRadius: 14,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});