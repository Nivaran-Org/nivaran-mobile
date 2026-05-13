import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Shield,
  LogOut,
  Info,
  FileText,
  Clock,
  Loader,
  CheckCircle,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getComplaints } from '../../services/api';

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'officer': return 'Field Officer';
    case 'admin':   return 'Administrator';
    default:        return 'Citizen';
  }
}

function getRoleBadgeColors(role: string): { bg: string; text: string } {
  switch (role) {
    case 'officer': return { bg: '#dbeafe', text: '#1e40af' };
    case 'admin':   return { bg: '#ede9fe', text: '#5b21b6' };
    default:        return { bg: '#dcfce7', text: '#15803d' };
  }
}

export default function ProfileScreen() {
  const { user, token, signOutUser } = useAuth();
  const router = useRouter();

  const [stats, setStats]       = useState<Stats>({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading]   = useState(true);

  const fetchStats = useCallback(async () => {
  setLoading(true);
  try {
    const res = await getComplaints();                  // no token arg needed
    const list = res.success ? (res.data ?? []) : [];  // unwrap the envelope

    setStats({
      total:      list.length,
      pending:    list.filter((c: any) => c.status === 'pending').length,
      inProgress: list.filter((c: any) => c.status === 'in_progress').length,
      resolved:   list.filter((c: any) => c.status === 'resolved').length,
    });
  } catch (e) {
    console.error('fetchStats:', e);
  } finally {
    setLoading(false);
  }
}, []);   // no token dependency needed either

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats]),
  );

  const handleLogout = useCallback(() => {
    signOutUser();
    router.replace('/login');
  }, [signOutUser, router]);

  const initial = (user?.displayName ?? user?.name ?? 'U').charAt(0).toUpperCase();
  const roleLabel  = getRoleLabel(user?.role ?? 'user');
  const badgeColor = getRoleBadgeColors(user?.role ?? 'user');

  const statCards = [
    { label: 'Total',       value: stats.total,      icon: <FileText  color="#374151" size={18} />, bg: '#f3f4f6', text: '#374151' },
    { label: 'Pending',     value: stats.pending,    icon: <Clock     color="#b45309" size={18} />, bg: '#fef3c7', text: '#b45309' },
    { label: 'In Progress', value: stats.inProgress, icon: <Loader    color="#1d4ed8" size={18} />, bg: '#dbeafe', text: '#1d4ed8' },
    { label: 'Resolved',    value: stats.resolved,   icon: <CheckCircle color="#15803d" size={18} />, bg: '#dcfce7', text: '#15803d' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.chakra}>☸</Text>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Name + Role */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <Text style={styles.userName}>{user?.displayName ?? user?.name ?? 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
          <View style={[styles.roleBadge, { backgroundColor: badgeColor.bg }]}>
            <Shield color={badgeColor.text} size={13} />
            <Text style={[styles.roleText, { color: badgeColor.text }]}>{roleLabel}</Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionLabel}>My Complaints</Text>
        {loading ? (
          <View style={styles.statsLoading}>
            <ActivityIndicator color="#16a34a" />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {statCards.map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
                {s.icon}
                <Text style={[styles.statValue, { color: s.text }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: s.text }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Account info */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Account Information</Text>
        <View style={styles.card}>
          <InfoRow icon={<User color="#16a34a" size={16} />} label="Full Name"  value={user?.name ?? '—'} />
          <Divider />
          <InfoRow icon={<Mail color="#16a34a" size={16} />} label="Email"     value={user?.email ?? '—'} />
          <Divider />
          <InfoRow icon={<Shield color="#16a34a" size={16} />} label="Role"    value={roleLabel} />
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>About NIVARAN</Text>
        <View style={styles.card}>
          <View style={styles.aboutHeader}>
            <Text style={styles.aboutChakra}>☸</Text>
            <View>
              <Text style={styles.aboutAppName}>NIVARAN</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutDesc}>
            NIVARAN is an AI-powered civic grievance redressal system that routes citizen complaints
            to the appropriate government department using Sentence-BERT semantic analysis. It ensures
            faster resolution and transparent tracking for every reported issue.
          </Text>
          <View style={styles.ministryRow}>
            <Info color="#6b7280" size={14} />
            <Text style={styles.ministryText}>Ministry of Housing and Urban Affairs, Govt. of India</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut color="#dc2626" size={18} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          © 2025 NIVARAN · Grievance Redressal Platform{'\n'}Built for citizens, powered by AI
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#f0fdf4' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },

  /* header */
  header: {
    backgroundColor: '#15803d',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 16 : 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chakra:      { fontSize: 28, color: '#bbf7d0' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff', letterSpacing: 0.3 },

  /* avatar section */
  avatarSection: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#f97316',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  avatarInitial: { fontSize: 34, fontWeight: '900', color: '#ffffff' },
  userName:  { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: { fontSize: 12, fontWeight: '700' },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, letterSpacing: 0.2 },

  /* stats */
  statsLoading: { height: 80, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47.5%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600' },

  /* card */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  /* info row */
  infoRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  infoIcon: { width: 32, alignItems: 'center' },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  divider:   { height: 1, backgroundColor: '#f0fdf4', marginLeft: 44 },

  /* about */
  aboutHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingBottom: 12 },
  aboutChakra:  { fontSize: 36, color: '#16a34a' },
  aboutAppName: { fontSize: 18, fontWeight: '800', color: '#15803d', letterSpacing: 1 },
  aboutVersion: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  aboutDesc: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0fdf4',
  },
  ministryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12 },
  ministryText: { fontSize: 11, color: '#6b7280', flex: 1, lineHeight: 16 },

  /* logout */
  logoutBtn: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: '#fff5f5',
  },
  logoutText: { color: '#dc2626', fontWeight: '800', fontSize: 15 },

  /* footer */
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 18,
    marginTop: 20,
  },
});