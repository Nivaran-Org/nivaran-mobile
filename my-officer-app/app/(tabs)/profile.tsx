// app/(tabs)/profile.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useComplaints } from '../../contexts/ComplaintsContext';
import { router } from 'expo-router';
import {
  BadgeCheck,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Moon,
  Globe,
  MapPin,
  Building2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Star,
  Users,
  Phone,
  Mail,
  Award,
  Crown,
  UserCheck,
  Briefcase,
  Edit3,
  X,
  Save,
  Info,
  Calendar,
  Activity,
} from 'lucide-react-native';

// ── Types ────────────────────────────────────────────────────────
interface OfficerProfile {
  name: string;
  rank: string;
  badgeId: string;
  department: string;
  zone: string;
  phone: string;
  email: string;
  joiningDate: string;
  yearsOfService: number;
  bio: string;
}

// ── Status config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: { color: '#E65100', bg: '#FFF3E0', label: 'Pending', icon: Clock },
  'in-progress': { color: '#0D47A1', bg: '#E3F2FD', label: 'In Progress', icon: AlertCircle },
  resolved: { color: '#1B5E20', bg: '#E8F5E9', label: 'Resolved', icon: CheckCircle2 },
};

// ── Safe date coercion ───────────────────────────────────────────
// Complaints from context may store dates as strings (e.g. from JSON/Firestore).
// This helper always returns a valid Date object.
const toDate = (value: Date | string | number | undefined | null): Date => {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

// ── Mock Head Officer Data ───────────────────────────────────────
const HEAD_OFFICER = {
  name: 'Superintendent Rajinder Singh Bedi',
  rank: 'Superintendent of Police',
  badgeId: 'SP-0042',
  department: 'Punjab Civil Administration',
  zone: 'Jalandhar Central Zone',
  phone: '+91 98765 00042',
  email: 'sp.jalandhar@punjab.gov.in',
  yearsOfService: 22,
  awards: ['Gallantry Medal 2018', 'Best Officer 2021'],
  initials: 'RB',
};

// ── Mock Team Members ────────────────────────────────────────────
const TEAM_MEMBERS = [
  {
    id: 'T1',
    name: 'Inspector Harpreet Kaur',
    rank: 'Inspector',
    badgeId: 'INS-1101',
    department: 'Traffic & Roads',
    phone: '+91 98765 11011',
    email: 'h.kaur@punjab.gov.in',
    zone: 'Sector A',
    status: 'on-duty',
    resolvedCount: 34,
    initials: 'HK',
    color: '#0D47A1',
    bg: '#E3F2FD',
  },
  {
    id: 'T2',
    name: 'Sub-Inspector Gurjeet Singh',
    rank: 'Sub-Inspector',
    badgeId: 'SI-2204',
    department: 'Sanitation',
    phone: '+91 98765 22040',
    email: 'g.singh@punjab.gov.in',
    zone: 'Sector B',
    status: 'on-duty',
    resolvedCount: 28,
    initials: 'GS',
    color: '#1B5E20',
    bg: '#E8F5E9',
  },
  {
    id: 'T3',
    name: 'ASI Mandeep Sharma',
    rank: 'Assistant Sub-Inspector',
    badgeId: 'ASI-3310',
    department: 'Public Safety',
    phone: '+91 98765 33100',
    email: 'm.sharma@punjab.gov.in',
    zone: 'Sector C',
    status: 'off-duty',
    resolvedCount: 19,
    initials: 'MS',
    color: '#6A1B9A',
    bg: '#F3E5F5',
  },
  {
    id: 'T4',
    name: 'Constable Amritpal Dhillon',
    rank: 'Constable',
    badgeId: 'CON-4420',
    department: 'Water Supply',
    phone: '+91 98765 44200',
    email: 'a.dhillon@punjab.gov.in',
    zone: 'Sector D',
    status: 'on-duty',
    resolvedCount: 15,
    initials: 'AD',
    color: '#E65100',
    bg: '#FFF3E0',
  },
  {
    id: 'T5',
    name: 'Constable Simran Grewal',
    rank: 'Constable',
    badgeId: 'CON-4421',
    department: 'Electricity',
    phone: '+91 98765 44210',
    email: 's.grewal@punjab.gov.in',
    zone: 'Sector E',
    status: 'on-duty',
    resolvedCount: 22,
    initials: 'SG',
    color: '#F57C00',
    bg: '#FFF8E1',
  },
];

// ── Edit Profile Modal ───────────────────────────────────────────
function EditProfileModal({
  visible,
  profile,
  onSave,
  onClose,
}: {
  visible: boolean;
  profile: OfficerProfile;
  onSave: (p: OfficerProfile) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<OfficerProfile>(profile);

  const field = (label: string, key: keyof OfficerProfile, placeholder: string, multiline = false) => (
    <View style={modalStyles.fieldWrap} key={key}>
      <Text style={modalStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={[modalStyles.fieldInput, multiline && modalStyles.fieldInputMulti]}
        value={String(form[key])}
        onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
        placeholder={placeholder}
        placeholderTextColor="#B0BEC5"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={modalStyles.overlay}
      >
        <View style={modalStyles.sheet}>
          {/* Header */}
          <View style={modalStyles.sheetHeader}>
            <Text style={modalStyles.sheetTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <X size={20} color="#546E7A" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {field('Full Name', 'name', 'e.g. Harpreet Singh')}
            {field('Rank', 'rank', 'e.g. Inspector')}
            {field('Badge ID', 'badgeId', 'e.g. INS-1234')}
            {field('Department', 'department', 'e.g. Traffic & Roads')}
            {field('Zone / Area', 'zone', 'e.g. Sector A')}
            {field('Phone', 'phone', '+91 98765 00000')}
            {field('Email', 'email', 'officer@punjab.gov.in')}
            {field('Joining Date', 'joiningDate', 'e.g. 15 Aug 2010')}
            {field('Bio / Notes', 'bio', 'Short description...', true)}
          </ScrollView>

          <TouchableOpacity
            style={modalStyles.saveBtn}
            onPress={() => { onSave(form); onClose(); }}
            activeOpacity={0.85}
          >
            <Save size={16} color="#fff" />
            <Text style={modalStyles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Main Screen ──────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, signOutUser } = useAuth();
  const { complaints } = useComplaints();

  // ── UI State ──
  const [trackerExpanded, setTrackerExpanded] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [teamExpanded, setTeamExpanded] = useState(true);
  const [headExpanded, setHeadExpanded] = useState(true);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // ── Editable Officer Profile ──
  const [officerProfile, setOfficerProfile] = useState<OfficerProfile>({
    name: user?.displayName || 'Officer',
    rank: user?.rank || 'Inspector',
    badgeId: user?.badgeId || 'INS-0000',
    department: user?.department || 'General Administration',
    zone: user?.zone || 'Central Zone',
    phone: user?.phone || '+91 98765 00000',
    email: user?.email || 'officer@punjab.gov.in',
    joiningDate: user?.joiningDate || '01 Jan 2015',
    yearsOfService: user?.yearsOfService || 9,
    bio: user?.bio || 'Dedicated public servant committed to community safety and welfare.',
  });

  // ── Stats ──
  const counts = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    inProgress: complaints.filter((c) => c.status === 'in-progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  };
  const resolutionRate =
    counts.total > 0 ? Math.round((counts.resolved / counts.total) * 100) : 0;

  const initials = officerProfile.name
    ? officerProfile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'OF';

  const recentComplaints = [...complaints]
    .sort(
      (a, b) =>
        toDate(b.updatedAt ?? b.createdAt).getTime() -
        toDate(a.updatedAt ?? a.createdAt).getTime()
    )
    .slice(0, 4);

  // ── Logout ──
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          signOutUser();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Edit Profile Modal ── */}
      <EditProfileModal
        visible={editModalVisible}
        profile={officerProfile}
        onSave={(p) => setOfficerProfile(p)}
        onClose={() => setEditModalVisible(false)}
      />

      {/* ══════════════════════════════════════
          OFFICER PROFILE HEADER
      ══════════════════════════════════════ */}
      <View style={styles.profileHeader}>
        {/* Edit button */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setEditModalVisible(true)}
          activeOpacity={0.8}
        >
          <Edit3 size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>

        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <Text style={styles.displayName}>{officerProfile.name}</Text>
        <Text style={styles.rankText}>{officerProfile.rank}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            <BadgeCheck size={11} color="#FFD700" />
            <Text style={styles.badgePillText}>{officerProfile.badgeId}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Shield size={11} color="#1B5E20" />
            <Text style={styles.verifiedText}>Verified Officer</Text>
          </View>
        </View>

        <View style={styles.deptRow}>
          <View style={styles.deptChip}>
            <Building2 size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.deptChipText}>{officerProfile.department}</Text>
          </View>
        </View>
        <View style={styles.deptRow}>
          <View style={styles.deptChip}>
            <MapPin size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.deptChipText}>{officerProfile.zone}</Text>
          </View>
        </View>
      </View>

      {/* ══════════════════════════════════════
          OFFICER DETAILS CARD
      ══════════════════════════════════════ */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeaderRow}
          onPress={() => setDetailsExpanded(!detailsExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.sectionHeaderLeft}>
            <Info size={14} color="#0D47A1" />
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>OFFICER DETAILS</Text>
          </View>
          <View style={styles.sectionHeaderRight}>
            <TouchableOpacity
              style={styles.editIconBtn}
              onPress={() => setEditModalVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Edit3 size={13} color="#0D47A1" />
            </TouchableOpacity>
            {detailsExpanded ? <ChevronUp size={16} color="#90A4AE" /> : <ChevronDown size={16} color="#90A4AE" />}
          </View>
        </TouchableOpacity>

        {detailsExpanded && (
          <View style={styles.detailsCard}>
            {/* Bio */}
            {officerProfile.bio ? (
              <View style={styles.bioBox}>
                <Text style={styles.bioText}>{officerProfile.bio}</Text>
              </View>
            ) : null}

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Phone size={13} color="#0D47A1" />
                <View>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{officerProfile.phone}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Mail size={13} color="#6A1B9A" />
                <View>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{officerProfile.email}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Calendar size={13} color="#E65100" />
                <View>
                  <Text style={styles.detailLabel}>Joining Date</Text>
                  <Text style={styles.detailValue}>{officerProfile.joiningDate}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Briefcase size={13} color="#546E7A" />
                <View>
                  <Text style={styles.detailLabel}>Years of Service</Text>
                  <Text style={styles.detailValue}>{officerProfile.yearsOfService} years</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Activity size={13} color="#1B5E20" />
                <View>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={styles.onDutyBadge}>
                    <View style={styles.onDutyDot} />
                    <Text style={styles.onDutyText}>On Duty</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ══════════════════════════════════════
          PERFORMANCE STATS
      ══════════════════════════════════════ */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionLabel}>PERFORMANCE</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Assigned', count: counts.total, color: '#0A2342', bg: '#EEF2FF', Icon: ClipboardCheck },
            { label: 'Active', count: counts.inProgress, color: '#0D47A1', bg: '#E3F2FD', Icon: AlertCircle },
            { label: 'Resolved', count: counts.resolved, color: '#1B5E20', bg: '#E8F5E9', Icon: CheckCircle2 },
          ].map(({ label, count, color, bg, Icon }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: bg }]}>
              <Icon size={18} color={color} />
              <Text style={[styles.statCount, { color }]}>{count}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {counts.total > 0 && (
          <View style={styles.resolutionBar}>
            <View style={styles.resolutionBarTop}>
              <View style={styles.resolutionBarLeft}>
                <TrendingUp size={14} color="#1B5E20" />
                <Text style={styles.resolutionBarLabel}>Resolution Rate</Text>
              </View>
              <Text style={styles.resolutionBarPct}>{resolutionRate}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${resolutionRate}%` as any }]} />
            </View>
            <Text style={styles.resolutionBarSub}>
              {counts.resolved} of {counts.total} complaints resolved
            </Text>
          </View>
        )}
      </View>

      {/* ══════════════════════════════════════
          COMMANDING OFFICER
      ══════════════════════════════════════ */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeaderRow}
          onPress={() => setHeadExpanded(!headExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.sectionHeaderLeft}>
            <Crown size={14} color="#E65100" />
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>COMMANDING OFFICER</Text>
          </View>
          {headExpanded ? <ChevronUp size={16} color="#90A4AE" /> : <ChevronDown size={16} color="#90A4AE" />}
        </TouchableOpacity>

        {headExpanded && (
          <View style={styles.headOfficerCard}>
            <View style={styles.headOfficerTop}>
              <View style={styles.headAvatar}>
                <Text style={styles.headAvatarText}>{HEAD_OFFICER.initials}</Text>
              </View>
              <View style={styles.headOfficerInfo}>
                <Text style={styles.headOfficerName}>{HEAD_OFFICER.name}</Text>
                <Text style={styles.headOfficerRank}>{HEAD_OFFICER.rank}</Text>
                <View style={styles.headBadgePill}>
                  <BadgeCheck size={10} color="#FFD700" />
                  <Text style={styles.headBadgePillText}>{HEAD_OFFICER.badgeId}</Text>
                </View>
              </View>
            </View>

            <View style={styles.headDetailsGrid}>
              <View style={styles.headDetailItem}>
                <Building2 size={13} color="#0D47A1" />
                <View>
                  <Text style={styles.headDetailLabel}>Department</Text>
                  <Text style={styles.headDetailValue}>{HEAD_OFFICER.department}</Text>
                </View>
              </View>
              <View style={styles.headDetailItem}>
                <MapPin size={13} color="#E65100" />
                <View>
                  <Text style={styles.headDetailLabel}>Zone</Text>
                  <Text style={styles.headDetailValue}>{HEAD_OFFICER.zone}</Text>
                </View>
              </View>
              <View style={styles.headDetailItem}>
                <Phone size={13} color="#1B5E20" />
                <View>
                  <Text style={styles.headDetailLabel}>Phone</Text>
                  <Text style={styles.headDetailValue}>{HEAD_OFFICER.phone}</Text>
                </View>
              </View>
              <View style={styles.headDetailItem}>
                <Mail size={13} color="#6A1B9A" />
                <View>
                  <Text style={styles.headDetailLabel}>Email</Text>
                  <Text style={styles.headDetailValue} numberOfLines={1}>{HEAD_OFFICER.email}</Text>
                </View>
              </View>
              <View style={styles.headDetailItem}>
                <Briefcase size={13} color="#546E7A" />
                <View>
                  <Text style={styles.headDetailLabel}>Years of Service</Text>
                  <Text style={styles.headDetailValue}>{HEAD_OFFICER.yearsOfService} years</Text>
                </View>
              </View>
            </View>

            <View style={styles.awardsSection}>
              <Text style={styles.awardsSectionLabel}>AWARDS & RECOGNITION</Text>
              <View style={styles.awardsRow}>
                {HEAD_OFFICER.awards.map((award, i) => (
                  <View key={i} style={styles.awardChip}>
                    <Award size={11} color="#E65100" />
                    <Text style={styles.awardChipText}>{award}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ══════════════════════════════════════
          TEAM MEMBERS
      ══════════════════════════════════════ */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeaderRow}
          onPress={() => setTeamExpanded(!teamExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.sectionHeaderLeft}>
            <Users size={14} color="#0D47A1" />
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>TEAM MEMBERS</Text>
            <View style={styles.teamCountBadge}>
              <Text style={styles.teamCountText}>{TEAM_MEMBERS.length}</Text>
            </View>
          </View>
          {teamExpanded ? <ChevronUp size={16} color="#90A4AE" /> : <ChevronDown size={16} color="#90A4AE" />}
        </TouchableOpacity>

        {teamExpanded && (
          <View style={styles.teamList}>
            {TEAM_MEMBERS.map((member, i) => {
              const isExpanded = expandedMemberId === member.id;
              const isLast = i === TEAM_MEMBERS.length - 1;
              return (
                <View key={member.id}>
                  <TouchableOpacity
                    style={[styles.memberRow, !isLast && !isExpanded && styles.memberRowBorder]}
                    onPress={() => setExpandedMemberId(isExpanded ? null : member.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: member.bg }]}>
                      <Text style={[styles.memberAvatarText, { color: member.color }]}>
                        {member.initials}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                      <Text style={styles.memberRank}>{member.rank}</Text>
                      <View style={styles.memberMetaRow}>
                        <View style={[
                          styles.dutyBadge,
                          { backgroundColor: member.status === 'on-duty' ? '#E8F5E9' : '#F5F5F5' }
                        ]}>
                          <View style={[
                            styles.dutyDot,
                            { backgroundColor: member.status === 'on-duty' ? '#1B5E20' : '#B0BEC5' }
                          ]} />
                          <Text style={[
                            styles.dutyText,
                            { color: member.status === 'on-duty' ? '#1B5E20' : '#90A4AE' }
                          ]}>
                            {member.status === 'on-duty' ? 'On Duty' : 'Off Duty'}
                          </Text>
                        </View>
                        <Text style={styles.memberZone}>{member.zone}</Text>
                      </View>
                    </View>

                    <View style={styles.memberRight}>
                      <View style={styles.resolvedCountBadge}>
                        <CheckCircle2 size={10} color="#1B5E20" />
                        <Text style={styles.resolvedCountText}>{member.resolvedCount}</Text>
                      </View>
                      {isExpanded
                        ? <ChevronUp size={14} color="#90A4AE" />
                        : <ChevronDown size={14} color="#90A4AE" />}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.memberExpanded, !isLast && styles.memberRowBorder]}>
                      <View style={styles.memberExpandedGrid}>
                        <View style={styles.memberExpandedItem}>
                          <BadgeCheck size={12} color="#546E7A" />
                          <View>
                            <Text style={styles.memberExpandedLabel}>Badge ID</Text>
                            <Text style={styles.memberExpandedValue}>{member.badgeId}</Text>
                          </View>
                        </View>
                        <View style={styles.memberExpandedItem}>
                          <Building2 size={12} color="#546E7A" />
                          <View>
                            <Text style={styles.memberExpandedLabel}>Department</Text>
                            <Text style={styles.memberExpandedValue}>{member.department}</Text>
                          </View>
                        </View>
                        <View style={styles.memberExpandedItem}>
                          <Phone size={12} color="#0D47A1" />
                          <View>
                            <Text style={styles.memberExpandedLabel}>Phone</Text>
                            <Text style={styles.memberExpandedValue}>{member.phone}</Text>
                          </View>
                        </View>
                        <View style={styles.memberExpandedItem}>
                          <Mail size={12} color="#6A1B9A" />
                          <View>
                            <Text style={styles.memberExpandedLabel}>Email</Text>
                            <Text style={styles.memberExpandedValue} numberOfLines={1}>{member.email}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.memberStatRow}>
                        <View style={styles.memberStat}>
                          <Text style={[styles.memberStatCount, { color: '#1B5E20' }]}>{member.resolvedCount}</Text>
                          <Text style={styles.memberStatLabel}>Resolved</Text>
                        </View>
                        <View style={styles.memberStatDivider} />
                        <View style={styles.memberStat}>
                          <View style={[
                            styles.dutyBadgeLarge,
                            { backgroundColor: member.status === 'on-duty' ? '#E8F5E9' : '#F5F5F5' }
                          ]}>
                            <UserCheck size={14} color={member.status === 'on-duty' ? '#1B5E20' : '#90A4AE'} />
                            <Text style={[
                              styles.dutyBadgeLargeText,
                              { color: member.status === 'on-duty' ? '#1B5E20' : '#90A4AE' }
                            ]}>
                              {member.status === 'on-duty' ? 'Currently On Duty' : 'Currently Off Duty'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* ══════════════════════════════════════
          RECENT ACTIVITY TRACKER
      ══════════════════════════════════════ */}
      {recentComplaints.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeaderRow}
            onPress={() => setTrackerExpanded(!trackerExpanded)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>RECENT ACTIVITY</Text>
            {trackerExpanded ? <ChevronUp size={16} color="#90A4AE" /> : <ChevronDown size={16} color="#90A4AE" />}
          </TouchableOpacity>

          {trackerExpanded &&
            recentComplaints.map((c, i) => {
              const cfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.trackerItem,
                    i === recentComplaints.length - 1 && styles.trackerItemLast,
                  ]}
                  onPress={() => router.push('/(tabs)/home')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.trackerStatusDot, { backgroundColor: cfg.color }]} />
                  <View style={styles.trackerContent}>
                    <Text style={styles.trackerTitle} numberOfLines={1}>{c.title}</Text>
                    <View style={styles.trackerMeta}>
                      <View style={[styles.trackerBadge, { backgroundColor: cfg.bg }]}>
                        <Icon size={9} color={cfg.color} />
                        <Text style={[styles.trackerBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                      <Text style={styles.trackerCitizen}>{c.citizenName}</Text>
                      <Text style={styles.trackerDate}>
                        {toDate(c.updatedAt ?? c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={14} color="#CFD8DC" />
                </TouchableOpacity>
              );
            })}

          {complaints.length > 4 && (
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.viewAllText}>View all {complaints.length} complaints</Text>
              <ChevronRight size={14} color="#0D47A1" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ══════════════════════════════════════
          PREFERENCES
      ══════════════════════════════════════ */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeaderRow}
          onPress={() => setSettingsExpanded(!settingsExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.sectionHeaderLeft}>
            <Settings size={14} color="#546E7A" />
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>PREFERENCES</Text>
          </View>
          {settingsExpanded ? <ChevronUp size={16} color="#90A4AE" /> : <ChevronDown size={16} color="#90A4AE" />}
        </TouchableOpacity>

        {settingsExpanded && (
          <>
            <View style={styles.settingsItem}>
              <View style={styles.settingsLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Bell size={16} color="#0D47A1" />
                </View>
                <View>
                  <Text style={styles.settingsLabel}>Push Notifications</Text>
                  <Text style={styles.settingsSub}>New complaint alerts</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E0E0E0', true: '#BBDEFB' }}
                thumbColor={notificationsEnabled ? '#0D47A1' : '#B0BEC5'}
              />
            </View>

            <View style={[styles.settingsItem, styles.settingsItemBorder]}>
              <View style={styles.settingsLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Moon size={16} color="#6A1B9A" />
                </View>
                <View>
                  <Text style={styles.settingsLabel}>Dark Mode</Text>
                  <Text style={styles.settingsSub}>Change app appearance</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E0E0E0', true: '#CE93D8' }}
                thumbColor={darkMode ? '#6A1B9A' : '#B0BEC5'}
              />
            </View>

            <TouchableOpacity
              style={[styles.settingsItem, styles.settingsItemBorder]}
              onPress={() =>
                Alert.alert('Language', 'Choose your preferred language', [
                  { text: 'English', onPress: () => setLanguage('English') },
                  { text: 'हिन्दी', onPress: () => setLanguage('हिन्दी') },
                  { text: 'ਪੰਜਾਬੀ', onPress: () => setLanguage('ਪੰਜਾਬੀ') },
                  { text: 'Cancel', style: 'cancel' },
                ])
              }
              activeOpacity={0.8}
            >
              <View style={styles.settingsLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Globe size={16} color="#1B5E20" />
                </View>
                <View>
                  <Text style={styles.settingsLabel}>Language</Text>
                  <Text style={styles.settingsSub}>{language}</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#B0BEC5" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ══════════════════════════════════════
          MENU
      ══════════════════════════════════════ */}
      <View style={styles.section}>
        {[
          {
            Icon: Star,
            label: 'Rate the App',
            sub: 'Share your feedback',
            color: '#F57C00',
            bg: '#FFF3E0',
            onPress: () => Alert.alert('Thank you!', 'Rating feature coming soon.'),
          },
          {
            Icon: HelpCircle,
            label: 'Help & Support',
            sub: 'FAQs and helpdesk',
            color: '#0D47A1',
            bg: '#E3F2FD',
            onPress: () =>
              Alert.alert('Support', 'Helpline: 1800-XXX-XXXX\nEmail: support@nivaran.gov.in'),
          },
        ].map(({ Icon, label, sub, color, bg, onPress }, i) => (
          <TouchableOpacity
            key={label}
            style={[styles.menuItem, i > 0 && styles.menuItemBorder]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: bg }]}>
              <Icon size={18} color={color} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{label}</Text>
              <Text style={styles.menuSub}>{sub}</Text>
            </View>
            <ChevronRight size={16} color="#B0BEC5" />
          </TouchableOpacity>
        ))}
      </View>

      {/* ══════════════════════════════════════
          LOGOUT
      ══════════════════════════════════════ */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <LogOut size={18} color="#B71C1C" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>NIVARAN</Text>
        <Text style={styles.appVersion}>Version 1.0.0 · Government of India</Text>
      </View>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════
// STYLES  (single declaration — no duplicates)
// ══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  content: { paddingBottom: 48 },

  // ── Profile Header ──
  profileHeader: {
    backgroundColor: '#0A2342',
    paddingTop: 44,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    position: 'absolute',
    top: 44,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  editBtnText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderWidth: 3, borderColor: '#FFD700',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#FFD700', letterSpacing: 1 },
  displayName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  rankText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' },
  badgeRow: {
    flexDirection: 'row', gap: 8, marginTop: 4,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  badgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,215,0,0.18)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.35)',
  },
  badgePillText: { fontSize: 11, color: '#FFD700', fontWeight: '800', letterSpacing: 0.5 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  verifiedText: { fontSize: 11, color: '#1B5E20', fontWeight: '700', letterSpacing: 0.3 },
  deptRow: { marginTop: 2 },
  deptChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deptChipText: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },

  // ── Officer Details Card ──
  detailsCard: {
    backgroundColor: '#F8FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E0E8EF',
  },
  bioBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#0D47A1',
  },
  bioText: { fontSize: 13, color: '#37474F', lineHeight: 19, fontStyle: 'italic' },
  detailsGrid: { gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailLabel: { fontSize: 10, color: '#90A4AE', fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  detailValue: { fontSize: 13, color: '#1C2B3A', fontWeight: '600' },
  onDutyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onDutyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1B5E20' },
  onDutyText: { fontSize: 12, color: '#1B5E20', fontWeight: '700' },

  sectionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editIconBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 6,
  },

  // ── Stats ──
  statsSection: {
    backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 18, padding: 18,
    shadowColor: '#90A4AE', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: '#90A4AE',
    letterSpacing: 1.5, marginBottom: 14,
  },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6 },
  statCount: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#78909C', fontWeight: '700', letterSpacing: 0.5 },
  resolutionBar: { backgroundColor: '#F5F7FA', borderRadius: 12, padding: 14 },
  resolutionBarTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  resolutionBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resolutionBarLabel: { fontSize: 13, fontWeight: '600', color: '#37474F' },
  resolutionBarPct: { fontSize: 18, fontWeight: '800', color: '#1B5E20' },
  progressTrack: {
    height: 8, backgroundColor: '#E0E0E0', borderRadius: 4,
    overflow: 'hidden', marginBottom: 6,
  },
  progressFill: { height: '100%', backgroundColor: '#1B5E20', borderRadius: 4 },
  resolutionBarSub: { fontSize: 11, color: '#90A4AE' },

  // ── Section ──
  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 18, padding: 18,
    shadowColor: '#90A4AE', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // ── Head Officer ──
  headOfficerCard: {
    backgroundColor: '#F8FAFB', borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: '#E0E8EF',
  },
  headOfficerTop: { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  headAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#0A2342',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: '#FFD700',
  },
  headAvatarText: { fontSize: 20, fontWeight: '800', color: '#FFD700' },
  headOfficerInfo: { flex: 1 },
  headOfficerName: {
    fontSize: 15, fontWeight: '800', color: '#0A2342',
    lineHeight: 20, marginBottom: 2,
  },
  headOfficerRank: { fontSize: 12, color: '#546E7A', fontStyle: 'italic', marginBottom: 6 },
  headBadgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)',
    alignSelf: 'flex-start',
  },
  headBadgePillText: { fontSize: 10, color: '#E65100', fontWeight: '800', letterSpacing: 0.5 },
  headDetailsGrid: { gap: 10, marginBottom: 14 },
  headDetailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  headDetailLabel: {
    fontSize: 10, color: '#90A4AE', fontWeight: '700',
    letterSpacing: 0.5, marginBottom: 1,
  },
  headDetailValue: { fontSize: 13, color: '#1C2B3A', fontWeight: '600' },
  awardsSection: { borderTopWidth: 1, borderTopColor: '#E0E8EF', paddingTop: 12 },
  awardsSectionLabel: {
    fontSize: 9, fontWeight: '800', color: '#90A4AE',
    letterSpacing: 1.5, marginBottom: 8,
  },
  awardsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  awardChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFF3E0', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#FFCCBC',
  },
  awardChipText: { fontSize: 11, color: '#E65100', fontWeight: '600' },

  // ── Team ──
  teamCountBadge: {
    backgroundColor: '#0A2342', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2, marginLeft: 4,
  },
  teamCountText: { fontSize: 11, color: '#fff', fontWeight: '800' },
  teamList: {},
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  memberRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  memberAvatarText: { fontSize: 15, fontWeight: '800' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '700', color: '#1C2B3A', marginBottom: 2 },
  memberRank: { fontSize: 11, color: '#78909C', marginBottom: 4, fontStyle: 'italic' },
  memberMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dutyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  dutyDot: { width: 6, height: 6, borderRadius: 3 },
  dutyText: { fontSize: 10, fontWeight: '700' },
  memberZone: { fontSize: 10, color: '#90A4AE', fontWeight: '500' },
  memberRight: { alignItems: 'flex-end', gap: 6 },
  resolvedCountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  resolvedCountText: { fontSize: 11, color: '#1B5E20', fontWeight: '800' },
  memberExpanded: { paddingBottom: 14, paddingLeft: 56 },
  memberExpandedGrid: { gap: 8, marginBottom: 12 },
  memberExpandedItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  memberExpandedLabel: {
    fontSize: 9, color: '#90A4AE', fontWeight: '700',
    letterSpacing: 0.5, marginBottom: 1,
  },
  memberExpandedValue: { fontSize: 12, color: '#1C2B3A', fontWeight: '600' },
  memberStatRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  memberStat: { alignItems: 'center', gap: 2 },
  memberStatCount: { fontSize: 22, fontWeight: '800' },
  memberStatLabel: { fontSize: 10, color: '#78909C', fontWeight: '600', letterSpacing: 0.5 },
  memberStatDivider: { width: 1, height: 36, backgroundColor: '#E0E8EF' },
  dutyBadgeLarge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  dutyBadgeLargeText: { fontSize: 12, fontWeight: '700' },

  // ── Tracker ──
  trackerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F4F8',
  },
  trackerItemLast: { borderBottomWidth: 0, paddingBottom: 0 },
  trackerStatusDot: { width: 10, height: 10, borderRadius: 5 },
  trackerContent: { flex: 1 },
  trackerTitle: { fontSize: 14, fontWeight: '600', color: '#1C2B3A', marginBottom: 5 },
  trackerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  trackerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
  },
  trackerBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  trackerCitizen: { fontSize: 11, color: '#78909C', fontWeight: '500' },
  trackerDate: { fontSize: 11, color: '#B0BEC5' },
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F0F4F8',
  },
  viewAllText: { fontSize: 13, color: '#0D47A1', fontWeight: '700' },

  // ── Settings ──
  settingsItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
  },
  settingsItemBorder: { borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingsLabel: { fontSize: 14, fontWeight: '600', color: '#1C2B3A' },
  settingsSub: { fontSize: 11, color: '#90A4AE', marginTop: 2 },

  // ── Menu ──
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  menuItemBorder: { borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#1C2B3A' },
  menuSub: { fontSize: 12, color: '#90A4AE', marginTop: 2 },

  // ── Logout ──
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: '#FFEBEE', borderRadius: 14, height: 52,
    borderWidth: 1.5, borderColor: '#FFCDD2',
  },
  logoutText: { fontSize: 15, color: '#B71C1C', fontWeight: '700' },

  // ── App Info ──
  appInfo: { alignItems: 'center', marginTop: 32, gap: 4 },
  appName: { fontSize: 15, fontWeight: '800', color: '#90A4AE', letterSpacing: 4 },
  appVersion: { fontSize: 11, color: '#B0BEC5' },
});

// ── Modal Styles ─────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#0A2342' },
  closeBtn: {
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    padding: 8,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: '#78909C',
    letterSpacing: 0.5, marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: '#F8FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E8EF',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1C2B3A',
    fontWeight: '500',
  },
  fieldInputMulti: { height: 80, textAlignVertical: 'top' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0A2342',
    borderRadius: 14,
    height: 52,
    marginTop: 8,
  },
  saveBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});