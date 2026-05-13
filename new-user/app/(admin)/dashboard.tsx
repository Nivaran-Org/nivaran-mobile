import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Platform, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth, BASE_URL } from '../../contexts/AuthContext';
import { getOfficers, getComplaints, getAllUsers } from '../../services/api';

import {
  LayoutDashboard, AlertCircle, Clock, CheckCircle,
  Users, FileText, TrendingUp, ChevronRight,
} from 'lucide-react-native';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
  setLoading(true); 
  try {
    const [cRes, oRes, uRes] = await Promise.all([
      getComplaints(), 
      getOfficers(),
      getAllUsers()
    ]);
    
    if (oRes.success) setOfficers(oRes.data ?? []);
    if (uRes.success) setAllUsers(uRes.data ?? []);

    if (cRes.success) {
      const rawData = Array.isArray(cRes.data) ? cRes.data : [];
      
      // LINK DATA: Map IDs to Names for display
      const linkedData = rawData.map((c: any) => {
        // Find Reporter Name
        const reporter = uRes.data?.find((u: any) => u.id === c.user_id);
        // Find Officer Name
        const officer = oRes.data?.find((o: any) => o.id === c.assigned_to);
        
        const getResPhoto = (obj: any) => {
          if (!obj) return null;
          const candidates = [
            obj.rectification_image, obj.rectificationImage, obj.rectified_image, 
            obj.rectifiedImage, obj.rectifiedImageUrl, obj.rectified_image_url, 
            obj.rectified_photo_url, obj.resolved_photo_url, obj.resolved_photo, 
            obj.resolution_photo, obj.rectification_photo, obj.proof_url,
            obj.rectification_image_url
          ];
          for (const cand of candidates) {
            if (typeof cand === 'string') return cand;
            if (cand && typeof cand === 'object' && cand.url) return cand.url;
            if (cand && typeof cand === 'object' && cand.uri) return cand.uri;
          }
          if (Array.isArray(obj.rectification_images) && obj.rectification_images[0]) {
            const first = obj.rectification_images[0];
            return typeof first === 'string' ? first : (first?.url || first?.uri);
          }
          if (obj.resolution) return getResPhoto(obj.resolution);
          return null;
        };

        const resPhoto = getResPhoto(c);
        const formattedResPhoto = resPhoto 
          ? (typeof resPhoto === 'string' ? (resPhoto.startsWith('http') ? resPhoto : `${BASE_URL}${resPhoto.startsWith('/') ? '' : '/'}${resPhoto}`) : null)
          : null;

        const mainPhoto = c.photo_url;
        const formattedMainPhoto = mainPhoto
          ? (mainPhoto.startsWith('http') ? mainPhoto : `${BASE_URL}${mainPhoto.startsWith('/') ? '' : '/'}${mainPhoto}`)
          : 'https://via.placeholder.com/100';

        return {
          ...c,
          display_user_name: c.user_name || c.user?.name || reporter?.name || 'Citizen',
          display_officer_name: c.officer_name || officer?.name || 'Unassigned',
          display_resolved_photo: formattedResPhoto,
          display_main_photo: formattedMainPhoto,
          display_officer_note: c.officerRemarks || c.remarks || c.officer_note || c.officerNote || '',
          // Normalize status for counting
          norm_status: (c.status || 'pending').toLowerCase().replace('-', '_')
        };
      });

      setComplaints(linkedData);
    }
  } catch (e) {
    console.error("Dashboard error:", e);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

 useFocusEffect(
  useCallback(() => {
    fetchData();
  }, [fetchData])
);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

const stats = {
  total: complaints.length,
  pending: complaints.filter(c => 
    ['pending', 'auto-routed', 'ai unavailable'].includes(c.norm_status)
  ).length,
  
  inProgress: complaints.filter(c => c.norm_status === 'in_progress').length,
  resolved: complaints.filter(c => c.norm_status === 'resolved').length,
  
  unassigned: complaints.filter(c => 
    !c.department || 
    c.department === 'Unassigned' || 
    c.ai_status === 'AI Unavailable'
  ).length,

  resolutionRate: complaints.length > 0
    ? Math.round((complaints.filter(c => c.norm_status === 'resolved').length / complaints.length) * 100)
    : 0,
};

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
              <Image 
                source={{ uri: c.display_resolved_photo || c.display_main_photo }} 
                style={styles.recentThumb} 
              />
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <View style={[styles.statusDot, {
                    backgroundColor: {
                      pending: '#F59E0B',
                      in_progress: '#3B82F6',
                      resolved: '#10B981',
                      rejected: '#EF4444',
                    }[c.norm_status] || '#94A3B8'
                  }]} />
                  <Text style={styles.recentTitle} numberOfLines={1}>{c.title}</Text>
                </View>
                <Text style={styles.recentMeta} numberOfLines={1}>
                    By {c.display_user_name} • {c.department || 'Processing...'}
                </Text>
                <Text style={styles.recentStaff} numberOfLines={1}>
                    Assignee: {c.display_officer_name}
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
  recentThumb: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#F1F5F9' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  recentTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', flex: 1 },
  recentMeta: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  recentStaff: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#94A3B8', padding: 20 },
});