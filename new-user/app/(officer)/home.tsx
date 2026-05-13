// app/(officer)/home.tsx  —  NIVARAN Officer Dashboard
// All data fetched from the real backend via getComplaints() / updateComplaintStatus()
// Design mirrors admin portal colour tokens + animated helpers

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Easing,
  UIManager,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Hash,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getOfficerComplaints, updateComplaintStatus as apiUpdateStatus } from '../../services/api';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── COLOUR SYSTEM ────────────────────────────────────────────────────────────
const C = {
  bg:          '#F8FAFC',
  surface:     '#FFFFFF',
  card:        '#FFFFFF',
  cardBorder:  '#E2E8F0',
  primary:     '#1E3A8A',
  primaryMid:  '#3B82F6',
  accent:      '#22C55E',
  danger:      '#EF4444',
  warning:     '#F59E0B',
  textHigh:    '#1E293B',
  textMid:     '#64748B',
  textLow:     '#94A3B8',
};

// ─── SAFE EASING ─────────────────────────────────────────────────────────────
const EASE_OUT_QUAD    = Easing.bezier(0, 0, 0.2, 1);
const EASE_IN_OUT_SINE = Easing.bezier(0.45, 0, 0.55, 1);

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  pending:     { color: C.warning,    bg: '#FFFBEB', label: 'PENDING',     icon: Clock        },
  in_progress: { color: C.primaryMid, bg: '#EFF6FF', label: 'IN PROGRESS', icon: AlertCircle  },
  resolved:    { color: C.accent,     bg: '#F0FDF4', label: 'RESOLVED',    icon: CheckCircle2 },
  rejected:    { color: C.danger,     bg: '#FEF2F2', label: 'REJECTED',    icon: X            },
};

// backend uses in_progress; normalise any in-progress variant
function normaliseStatus(s: string) {
  if (!s) return 'pending';
  return s.replace('-', '_').toLowerCase();
}

const FILTER_TABS = [
  { key: 'all',         label: 'All'         },
  { key: 'pending',     label: 'Pending'     },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved',    label: 'Resolved'    },
];

const HOME_VIEWS = [
  { key: 'overview',  label: 'Overview'  },
  { key: 'pending',   label: 'Pending'   },
  { key: 'all-cases', label: 'All Cases' },
] as const;
type HomeView = typeof HOME_VIEWS[number]['key'];

const TIMELINE_STEPS = [
  { key: 'pending',     label: 'Submitted',  sub: 'Complaint registered' },
  { key: 'in_progress', label: 'In Progress', sub: 'Assigned to dept'   },
  { key: 'resolved',    label: 'Resolved',    sub: 'Issue fixed'         },
];

// ─── ANIMATED HELPERS ─────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 380, delay, useNativeDriver: true, easing: EASE_OUT_QUAD }),
      Animated.timing(translateY, { toValue: 0, duration: 380, delay, useNativeDriver: true, easing: EASE_OUT_QUAD }),
    ]).start();
  }, []);
  const flat = StyleSheet.flatten(style) ?? {};
  return <Animated.View style={{ ...flat, opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function PulseOrb({ color, size }: { color: string; size: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 2000, useNativeDriver: true, easing: EASE_IN_OUT_SINE }),
        Animated.timing(scale, { toValue: 1,   duration: 2000, useNativeDriver: true, easing: EASE_IN_OUT_SINE }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity: 0.12,
      position: 'absolute', transform: [{ scale }],
    }} />
  );
}

function ScalePress({ children, onPress, style }: { children: React.ReactNode; onPress: () => void; style?: any }) {
  const scale = useRef(new Animated.Value(1)).current;
  const flat  = StyleSheet.flatten(style) ?? {};
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1,   useNativeDriver: true, speed: 20 }).start()}
    >
      <Animated.View style={{ ...flat, transform: [{ scale }] }}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

