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
import { useFocusEffect, useRouter } from 'expo-router';
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
  Building2,
  MapPin,
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getOfficerComplaints } from '../../services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface OfficerStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDepartmentLabel(dept: string | undefined): string {
  if (!dept) return 'Not Assigned';
  return dept
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OfficerProfileScreen() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<OfficerStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch only complaints assigned to this officer
 const fetchStats = useCallback(async () => {
  setLoading(true);
  try {
    const res = await getOfficerComplaints();
    const mine = res.success ? (res.data ?? []) : [];

    setStats({
      total:      mine.length,
      pending:    mine.filter((c: any) => c.status === 'pending').length,
      inProgress: mine.filter((c: any) => c.status === 'in_progress' || c.status === 'in-progress').length,
      resolved:   mine.filter((c: any) => c.status === 'resolved').length,
    });
  } catch (e) {
    console.error('OfficerProfile fetchStats:', e);
  } finally {
    setLoading(false);
  }
}, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats]),
  );

  const handleLogout = useCallback(() => {
    signOutUser();
    router.replace('/login');
  }, [signOutUser, router]);

  // Derived display values — ALL from user object fetched from backend on login
  const initial       = (user?.displayName ?? user?.name ?? 'O').charAt(0).toUpperCase();
  const fullName      = user?.displayName ?? user?.name ?? 'Officer';
  const email         = user?.email ?? '—';
  const department    = getDepartmentLabel(user?.department);
  const jurisdiction  = user?.jurisdiction ?? user?.region ?? 'Not Assigned';
  const badgeNumber   = user?.badge_number ?? user?.badgeNumber ?? '—';

  const statCards = [
    {
      label: 'Total Assigned',
      value: stats.total,
      icon: <FileText color="#1E3A8A" size={18} />,
      bg: '#EFF6FF',
      text: '#1E3A8A',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: <Clock color="#b45309" size={18} />,
      bg: '#fef3c7',
      text: '#b45309',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: <Loader color="#1d4ed8" size={18} />,
      bg: '#dbeafe',
      text: '#1d4ed8',
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      icon: <CheckCircle color="#15803d" size={18} />,
      bg: '#dcfce7',
      text: '#15803d',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* ── Header (matches admin blue theme) ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSubtitle}>Field Officer Portal</Text>
            <Text style={styles.headerTitle}>My Profile</Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>ON DUTY</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Avatar + Name + Role ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userEmail}>{email}</Text>

          {/* Officer Badge */}
          <View style={styles.roleBadge}>
            <Shield color="#1E3A8A" size={13} />
            <Text style={styles.roleText}>Field Officer</Text>
          </View>

          {/* Department chip */}
          {user?.department ? (
            <View style={styles.deptChip}>
              <Building2 color="#0369a1" size={12} />
              <Text style={styles.deptChipText}>{department}</Text>
            </View>
          ) : null}
        </View>

        {/* ── My Cases Stats ── */}
        <Text style={styles.sectionLabel}>My Assigned Cases</Text>
        {loading ? (
          <View style={styles.statsLoading}>
            <ActivityIndicator color="#1E3A8A" />
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

        {/* ── Account Information (all from DB) ── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Account Information</Text>
        <View style={styles.card}>
          <InfoRow
            icon={<User color="#1E3A8A" size={16} />}
            label="Full Name"
            value={fullName}
          />
          <Divider />
          <InfoRow
            icon={<Mail color="#1E3A8A" size={16} />}
            label="Email"
            value={email}
          />
          <Divider />
          <InfoRow
            icon={<Shield color="#1E3A8A" size={16} />}
            label="Role"
            value="Field Officer"
          />
          <Divider />
          <InfoRow
            icon={<Building2 color="#1E3A8A" size={16} />}
            label="Department Assigned"
            value={department}
          />
          <Divider />
          <InfoRow
            icon={<MapPin color="#1E3A8A" size={16} />}
            label="Jurisdiction / Region"
            value={jurisdiction}
          />
          {badgeNumber !== '—' && (
            <>
              <Divider />
              <InfoRow
                icon={<Ionicons name="card-outline" size={16} color="#1E3A8A" />}
                label="Badge / Employee ID"
                value={badgeNumber}
              />
            </>
          )}
        </View>

        {/* ── Case Status Reference ── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Grievance Status Guide</Text>
        <View style={styles.card}>
          <StatusGuideRow
            color="#fef3c7"
            dotColor="#D97706"
            textColor="#b45309"
            label="Pending"
            desc="Complaint filed, awaiting action"
          />
          <Divider />
          <StatusGuideRow
            color="#dbeafe"
            dotColor="#1d4ed8"
            textColor="#1d4ed8"
            label="In Progress"
            desc="You are actively working on it"
          />
          <Divider />
          <StatusGuideRow
            color="#dcfce7"
            dotColor="#15803d"
            textColor="#15803d"
            label="Resolved"
            desc="Issue fixed and closed"
          />
        </View>

        {/* ── About NIVARAN ── */}
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
            NIVARAN is an AI-powered civic grievance redressal system that routes citizen
            complaints to the appropriate government department using Sentence-BERT semantic
            analysis. As a Field Officer, your timely action ensures faster resolution and
            transparent tracking for every reported issue.
          </Text>
          <View style={styles.ministryRow}>
            <Info color="#6b7280" size={14} />
            <Text style={styles.ministryText}>
              Ministry of Housing and Urban Affairs, Govt. of India
            </Text>
          </View>
        </View>

        {/* ── Logout ── */}
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

// ─── Sub-Components ───────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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

function StatusGuideRow({
  color,
  dotColor,
  textColor,
  label,
  desc,
}: {
  color: string;
  dotColor: string;
  textColor: string;
  label: string;
  desc: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
      <View style={[styles.statusBadgeInline, { backgroundColor: color }]}>
        <Text style={[styles.statusBadgeText, { color: textColor }]}>{label}</Text>
      </View>
      <Text style={styles.statusDesc}>{desc}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F8FAFC' },
  scroll:        { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },

  /* ── Header (admin blue, same pattern as admin dashboard) ── */
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 16 : 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },
  liveText: { color: '#fff', fontSize: 9, fontWeight: '900' },

  /* ── Avatar section ── */
  avatarSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  avatarInitial: { fontSize: 34, fontWeight: '900', color: '#ffffff' },
  userName:      { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 2 },
  userEmail:     { fontSize: 13, color: '#6b7280', marginBottom: 10 },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  roleText: { fontSize: 12, fontWeight: '700', color: '#1E3A8A' },

  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  deptChipText: { fontSize: 11, fontWeight: '700', color: '#0369a1' },

  /* ── Section label (same as admin) ── */
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* ── Stats ── */
  statsLoading: { height: 80, alignItems: 'center', justifyContent: 'center' },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47.5%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  /* ── Card ── */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  /* ── Info Row ── */
  infoRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  infoIcon:  { width: 32, alignItems: 'center' },
  infoText:  { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  divider:   { height: 1, backgroundColor: '#EFF6FF', marginLeft: 44 },

  /* ── Status Guide Row ── */
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusBadgeInline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  statusBadgeText: { fontSize: 10, fontWeight: '900' },
  statusDesc:      { flex: 1, fontSize: 12, color: '#64748B', fontWeight: '500' },

  /* ── About ── */
  aboutHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingBottom: 12 },
  aboutChakra:  { fontSize: 36, color: '#1E3A8A' },
  aboutAppName: { fontSize: 18, fontWeight: '800', color: '#1E3A8A', letterSpacing: 1 },
  aboutVersion: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  aboutDesc: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF6FF',
  },
  ministryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12 },
  ministryText: { fontSize: 11, color: '#6b7280', flex: 1, lineHeight: 16 },

  /* ── Logout ── */
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

  /* ── Footer ── */
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 18,
    marginTop: 20,
  },
});