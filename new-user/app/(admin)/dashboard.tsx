import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getOfficers, getComplaints } from '../../services/api';

import {
  LayoutDashboard, AlertCircle, Clock, CheckCircle,
  Users, FileText, TrendingUp, ChevronRight,
} from 'lucide-react-native';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
  // Explicitly set loading to true when starting
  setLoading(true); 
  try {
    const [cRes, oRes] = await Promise.all([getComplaints(), getOfficers()]);
    
    // DEBUG: Check what the API is actually sending back to the Dashboard
    console.log("Dashboard Complaint Data:", cRes.data?.length);

    if (cRes.success) {
      // Use the spread operator to ensure a new array reference is created

      const complaintData = Array.isArray(cRes.data) ? [...cRes.data] : [];
      console.log("RAW FIRST COMPLAINT:", JSON.stringify(complaintData[0], null, 2));
      setComplaints(complaintData);
    }
    
    if (oRes.success) {
      setOfficers(oRes.data ?? []);
    }
  } catch (e) {
    console.error("Dashboard error:", e);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []); // Keep dependencies empty so the function reference is stable

 useFocusEffect(
  useCallback(() => {
    // Force a fresh start to ensure the UI knows it needs to update
    fetchData();
    
    return () => {
      // Optional: stop any pending tasks if the user leaves the screen
    };
  }, [fetchData])
);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

 
  // --- UPDATE YOUR STATS OBJECT ---
const stats = {
  total: complaints.length,
  // Match 'pending' OR 'auto-routed' (or whatever status your AI sets)
  pending: complaints.filter(c => 
    ['pending', 'auto-routed', 'ai unavailable'].includes(c.status?.toLowerCase())
  ).length,
  
  inProgress: complaints.filter(c => c.status?.toLowerCase() === 'in_progress').length,
  resolved: complaints.filter(c => c.status?.toLowerCase() === 'resolved').length,
  
  // FIXED: Logic for Unassigned
  // A case is unassigned if it has no department OR the AI failed to route it
  unassigned: complaints.filter(c => 
    !c.department || 
    c.department === 'Unassigned' || 
    c.ai_status === 'AI Unavailable'
  ).length,

  resolutionRate: complaints.length > 0
    ? Math.round((complaints.filter(c => c.status?.toLowerCase() === 'resolved').length / complaints.length) * 100)
    : 0,
};

  // Group by department (handles long names from AI)
  const byDept: Record<string, number> = {};
  complaints.forEach(c => {
    const dept = c.department || 'Unassigned';
    byDept[dept] = (byDept[dept] || 0) + 1;
  });
  const deptList = Object.entries(byDept).sort((a, b) => b[1] - a[1]).slice(0, 5);

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
              <Text style={styles.liveText}>LIVE SYNC</Text>
            </View>
          </View>

          <View style={styles.quickMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{stats.resolutionRate}%</Text>
              <Text style={styles.metricLabel}>Solved</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{officers.length}</Text>
              <Text style={styles.metricLabel}>Staff</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{stats.total}</Text>
              <Text style={styles.metricLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Pending" value={stats.pending} color="#F59E0B" icon={<Clock size={20} color="#F59E0B" />} />
          <StatCard label="Active" value={stats.inProgress} color="#3B82F6" icon={<TrendingUp size={20} color="#3B82F6" />} />
          <StatCard label="Resolved" value={stats.resolved} color="#10B981" icon={<CheckCircle size={20} color="#10B981" />} />
          <StatCard label="Needs AI" value={stats.unassigned} color="#EF4444" icon={<AlertCircle size={20} color="#EF4444" />} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>Management</Text>
        <View style={styles.actionsRow}>
          <ActionBtn 
            label="All Cases" 
            count={stats.total} 
            icon={<FileText size={24} color="#1E3A8A" />} 
            onPress={() => router.push('/(admin)/screens/new-cases')} 
          />
          <ActionBtn 
            label="Staff" 
            count={officers.length} 
            icon={<Users size={24} color="#7C3AED" />} 
            onPress={() => router.push('/(admin)/screens/staff-online')} 
            color="#7C3AED"
          />
        </View>

        {/* Department Breakdown */}
        {deptList.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Department Distribution</Text>
            <View style={styles.card}>
              {deptList.map(([dept, count], i) => (
                <View key={i} style={styles.deptRow}>
                  <Text style={styles.deptName} numberOfLines={1}>{dept}</Text>
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
          <Text style={styles.sectionLabel}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/screens/new-cases')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {recent.length === 0 ? (
            <Text style={styles.emptyText}>No complaints found</Text>
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
                }[c.status?.toLowerCase()] || '#94A3B8'
              }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentTitle} numberOfLines={1}>{c.title}</Text>
                <Text style={styles.recentMeta} numberOfLines={1}>
                    {c.department || 'Processing...'} • {new Date(c.created_at).toLocaleDateString()}
                </Text>
              </View>
              <ChevronRight size={16} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Components
function StatCard({ label, value, color, icon }: any) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>{icon}</View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionBtn({ label, count, icon, onPress, color = "#1E3A8A" }: any) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      {icon}
      <Text style={styles.actionText}>{label}</Text>
      <View style={[styles.actionBadge, { backgroundColor: color + '15' }]}>
        <Text style={[styles.actionBadgeText, { color }]}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#1E3A8A',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
    width: '47.5%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#94A3B8', marginLeft: 16, marginTop: 20, marginBottom: 10, textTransform: 'uppercase' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  viewAll: { fontSize: 13, color: '#3B82F6', fontWeight: '700', marginTop: 10 },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, elevation: 2,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  actionBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  actionBadgeText: { fontSize: 12, fontWeight: '800' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 8, elevation: 2 },
  deptRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  deptName: { fontSize: 12, fontWeight: '700', color: '#334155', flex: 2 },
  deptBar: { flex: 3, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3 },
  deptBarFill: { height: '100%', borderRadius: 3 },
  deptCount: { fontSize: 12, fontWeight: '800', color: '#1E293B', width: 30, textAlign: 'right' },
  recentRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  recentBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  recentDot: { width: 10, height: 10, borderRadius: 5 },
  recentTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  recentMeta: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#94A3B8', padding: 20 },
});