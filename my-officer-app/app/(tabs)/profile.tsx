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
        onPress: async () => {
          await signOutUser();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.displayName || 'Citizen'}</Text>
        <Text style={styles.phone}>{user?.phoneNumber || 'No phone number'}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>My Complaints</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Help & Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  phone: {
    fontSize: 16,
    color: '#666',
  },
  menu: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
  },
  logoutText: {
    color: '#FF3B30',
  },
});