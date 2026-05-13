import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions, StatusBar, Platform, RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Shield, Bell, User, Clock, CheckCircle, AlertTriangle, FileText, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getComplaints, getOfficers } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [complaintsRes, officersRes] = await Promise.all([
        getComplaints(),
        getOfficers()
      ]);
      
      if (complaintsRes.success) {
        setComplaints(complaintsRes.data ?? []);
      }
      if (officersRes.success) {
        setOfficers(officersRes.data ?? []);
      }
    } catch (e) {
      console.error('fetchDashboardData:', e);
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

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    overdue: complaints.filter(c => {
      // Logic for overdue: pending for more than 48 hours
      const created = new Date(c.created_at).getTime();
      const now = new Date().getTime();
      return c.status === 'pending' && (now - created) > (48 * 60 * 60 * 1000);
    }).length,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* Header - Rounded Bottom */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTopRow}>
            <Text style={styles.chakra}>☸</Text>
            <Text style={styles.headerTitle}>Admin Portal</Text>
          </View>
          <Text style={styles.headerSubtitle}>Welcome back, {user?.name?.split(' ')[0]}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(admin)/notification')}>
            <Bell size={22} color="#fff" />
            {stats.pending > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(admin)/profile')}>
            <User size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />
        }
      >
        {/* Quick Metrics */}
        <View style={styles.statsGrid}>
          <StatCard 
            label="Total" 
            value={stats.total} 
            color="#1E3A8A" 
            bg="#DBEAFE" 
            icon={<FileText size={20} color="#1E3A8A" />} 
            onPress={() => router.push('/(admin)/screens/active-cases')}
          />
          <StatCard 
            label="Pending" 
            value={stats.pending} 
            color="#D97706" 
            bg="#FEF3C7" 
            icon={<Clock size={20} color="#D97706" />} 
            onPress={() => router.push('/(admin)/screens/new-cases')}
          />
          <StatCard 
            label="In Progress" 
            value={stats.inProgress} 
            color="#2563EB" 
            bg="#DBEAFE" 
            icon={<Shield size={20} color="#2563EB" />} 
            onPress={() => router.push('/(admin)/screens/active-cases')}
          />
          <StatCard 
            label="Resolved" 
            value={stats.resolved} 
            color="#16A34A" 
            bg="#DCFCE7" 
            icon={<CheckCircle size={20} color="#16A34A" />} 
            onPress={() => router.push('/(admin)/screens/resolved-cases')}
          />
        </View>

        {/* System Health */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <View style={styles.healthDot} />
            <Text style={styles.healthTitle}>SYSTEM HEALTH: OPTIMAL</Text>
          </View>
          <View style={styles.healthMetrics}>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>API LATENCY</Text>
              <Text style={styles.healthValue}>24ms</Text>
            </View>
            <View style={styles.healthDivider} />
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>OFFICERS LIVE</Text>
              <Text style={styles.healthValue}>{officers.length}</Text>
            </View>
            <View style={styles.healthDivider} />
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>SLA UPTIME</Text>
              <Text style={styles.healthValue}>99.9%</Text>
            </View>
          </View>
        </View>

        {/* Case Management Hub */}
        <Text style={styles.sectionLabel}>CASE MANAGEMENT</Text>
        <View style={styles.hubContainer}>
          <HubCard 
            title="New Cases" 
            subtitle="Immediate action required" 
            count={stats.pending} 
            icon="alert-circle" 
            color="#EF4444" 
            onPress={() => router.push('/(admin)/screens/new-cases')} 
          />
          <HubCard 
            title="Active Cases" 
            subtitle="Currently being processed" 
            count={stats.inProgress} 
            icon="time" 
            color="#3B82F6" 
            onPress={() => router.push('/(admin)/screens/active-cases')} 
          />
          <HubCard 
            title="Resolved" 
            subtitle="Archived successfully" 
            count={stats.resolved} 
            icon="checkmark-done-circle" 
            color="#10B981" 
            onPress={() => router.push('/(admin)/screens/resolved-cases')} 
          />
          <HubCard 
            title="Overdue SLA" 
            subtitle="Breached target time" 
            count={stats.overdue} 
            icon="warning" 
            color="#F59E0B" 
            onPress={() => router.push('/(admin)/screens/overdue')} 
          />
          <HubCard 
            title="Field Force" 
            subtitle="Monitor active officers" 
            count="LIVE" 
            icon="people" 
            color="#6366F1" 
            onPress={() => router.push('/(admin)/screens/staff-online')} 
          />
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
        <View style={styles.card}>
          {complaints.slice(0, 7).map((c, i) => (
            <TouchableOpacity 
              key={c.id} 
              style={[styles.activityRow, i === complaints.slice(0, 7).length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => router.push(`/(admin)/screens/case-details?id=${c.id}`)}
            >
              <View style={[styles.activityIcon, { backgroundColor: c.status === 'resolved' ? '#DCFCE7' : '#FEF3C7' }]}>
                <Ionicons 
                  name={c.status === 'resolved' ? 'checkmark-circle' : 'time'} 
                  size={16} 
                  color={c.status === 'resolved' ? '#16A34A' : '#D97706'} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{c.title}</Text>
                <Text style={styles.activitySub}>Status changed to {c.status.replace('_', ' ')}</Text>
              </View>
              <Text style={styles.activityTime}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
          ))}
          {complaints.length === 0 && (
            <Text style={styles.emptyActivity}>No recent activity found</Text>
          )}
        </View>

        {/* Performance & Compliance */}
        <Text style={styles.sectionLabel}>SYSTEM AUDIT</Text>
        <View style={styles.card}>
          <View style={styles.terminalHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#1E3A8A" />
            <Text style={styles.terminalTitle}>Integrity Archive</Text>
          </View>
          <ArchiveItem title="National Grievance Report" date="May 2026" status="VERIFIED" />
          <ArchiveItem title="Officer Conduct Audit" date="Q2 Summary" status="SIGNED" />
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>GENERATE COMPLIANCE CERTIFICATE</Text>
            <Ionicons name="document-text-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SYSTEM FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.version}>v4.2.0 Command Interface</Text>
          <Text style={styles.syncStatus}>Encryption: AES-256 Active | Live Database</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, color, bg, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIconWrap, { backgroundColor: bg }]}>{icon}</View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function HubCard({ title, subtitle, count, icon, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.hubCard} onPress={onPress}>
      <View style={[styles.hubIconCircle, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.hubTextContainer}>
        <Text style={styles.hubTitle}>{title}</Text>
        <Text style={styles.hubSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.hubBadge}>
        <Text style={[styles.hubBadgeText, { color }]}>{count}</Text>
        <ChevronRight size={16} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
}

const ArchiveItem = ({ title, date, status }: any) => (
  <View style={styles.archiveRow}>
    <View>
      <Text style={styles.archiveMain}>{title}</Text>
      <Text style={styles.archiveSub}>{date}</Text>
    </View>
    <View style={styles.statusBadge}>
      <Text style={styles.statusBadgeText}>{status}</Text>
    </View>
  </View>
);

// --- STYLES ---

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },

  /* header - Rounded Bottom Corners */
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 20,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chakra: { fontSize: 24, color: '#BFDBFE' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: '600' },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#1E3A8A'
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '800', marginTop: 4, letterSpacing: 0.5 },

  /* System Health */
  healthCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  healthHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  healthDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 8 },
  healthTitle: { fontSize: 10, fontWeight: '900', color: '#94A3B8', letterSpacing: 1 },
  healthMetrics: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  healthItem: { flex: 1, alignItems: 'center' },
  healthLabel: { fontSize: 8, color: '#64748B', fontWeight: '900', marginBottom: 4 },
  healthValue: { fontSize: 14, color: '#ffffff', fontWeight: '800' },
  healthDivider: { width: 1, height: 20, backgroundColor: '#334155' },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    marginBottom: 12,
    letterSpacing: 1,
    marginTop: 10,
  },

  /* Hub Cards */
  hubContainer: { gap: 12, marginBottom: 20 },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hubIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hubTextContainer: { flex: 1 },
  hubTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  hubSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '600' },
  hubBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hubBadgeText: { fontSize: 16, fontWeight: '900' },

  /* Activity Row */
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  activitySub: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  activityTime: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  emptyActivity: { textAlign: 'center', paddingVertical: 20, color: '#94A3B8', fontWeight: '600' },

  /* General Card Styles */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  terminalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  terminalTitle: { fontSize: 16, fontWeight: '900', color: '#1E3A8A' },
  archiveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  archiveMain: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  archiveSub: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  statusBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 9, fontWeight: '900', color: '#10B981' },
  exportBtn: { backgroundColor: '#1E3A8A', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 14, gap: 10, marginTop: 15 },
  exportText: { color: '#fff', fontWeight: '900', fontSize: 12 },

  /* Footer */
  footer: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  version: { fontSize: 11, color: '#94A3B8', fontWeight: '800' },
  syncStatus: { fontSize: 9, color: '#94A3B8', marginTop: 4, fontWeight: '700' }
});
