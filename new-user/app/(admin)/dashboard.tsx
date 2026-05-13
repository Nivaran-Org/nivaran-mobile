import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getComplaints, getOfficers } from '../../services/api';
import {
  LayoutDashboard, AlertCircle, Clock, CheckCircle,
  Users, FileText, TrendingUp, ChevronRight, Shield,
} from 'lucide-react-native';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [cRes, oRes] = await Promise.all([getComplaints(), getOfficers()]);
      if (cRes.success) setComplaints(cRes.data);
      if (oRes.success) setOfficers(oRes.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    unassigned: complaints.filter(c => !c.assigned_to).length,
    resolutionRate: complaints.length > 0
      ? Math.round((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100)
      : 0,
  };

  // Group by department
  const byDept: Record<string, number> = {};
  complaints.forEach(c => {
    const dept = c.department || 'Unassigned';
    byDept[dept] = (byDept[dept] || 0) + 1;
  });
  const deptList = Object.entries(byDept).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Recent complaints
  const recent = [...complaints].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1E3A8A" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSub}>Welcome back,</Text>
              <Text style={styles.headerTitle}>{user?.name} 👋</Text>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {/* Quick metrics from real data */}
          <View style={styles.quickMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{stats.resolutionRate}%</Text>
              <Text style={styles.metricLabel}>Resolution Rate</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{officers.length}</Text>
              <Text style={styles.metricLabel}>Officers</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{stats.total}</Text>
              <Text style={styles.metricLabel}>Total Cases</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Pending" value={stats.pending} color="#F59E0B" icon={<Clock size={20} color="#F59E0B" />} />
          <StatCard label="In Progress" value={stats.inProgress} color="#3B82F6" icon={<TrendingUp size={20} color="#3B82F6" />} />
          <StatCard label="Resolved" value={stats.resolved} color="#10B981" icon={<CheckCircle size={20} color="#10B981" />} />
          <StatCard label="Unassigned" value={stats.unassigned} color="#EF4444" icon={<AlertCircle size={20} color="#EF4444" />} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/screens/new-cases')}
          >
            <FileText size={24} color="#1E3A8A" />
            <Text style={styles.actionText}>All Cases</Text>
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>{stats.total}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/screens/active-cases')}
          >
            <TrendingUp size={24} color="#3B82F6" />
            <Text style={styles.actionText}>Active</Text>
            <View style={[styles.actionBadge, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.actionBadgeText, { color: '#3B82F6' }]}>{stats.inProgress}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/screens/staff-online')}
          >
            <Users size={24} color="#7C3AED" />
            <Text style={styles.actionText}>Officers</Text>
            <View style={[styles.actionBadge, { backgroundColor: '#EDE9FE' }]}>
              <Text style={[styles.actionBadgeText, { color: '#7C3AED' }]}>{officers.length}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/screens/resolved-cases')}
          >
            <CheckCircle size={24} color="#10B981" />
            <Text style={styles.actionText}>Resolved</Text>
            <View style={[styles.actionBadge, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.actionBadgeText, { color: '#10B981' }]}>{stats.resolved}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Department Breakdown */}
        {deptList.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Cases by Department</Text>
            <View style={styles.card}>
              {deptList.map(([dept, count], i) => (
                <View key={i} style={styles.deptRow}>
                  <View style={styles.deptRank}>
                    <Text style={styles.deptRankText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.deptName}>{dept}</Text>
                  <View style={styles.deptBar}>
                    <View style={[styles.deptBarFill, {
                      width: `${Math.round((count / stats.total) * 100)}%`,
                      backgroundColor: ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6'][i],
                    }]} />
                  </View>
                  <Text style={styles.deptCount}>{count}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Recent Complaints */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Recent Cases</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/screens/new-cases')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {recent.length === 0 ? (
            <Text style={styles.emptyText}>No complaints yet</Text>
          ) : recent.map((c, i) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.recentRow, i < recent.length - 1 && styles.recentBorder]}
              onPress={() => router.push(`/(admin)/screens/case-details?id=${c.id}`)}
            >
              <View style={[styles.recentDot, {
                backgroundColor: {
                  pending: '#F59E0B',
                  in_progress: '#3B82F6',
                  resolved: '#10B981',
                  rejected: '#EF4444',
                }[c.status] || '#94A3B8'
              }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentTitle} numberOfLines={1}>{c.title}</Text>
                <Text style={styles.recentMeta}>{c.department} • {new Date(c.created_at).toLocaleDateString('en-IN')}</Text>
              </View>
              <ChevronRight size={16} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Officers Panel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Field Officers</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/screens/staff-online')}>
            <Text style={styles.viewAll}>Manage</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {officers.length === 0 ? (
            <Text style={styles.emptyText}>No officers registered</Text>
          ) : officers.slice(0, 4).map((o, i) => (
            <View key={o.id} style={[styles.officerRow, i < officers.length - 1 && styles.recentBorder]}>
              <View style={styles.officerAvatar}>
                <Text style={styles.officerInitial}>{o.name[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.officerName}>{o.name}</Text>
                <Text style={styles.officerEmail}>{o.email}</Text>
              </View>
              <View style={styles.officerCaseBadge}>
                <Text style={styles.officerCaseText}>
                  {complaints.filter(c => c.assigned_to === o.id).length} cases
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, icon }: any) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>{icon}</View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#1E3A8A',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 24 : 54,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 10,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerSub: { color: '#BFDBFE', fontSize: 13, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 6 },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  quickMetrics: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 20 },
  metric: { flex: 1, alignItems: 'center' },
  metricVal: { color: '#fff', fontSize: 18, fontWeight: '900' },
  metricLabel: { color: '#93C5FD', fontSize: 10, marginTop: 3, fontWeight: '700' },
  vDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  statCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#94A3B8', marginLeft: 16, marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  viewAll: { fontSize: 13, color: '#1E3A8A', fontWeight: '700', marginTop: 20 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  actionCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  actionBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  actionBadgeText: { fontSize: 12, fontWeight: '800', color: '#1E3A8A' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    marginBottom: 8,
  },
  deptRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  deptRank: { width: 24, height: 24, backgroundColor: '#EFF6FF', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  deptRankText: { fontSize: 11, fontWeight: '900', color: '#1E3A8A' },
  deptName: { fontSize: 13, fontWeight: '700', color: '#334155', width: 100 },
  deptBar: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  deptBarFill: { height: '100%', borderRadius: 3 },
  deptCount: { fontSize: 13, fontWeight: '800', color: '#1E293B', width: 24, textAlign: 'right' },
  recentRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  recentBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  recentDot: { width: 10, height: 10, borderRadius: 5 },
  recentTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  recentMeta: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  officerRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  officerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center' },
  officerInitial: { color: '#fff', fontWeight: '800', fontSize: 16 },
  officerName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  officerEmail: { fontSize: 11, color: '#94A3B8' },
  officerCaseBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  officerCaseText: { fontSize: 11, fontWeight: '700', color: '#1E3A8A' },
  emptyText: { textAlign: 'center', color: '#94A3B8', padding: 20, fontWeight: '600' },
});