function SectionLabel({ label, sub }: { label: string; sub: string }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionAccent} />
      <View>
        <Text style={styles.sectionHindi}>{label}</Text>
        <Text style={styles.sectionSub}>{sub}</Text>
      </View>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useAuth();

  const [complaints,        setComplaints]        = useState<any[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [refreshing,        setRefreshing]        = useState(false);
  const [viewMode,          setViewMode]          = useState<HomeView>('overview');
  const [activeFilter,      setActiveFilter]      = useState('all');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [modalVisible,      setModalVisible]      = useState(false);
  const [officerNote,       setOfficerNote]       = useState('');
  const [updating,          setUpdating]          = useState(false);

  const slideAnim    = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // ── Fetch complaints assigned to this officer ─────────────────────────────
  const fetchComplaints = useCallback(async (silent = false) => {
  if (!silent) setLoading(true);
  try {
    const res = await getOfficerComplaints();  // ← new function
    const all: any[] = res.success ? (res.data ?? []) : [];
    setComplaints(all.map((c: any) => ({ ...c, status: normaliseStatus(c.status) })));
  } catch (e) {
    console.error('HomeScreen fetchComplaints:', e);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [user]);

  // Refresh on every tab focus
  useFocusEffect(
    useCallback(() => { fetchComplaints(); }, [fetchComplaints])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints(true);
  };

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = {
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved:   complaints.filter(c => c.status === 'resolved').length,
  };
  const resolutionRate = counts.total > 0 ? Math.round((counts.resolved / counts.total) * 100) : 0;

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = complaints
    .filter(c => {
      if (viewMode === 'pending')   return c.status === 'pending';
      if (viewMode === 'all-cases') return true;
      return activeFilter === 'all' || c.status === activeFilter;
    })
    .filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (c.title        ?? '').toLowerCase().includes(q) ||
        (c.id?.toString() ?? '').toLowerCase().includes(q) ||
        (c.description  ?? '').toLowerCase().includes(q) ||
        (c.citizen_name ?? c.citizenName ?? '').toLowerCase().includes(q)
      );
    });

  // ── Sheet open / close ────────────────────────────────────────────────────
  const openDetail = (item: any) => {
    setSelectedComplaint(item);
    setOfficerNote(item.officer_note ?? item.officerNote ?? '');
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim,    { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeDetail = () => {
    Animated.parallel([
      Animated.timing(slideAnim,    { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0,             duration: 300, useNativeDriver: true }),
    ]).start(() => { setModalVisible(false); setSelectedComplaint(null); setOfficerNote(''); });
  };

  // ── Status update via real API ────────────────────────────────────────────
  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      const res = await apiUpdateStatus(selectedComplaint.id, newStatus);
      if (res.success) {
        Alert.alert('✅ Updated', `Case #${selectedComplaint.id} → ${newStatus.replace('_', ' ').toUpperCase()}.`,
          [{ text: 'OK', onPress: () => { closeDetail(); fetchComplaints(true); } }]
        );
      } else {
        Alert.alert('Error', res.message ?? 'Failed to update status.');
      }
    } catch (e) {
      console.error('handleStatusUpdate:', e);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setUpdating(false);
    }
  };

  const getTimelineStepIndex = (status: string) => {
    if (status === 'pending')     return 0;
    if (status === 'in_progress') return 1;
    return 2;
  };

  // ── Summary cards ─────────────────────────────────────────────────────────
  const summaryCards = [
    { label: 'Total Cases', hindi: 'कुल शिकायतें', count: counts.total,      icon: 'clipboard-outline',       color: C.primary,    onPress: () => { setViewMode('all-cases'); setActiveFilter('all'); } },
    { label: 'Pending',     hindi: 'लंबित',         count: counts.pending,    icon: 'time-outline',            color: C.warning,    onPress: () => { setViewMode('pending');   setActiveFilter('pending'); } },
    { label: 'In Progress', hindi: 'जारी',          count: counts.inProgress, icon: 'sync-outline',            color: C.primaryMid, onPress: () => { setViewMode('overview');  setActiveFilter('in_progress'); } },
    { label: 'Resolved',    hindi: 'पूर्ण',          count: counts.resolved,   icon: 'checkmark-done-circle',   color: C.accent,     onPress: () => { setViewMode('overview');  setActiveFilter('resolved'); } },
  ];

  // ── Card renderer ─────────────────────────────────────────────────────────
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const cfg        = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;
    const citizenName = item.citizen_name ?? item.citizenName ?? 'Citizen';
    const createdAt   = item.created_at   ?? item.createdAt  ?? new Date().toISOString();

    return (
      <FadeIn delay={index * 45} style={styles.cardWrap}>
        <ScalePress onPress={() => openDetail(item)} style={styles.card}>
          <View style={[styles.cardAccentBar, { backgroundColor: cfg.color }]} />
          <View style={styles.cardInner}>
            <View style={styles.cardTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title ?? 'Untitled'}</Text>
                <View style={styles.uidRow}>
                  <Hash size={9} color={C.textLow} />
                  <Text style={styles.cardUID}>{item.id}</Text>
                </View>
              </View>
              <StatusChip label={cfg.label} color={cfg.color} />
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.cardFooter}>
              <View style={styles.metaChip}>
                <Ionicons name="person-outline" size={10} color={C.textMid} />
                <Text style={styles.metaChipText} numberOfLines={1}>{citizenName}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="business-outline" size={10} color={C.textMid} />
                <Text style={styles.metaChipText} numberOfLines={1}>{item.department ?? 'General'}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="calendar-outline" size={10} color={C.textLow} />
                <Text style={styles.metaChipText}>
                  {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <ChevronRight size={14} color={C.textLow} style={{ marginLeft: 'auto' }} />
            </View>
          </View>
        </ScalePress>
      </FadeIn>
    );
  };

  // ── List header ───────────────────────────────────────────────────────────
  const ListHeader = (
    <View>
      {/* Search */}
      <FadeIn delay={0}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={C.textLow} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, title, citizen name..."
            placeholderTextColor={C.textLow}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={C.textLow} />
            </TouchableOpacity>
          )}
        </View>
      </FadeIn>

      {/* Summary grid */}
      <FadeIn delay={60}><SectionLabel label="डैशबोर्ड सारांश" sub="OFFICER DASHBOARD" /></FadeIn>
      <View style={styles.grid}>
        {summaryCards.map((card, i) => (
          <FadeIn key={card.label} delay={80 + i * 55} style={styles.gridItem}>
            <ScalePress onPress={card.onPress} style={styles.summaryCardWrap}>
              <LinearGradient colors={[card.color + '18', card.color + '06']} style={styles.summaryCard}>
                <View style={[styles.summaryIconWrap, { backgroundColor: card.color + '22', borderColor: card.color + '44' }]}>
                  <Ionicons name={card.icon as any} size={22} color={card.color} />
                </View>
                <Text style={[styles.summaryCount, { color: card.color }]}>{card.count}</Text>
                <Text style={styles.summaryLabel}>{card.label}</Text>
                <Text style={styles.summaryHindi}>{card.hindi}</Text>
                <View style={[styles.summaryBar, { backgroundColor: card.color }]} />
              </LinearGradient>
            </ScalePress>
          </FadeIn>
        ))}
      </View>

      {/* Resolution progress */}
      {counts.total > 0 && (
        <FadeIn delay={320}>
          <View style={styles.resolutionBox}>
            <View style={styles.resolutionTop}>
              <View style={styles.resolutionLeft}>
                <Ionicons name="trending-up" size={16} color={C.accent} />
                <Text style={styles.resolutionLabel}>Resolution Rate</Text>
              </View>
              <Text style={[styles.resolutionPct, { color: resolutionRate > 60 ? C.accent : C.warning }]}>
                {resolutionRate}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${resolutionRate}%` as any,
                backgroundColor: resolutionRate > 60 ? C.accent : C.warning,
              }]} />
            </View>
            <Text style={styles.resolutionSub}>{counts.resolved} of {counts.total} complaints resolved</Text>
          </View>
        </FadeIn>
      )}

      {/* Filter tabs */}
      <FadeIn delay={380}><SectionLabel label="शिकायत सूची" sub="COMPLAINTS LIST" /></FadeIn>
      {viewMode === 'overview' && (
        <FadeIn delay={400}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
            {FILTER_TABS.map(tab => {
              const isActive = activeFilter === tab.key;
              const tabCount = tab.key === 'all' ? counts.total : tab.key === 'pending' ? counts.pending : tab.key === 'in_progress' ? counts.inProgress : counts.resolved;
              return (
                <TouchableOpacity key={tab.key} style={[styles.filterTab, isActive && styles.filterTabActive]} onPress={() => setActiveFilter(tab.key)} activeOpacity={0.8}>
                  {isActive && <Ionicons name="funnel" size={10} color="#fff" />}
                  <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>{tab.label}</Text>
                  <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                    <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>{tabCount}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </FadeIn>
      )}

      {filtered.length > 0 && (
        <FadeIn delay={440}>
          <Text style={styles.listMeta}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </Text>
        </FadeIn>
      )}
    </View>
  );

  // ── Root ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ marginTop: 12, color: C.textMid, fontWeight: '600' }}>Loading your cases...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.orbTopRight}><PulseOrb color={C.primaryMid} size={180} /></View>
        <View style={styles.orbBottomLeft}><PulseOrb color={C.accent} size={130} /></View>

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: C.accent }]} />
              <Text style={styles.liveBadgeText}>LIVE  ·  NIVARAN  ·  निवारण</Text>
            </View>
            <Text style={styles.headerGreeting}>
              {(user?.displayName ?? user?.name ?? 'Officer').split(' ')[0]} 👮
            </Text>
            <Text style={styles.headerSub}>
              {user?.department ? `${user.department}  ·  ` : ''}
              {user?.jurisdiction ?? user?.region ?? user?.zone ?? 'Field Officer'}
            </Text>
          </View>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push('/(officer)/profile')}>
            <Ionicons name="person-outline" size={20} color="#93C5FD" />
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{counts.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.warning }]}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.primaryMid }]}>{counts.inProgress}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.accent }]}>{counts.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* ── View mode tabs ── */}
      <View style={styles.homeModeRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.homeModeRowContent}>
          {HOME_VIEWS.map(mode => {
            const isActive = viewMode === mode.key;
            return (
              <TouchableOpacity key={mode.key} style={[styles.viewModeTab, isActive && styles.viewModeTabActive]} onPress={() => setViewMode(mode.key)} activeOpacity={0.85}>
                <Text style={[styles.viewModeLabel, isActive && styles.viewModeLabelActive]}>{mode.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── FlatList ── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id?.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} tintColor={C.primary} />}
        ListEmptyComponent={
          <FadeIn delay={100}>
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="clipboard-outline" size={40} color={C.textLow} />
              </View>
              <Text style={styles.emptyTitle}>No complaints found</Text>
              <Text style={styles.emptySub}>
                {searchQuery ? 'No results match your search.' : 'No cases are currently assigned to you.'}
              </Text>
            </View>
          </FadeIn>
        }
      />

      {/* ── Complaint detail bottom sheet ── */}
      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeDetail}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={closeDetail} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {selectedComplaint && (() => {
            const cfg        = STATUS_CONFIG[selectedComplaint.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const stepIdx    = getTimelineStepIndex(selectedComplaint.status);
            const citizenName = selectedComplaint.citizen_name ?? selectedComplaint.citizenName ?? 'Citizen';
            const citizenPhone = selectedComplaint.citizen_phone ?? selectedComplaint.citizenPhone ?? '—';
            const createdAt   = selectedComplaint.created_at ?? selectedComplaint.createdAt;
            const updatedAt   = selectedComplaint.updated_at ?? selectedComplaint.updatedAt;

            return (
              <>
                <View style={styles.sheetHandle} />
                {/* Sheet header */}
                <View style={styles.sheetHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetTitle} numberOfLines={2}>{selectedComplaint.title}</Text>
                    <View style={styles.sheetUIDPill}>
                      <Hash size={11} color={C.primaryMid} />
                      <Text style={styles.sheetUIDText}>#{selectedComplaint.id}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={closeDetail} style={styles.closeBtn}>
                    <X size={18} color={C.textMid} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

                  {/* Status badge */}
                  <View style={styles.sheetBadgeRow}>
                    <View style={[styles.sheetStatusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                      <StatusIcon size={13} color={cfg.color} />
                      <Text style={[styles.sheetStatusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    {selectedComplaint.department && (
                      <View style={styles.deptBadge}>
                        <Ionicons name="business-outline" size={12} color={C.primaryMid} />
                        <Text style={styles.deptBadgeText}>{selectedComplaint.department}</Text>
                      </View>
                    )}
                  </View>

                  {/* Citizen info */}
                  <Text style={styles.sectionMicro}>CITIZEN DETAILS</Text>
                  <View style={styles.citizenBox}>
                    <View style={styles.citizenRow}>
                      <View style={styles.citizenIconWrap}>
                        <Ionicons name="person-outline" size={14} color={C.primaryMid} />
                      </View>
                      <Text style={styles.citizenDetail}>{citizenName}</Text>
                    </View>
                    {citizenPhone !== '—' && (
                      <View style={styles.citizenRow}>
                        <View style={styles.citizenIconWrap}>
                          <Ionicons name="call-outline" size={14} color={C.primaryMid} />
                        </View>
                        <Text style={styles.citizenDetail}>{citizenPhone}</Text>
                      </View>
                    )}
                  </View>

                  {/* Timeline */}
                  <Text style={[styles.sectionMicro, { marginTop: 18 }]}>STATUS TIMELINE</Text>
                  <View style={styles.timeline}>
                    {TIMELINE_STEPS.map((step, i) => {
                      const done   = i <= stepIdx;
                      const active = i === stepIdx;
                      return (
                        <View key={step.key} style={styles.timelineStep}>
                          <View style={styles.timelineLeft}>
                            <View style={[styles.timelineDot, done && { backgroundColor: active ? cfg.color : C.accent, borderColor: active ? cfg.color : C.accent }]}>
                              {done && <View style={styles.timelineDotInner} />}
                            </View>
                            {i < TIMELINE_STEPS.length - 1 && (
                              <View style={[styles.timelineLine, i < stepIdx && { backgroundColor: C.accent }]} />
                            )}
                          </View>
                          <View style={styles.timelineContent}>
                            <Text style={[styles.timelineLabel, done && { color: C.textHigh, fontWeight: '700' }]}>{step.label}</Text>
                            <Text style={styles.timelineSub}>{step.sub}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Description */}
                  <Text style={[styles.sectionMicro, { marginTop: 4 }]}>DESCRIPTION</Text>
                  <View style={styles.descBox}>
                    <Text style={styles.descText}>{selectedComplaint.description}</Text>
                  </View>

                  {/* AI routing */}
                  {!!(selectedComplaint.ai_routing ?? selectedComplaint.aiRouting) && (
                    <>
                      <Text style={[styles.sectionMicro, { marginTop: 14 }]}>AI ROUTING</Text>
                      <View style={styles.aiBox}>
                        <Ionicons name="hardware-chip-outline" size={16} color={C.primaryMid} />
                        <Text style={styles.aiText}>{selectedComplaint.ai_routing ?? selectedComplaint.aiRouting}</Text>
                      </View>
                    </>
                  )}

                  {/* Location */}
                  {!!(selectedComplaint.location ?? selectedComplaint.address) && (
                    <>
                      <Text style={[styles.sectionMicro, { marginTop: 14 }]}>LOCATION</Text>
                      <View style={styles.locationBox}>
                        <Ionicons name="location-outline" size={14} color={C.warning} />
                        <Text style={styles.locationText}>
                          {selectedComplaint.address ?? selectedComplaint.location?.address ?? JSON.stringify(selectedComplaint.location)}
                        </Text>
                      </View>
                    </>
                  )}

                  {/* Dates */}
                  <View style={styles.datesRow}>
                    {createdAt && (
                      <View style={styles.dateItem}>
                        <Ionicons name="calendar-outline" size={12} color={C.textLow} />
                        <Text style={styles.dateLabel}>Submitted</Text>
                        <Text style={styles.dateValue}>{new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                      </View>
                    )}
                    {updatedAt && (
                      <View style={styles.dateItem}>
                        <Ionicons name="refresh-outline" size={12} color={C.primaryMid} />
                        <Text style={[styles.dateLabel, { color: C.primaryMid }]}>Updated</Text>
                        <Text style={[styles.dateValue, { color: C.primaryMid }]}>{new Date(updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                      </View>
                    )}
                  </View>

                  {/* Existing officer note */}
                  {!!(selectedComplaint.officer_note ?? selectedComplaint.officerNote) && (
                    <>
                      <Text style={[styles.sectionMicro, { marginTop: 14 }]}>OFFICER NOTE</Text>
                      <View style={styles.noteReadBox}>
                        <Ionicons name="chatbox-ellipses-outline" size={13} color={C.primaryMid} />
                        <Text style={styles.noteReadText}>{selectedComplaint.officer_note ?? selectedComplaint.officerNote}</Text>
                      </View>
                    </>
                  )}

                  {/* Add note input */}
                  <Text style={[styles.sectionMicro, { marginTop: 18 }]}>ADD QUICK NOTE</Text>
                  <View style={styles.noteInputWrap}>
                    <Ionicons name="create-outline" size={14} color={C.textMid} style={{ marginTop: 2 }} />
                    <TextInput
                      style={styles.noteInput}
                      placeholder="Add an action note for this complaint..."
                      placeholderTextColor={C.textLow}
                      value={officerNote}
                      onChangeText={setOfficerNote}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Quick status buttons */}
                  <Text style={[styles.sectionMicro, { marginTop: 18, marginBottom: 10 }]}>QUICK STATUS UPDATE</Text>
                  <View style={styles.actionRow}>
                    {selectedComplaint.status !== 'in_progress' && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.primaryMid }]} onPress={() => handleStatusUpdate('in_progress')} disabled={updating} activeOpacity={0.85}>
                        {updating ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name="sync-outline" size={16} color="#fff" /><Text style={styles.actionBtnText}>Mark In Progress</Text></>}
                      </TouchableOpacity>
                    )}
                    {selectedComplaint.status !== 'resolved' && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.accent }]} onPress={() => handleStatusUpdate('resolved')} disabled={updating} activeOpacity={0.85}>
                        {updating ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name="checkmark-done-outline" size={16} color="#fff" /><Text style={styles.actionBtnText}>Mark Resolved</Text></>}
                      </TouchableOpacity>
                    )}
                    {selectedComplaint.status !== 'pending' && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.warning }]} onPress={() => handleStatusUpdate('pending')} disabled={updating} activeOpacity={0.85}>
                        {updating ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name="time-outline" size={16} color="#fff" /><Text style={styles.actionBtnText}>Revert to Pending</Text></>}
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              </>
            );
          })()}
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 24, paddingTop: 14, paddingBottom: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    overflow: 'hidden', elevation: 12,
    shadowColor: C.primary, shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
  },
  orbTopRight:   { position: 'absolute', top: -24,  right: -24, overflow: 'hidden', width: 180, height: 180, borderRadius: 90  },
  orbBottomLeft: { position: 'absolute', bottom: -32, left: 40, overflow: 'hidden', width: 130, height: 130, borderRadius: 65  },

  headerRow:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  liveBadge:      { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  liveDot:        { width: 7, height: 7, borderRadius: 3.5, marginRight: 7 },
  liveBadgeText:  { fontSize: 10, fontWeight: '800', color: '#93C5FD', letterSpacing: 1.5 },
  headerGreeting: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3 },
  headerSub:      { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontWeight: '600' },
  headerIconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(147,197,253,0.4)',
    justifyContent: 'center', alignItems: 'center', marginTop: 4,
  },

  statStrip: {
    flexDirection: 'row', marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statLabel:   { fontSize: 10, color: '#93C5FD', marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.20)' },

  homeModeRow:        { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.bg },
  homeModeRowContent: { gap: 10 },
  viewModeTab:        { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder },
  viewModeTabActive:  { backgroundColor: C.primary, borderColor: C.primary },
  viewModeLabel:      { fontSize: 13, fontWeight: '700', color: C.textMid },
  viewModeLabelActive:{ color: '#fff' },

  listContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, padding: 14,
    borderRadius: 18, marginBottom: 22,
    borderWidth: 1, borderColor: C.cardBorder, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 13, color: C.textHigh },

  sectionRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionAccent: { width: 4, height: 32, backgroundColor: C.primaryMid, borderRadius: 2, marginRight: 10 },
  sectionHindi:  { fontSize: 14, fontWeight: '900', color: C.textHigh },
  sectionSub:    { fontSize: 10, fontWeight: '800', color: C.textLow, letterSpacing: 1.2, marginTop: 1 },

  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  gridItem: { width: '48%' },
  summaryCardWrap: { borderRadius: 20, overflow: 'hidden' },
  summaryCard: {
    borderRadius: 20, padding: 16, alignItems: 'center',
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: C.cardBorder, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  summaryIconWrap: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  summaryCount:    { fontSize: 30, fontWeight: '900', color: C.textHigh },
  summaryLabel:    { fontSize: 13, fontWeight: '800', color: C.textHigh, marginTop: 2 },
  summaryHindi:    { fontSize: 11, fontWeight: '600', color: C.textLow, marginTop: 2 },
  summaryBar:      { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: 2 },

  resolutionBox: {
    backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 22,
    borderWidth: 1, borderColor: C.cardBorder, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  resolutionTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  resolutionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resolutionLabel:{ fontSize: 13, fontWeight: '700', color: C.textHigh },
  resolutionPct:  { fontSize: 20, fontWeight: '900' },
  progressTrack:  { height: 8, backgroundColor: C.cardBorder, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill:   { height: '100%', borderRadius: 4 },
  resolutionSub:  { fontSize: 11, color: C.textLow },

  filterScroll: { marginBottom: 16 },
  filterRow:    { gap: 8, paddingRight: 8 },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.card, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1.5, borderColor: C.cardBorder,
  },
  filterTabActive:       { backgroundColor: C.primary, borderColor: C.primary },
  filterTabText:         { fontSize: 13, color: C.textMid, fontWeight: '600' },
  filterTabTextActive:   { color: '#fff' },
  filterCount:           { backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  filterCountActive:     { backgroundColor: 'rgba(255,255,255,0.2)' },
  filterCountText:       { fontSize: 11, color: C.textMid, fontWeight: '700' },
  filterCountTextActive: { color: '#fff' },
  listMeta:              { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 12 },

  cardWrap: { marginBottom: 12 },
  card: {
    backgroundColor: C.card, borderRadius: 18,
    borderWidth: 1, borderColor: C.cardBorder, overflow: 'hidden', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  cardAccentBar: { height: 4, width: '100%' },
  cardInner:     { padding: 16 },
  cardTitleRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  cardTitle:     { fontSize: 15, fontWeight: '800', color: C.textHigh, flex: 1 },
  uidRow:        { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  cardUID:       { fontSize: 10, color: C.textLow, fontWeight: '600', letterSpacing: 0.5 },
  cardDesc:      { fontSize: 13, color: C.textMid, lineHeight: 19, marginBottom: 12 },
  cardFooter:    { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },

  chip:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  chipDot:  { width: 5, height: 5, borderRadius: 2.5, marginRight: 5 },
  chipText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  metaChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  metaChipText: { fontSize: 11, color: C.textMid, fontWeight: '600', maxWidth: 90 },

  empty:         { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIconWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: C.textLow },
  emptySub:      { fontSize: 13, color: C.textLow, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },

  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.93,
    paddingHorizontal: 20, paddingBottom: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 24,
  },
  sheetHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  sheetHeader:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  sheetTitle:   { fontSize: 17, fontWeight: '800', color: C.textHigh, lineHeight: 24, marginBottom: 6 },
  sheetUIDPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  sheetUIDText: { fontSize: 11, color: C.primaryMid, fontWeight: '800', letterSpacing: 0.8 },
  closeBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  sheetBadgeRow:    { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  sheetStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  sheetStatusText:  { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  deptBadge:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, backgroundColor: '#EFF6FF', borderColor: C.primaryMid + '44' },
  deptBadgeText:    { fontSize: 12, fontWeight: '700', color: C.primaryMid },

  sectionMicro: { fontSize: 10, fontWeight: '800', color: C.textLow, letterSpacing: 1.5, marginBottom: 8 },

  citizenBox:      { backgroundColor: '#F0F7FF', borderRadius: 12, padding: 14, gap: 10 },
  citizenRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  citizenIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  citizenDetail:   { fontSize: 14, color: C.textHigh, fontWeight: '600' },

  timeline:         { paddingLeft: 4, marginBottom: 16 },
  timelineStep:     { flexDirection: 'row', marginBottom: 4 },
  timelineLeft:     { alignItems: 'center', width: 24, marginRight: 14 },
  timelineDot:      { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.cardBorder, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  timelineDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  timelineLine:     { width: 2, flex: 1, backgroundColor: C.cardBorder, marginVertical: 3, minHeight: 24 },
  timelineContent:  { flex: 1, paddingBottom: 18 },
  timelineLabel:    { fontSize: 14, color: C.textLow, fontWeight: '500' },
  timelineSub:      { fontSize: 11, color: C.textLow, marginTop: 2 },

  descBox:  { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 4 },
  descText: { fontSize: 14, color: C.textMid, lineHeight: 22 },

  aiBox:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12 },
  aiText: { fontSize: 14, color: C.primaryMid, fontWeight: '600', flex: 1 },

  locationBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.warning + '33' },
  locationText:{ fontSize: 13, color: C.warning, fontWeight: '600', flex: 1 },

  datesRow: { flexDirection: 'row', gap: 12, marginTop: 14, marginBottom: 4 },
  dateItem: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, gap: 4, borderWidth: 1, borderColor: C.cardBorder },
  dateLabel:{ fontSize: 10, fontWeight: '700', color: C.textLow, letterSpacing: 0.5 },
  dateValue:{ fontSize: 13, fontWeight: '700', color: C.textHigh },

  noteReadBox:  { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.primaryMid },
  noteReadText: { fontSize: 13, color: C.textHigh, lineHeight: 19, flex: 1 },

  noteInputWrap: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: C.cardBorder },
  noteInput:     { flex: 1, fontSize: 14, color: C.textHigh, minHeight: 72 },

  actionRow:     { gap: 10, marginBottom: 4 },
  actionBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, height: 50 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});