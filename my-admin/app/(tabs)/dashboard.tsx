/**
 * FILE: app/(tabs)/dashboard.tsx  —  NIVARAN Global Command Centre Audit
 *
 * UI/UX system matches explore.tsx:
 *   - Same colour tokens (C object)
 *   - Same FadeIn / ScalePress / PulseOrb animated helpers
 *   - Safe easing constants (EASE_OUT_QUAD / EASE_IN_OUT_SINE) — no Easing.out/inOut
 *   - LinearGradient header, Chip status badges, consistent card language
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Modal,
  UIManager,
  LayoutAnimation,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// ─── COLOUR SYSTEM (mirrors explore.tsx) ─────────────────────────────────────
const C = {
  bg:          '#F8FAFC',
  surface:     '#FFFFFF',
  card:        '#FFFFFF',
  cardBorder:  '#E2E8F0',
  primary:     '#1E3A8A',
  primaryMid:  '#3B82F6',
  primaryGlow: 'rgba(30,58,138,0.10)',
  accent:      '#22C55E',
  accentGlow:  'rgba(34,197,94,0.12)',
  danger:      '#EF4444',
  dangerGlow:  'rgba(239,68,68,0.12)',
  success:     '#22C55E',
  successGlow: 'rgba(34,197,94,0.12)',
  warning:     '#F59E0B',
  textHigh:    '#1E293B',
  textMid:     '#64748B',
  textLow:     '#94A3B8',
  gradStart:   '#1E3A8A',
  gradEnd:     '#3B82F6',
};

// ─── SAFE EASING ──────────────────────────────────────────────────────────────
const EASE_OUT_QUAD    = Easing.bezier(0, 0, 0.2, 1);
const EASE_IN_OUT_SINE = Easing.bezier(0.45, 0, 0.55, 1);

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TOP_STATES = [
  { id: 'PB', name: 'Punjab',       emoji: '🌾', rate: '98.4%', pending: 42,  resolved: 890  },
  { id: 'MH', name: 'Maharashtra',  emoji: '🏢', rate: '96.2%', pending: 105, resolved: 1420 },
  { id: 'GJ', name: 'Gujarat',      emoji: '🏭', rate: '94.8%', pending: 88,  resolved: 1100 },
  { id: 'TN', name: 'Tamil Nadu',   emoji: '🛕', rate: '92.1%', pending: 130, resolved: 950  },
  { id: 'KL', name: 'Kerala',       emoji: '🌴', rate: '91.5%', pending: 25,  resolved: 780  },
];

const FISCAL_YEARS = ['2023-24', '2024-25', '2025-26'];

const getMockCases = (stateId: string, type: 'PENDING' | 'RESOLVED') => [
  { id: `GRV-${stateId}-201`, title: 'Infrastructure Alert',      dept: 'PWD',        user: 'Rahul Sharma',   date: '2026-04-22', time: '10:30 AM', officer: 'Eng. Kumar'  },
  { id: `GRV-${stateId}-202`, title: 'Water Supply Disruption',   dept: 'Water Works', user: 'Priya Singh',    date: '2026-04-21', time: '02:15 PM', officer: 'Sgt. Verma'  },
  { id: `GRV-${stateId}-203`, title: 'Garbage Collection Missed', dept: 'Sanitation',  user: 'Arjun Mehta',    date: '2026-04-20', time: '09:00 AM', officer: 'Insp. Nair'  },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING:  C.danger,
  RESOLVED: C.success,
};

// ─── ANIMATED HELPERS ─────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const anim       = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim,       { toValue: 1, duration: 380, delay, useNativeDriver: true, easing: EASE_OUT_QUAD }),
      Animated.timing(translateY, { toValue: 0, duration: 380, delay, useNativeDriver: true, easing: EASE_OUT_QUAD }),
    ]).start();
  }, []);

  const flat = StyleSheet.flatten(style) ?? {};
  return (
    <Animated.View style={{ ...flat, opacity: anim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function PulseOrb({ color, size }: { color: string; size: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.18, duration: 1800, useNativeDriver: true, easing: EASE_IN_OUT_SINE }),
        Animated.timing(scale, { toValue: 1,    duration: 1800, useNativeDriver: true, easing: EASE_IN_OUT_SINE }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, transform: [{ scale }],
        opacity: 0.12, position: 'absolute',
      }}
    />
  );
}

function ScalePress({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const handleIn  = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const handleOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();
  const flat = StyleSheet.flatten(style) ?? {};
  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={handleIn} onPressOut={handleOut}>
      <Animated.View style={{ ...flat, transform: [{ scale }] }}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function GlobalDashboard() {
  const [selectedState, setSelectedState] = useState(TOP_STATES[0]);
  const [view,          setView]          = useState<'LIST' | 'AUDIT'>('LIST');
  const [activeTab,     setActiveTab]     = useState<'PENDING' | 'RESOLVED'>('PENDING');
  const [showCalendar,  setShowCalendar]  = useState(false);
  const [timeSpan,      setTimeSpan]      = useState('FY 2025-26');
  const [detailedCase,  setDetailedCase]  = useState<any>(null);

  const transition = () =>
    LayoutAnimation.configureNext({
      duration: 280,
      create:  { type: 'easeInEaseOut', property: 'opacity' },
      update:  { type: 'spring',        springDamping: 0.8 },
      delete:  { type: 'easeInEaseOut', property: 'opacity' },
    });

  const handleStateChange = (state: any) => {
    transition();
    setSelectedState(state);
    setView('LIST');
  };

  const openAudit = (item: any) => {
    transition();
    setDetailedCase(item);
    setView('AUDIT');
  };

  const cases = getMockCases(selectedState.id, activeTab);
  const crumb = view === 'AUDIT' && detailedCase ? `${selectedState.name}  ›  ${detailedCase.id}` : null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.orbTopRight}>
          <PulseOrb color={C.primaryMid} size={160} />
        </View>
        <View style={styles.orbBottomLeft}>
          <PulseOrb color={C.warning} size={120} />
        </View>

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.badge}>
              <View style={[styles.badgeDot, { backgroundColor: C.accent }]} />
              <Text style={styles.badgeText}>COMMAND CENTRE AUDIT</Text>
            </View>
            <Text style={styles.headerTitle}>{selectedState.name}</Text>
          </View>
          <TouchableOpacity style={styles.timeBtn} onPress={() => setShowCalendar(true)}>
            <Ionicons name="calendar-outline" size={14} color="#fff" />
            <Text style={styles.timeBtnText}>{timeSpan}</Text>
          </TouchableOpacity>
        </View>

        {/* Crumb breadcrumb when in audit view */}
        {crumb ? (
          <View style={styles.crumbRow}>
            <Ionicons name="navigate-outline" size={12} color={C.accent} />
            <Text style={styles.crumbText}>{crumb}</Text>
          </View>
        ) : (
          /* Metrics strip */
          <View style={styles.statsSummary}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: C.danger }]}>{selectedState.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: C.accent }]}>{selectedState.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{selectedState.rate}</Text>
              <Text style={styles.statLabel}>Rate</Text>
            </View>
          </View>
        )}

        {/* State picker strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stateStrip}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {TOP_STATES.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => handleStateChange(s)}
              style={[
                styles.stateChip,
                selectedState.id === s.id && styles.stateChipActive,
              ]}
            >
              <Text style={styles.chipEmoji}>{s.emoji}</Text>
              <Text style={[styles.stateChipText, selectedState.id === s.id && { color: '#fff' }]}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* BACK button when in audit */}
        {view === 'AUDIT' && (
          <FadeIn>
            <TouchableOpacity style={styles.backBtn} onPress={() => { transition(); setView('LIST'); }}>
              <View style={styles.backIcon}>
                <Ionicons name="arrow-back" size={16} color={C.primary} />
              </View>
              <Text style={styles.backText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </FadeIn>
        )}

        {/* ── LIST VIEW ──────────────────────────────────────────────── */}
        {view === 'LIST' && (
          <>
            {/* Tab bar */}
            <FadeIn delay={40}>
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={activeTab === 'PENDING' ? styles.tabItemActive : styles.tabItem}
                  onPress={() => { transition(); setActiveTab('PENDING'); }}
                >
                  {activeTab === 'PENDING' && (
                    <LinearGradient
                      colors={[C.danger, '#F87171']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.tabGradFill}
                    />
                  )}
                  <Text style={activeTab === 'PENDING' ? styles.tabLabelActive : styles.tabLabel}>
                    Active Cases
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={activeTab === 'RESOLVED' ? styles.tabItemActive : styles.tabItem}
                  onPress={() => { transition(); setActiveTab('RESOLVED'); }}
                >
                  {activeTab === 'RESOLVED' && (
                    <LinearGradient
                      colors={[C.success, '#4ADE80']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.tabGradFill}
                    />
                  )}
                  <Text style={activeTab === 'RESOLVED' ? styles.tabLabelActive : styles.tabLabel}>
                    Closed Audit
                  </Text>
                </TouchableOpacity>
              </View>
            </FadeIn>

            {/* Case cards */}
            {cases.map((c, i) => (
              <FadeIn key={c.id} delay={80 + i * 60}>
                <ScalePress onPress={() => openAudit(c)} style={styles.caseCard}>
                  <View style={[styles.caseSidebar, { backgroundColor: STATUS_COLOR[activeTab] }]} />
                  <View style={styles.caseBody}>
                    <View style={styles.caseTop}>
                      <Text style={styles.caseId}>{c.id}</Text>
                      <Chip label={activeTab} color={STATUS_COLOR[activeTab]} />
                    </View>
                    <Text style={styles.caseTitle}>{c.title}</Text>
                    <View style={styles.caseMeta}>
                      <Ionicons name="person-outline" size={12} color={C.textMid} />
                      <Text style={styles.caseMetaText}>{c.user}</Text>
                      <View style={styles.dot} />
                      <Ionicons name="business-outline" size={12} color={C.textMid} />
                      <Text style={styles.caseMetaText}>{c.dept}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.textLow} style={{ alignSelf: 'center', marginLeft: 4 }} />
                </ScalePress>
              </FadeIn>
            ))}
          </>
        )}

        {/* ── AUDIT DETAIL VIEW ──────────────────────────────────────── */}
        {view === 'AUDIT' && detailedCase && (
          <FadeIn>
            <View style={styles.detailCard}>
              {/* Gradient bar */}
              <LinearGradient
                colors={[STATUS_COLOR[activeTab] + 'DD', STATUS_COLOR[activeTab] + '33']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.detailGradBar}
              >
                <Chip label={`${activeTab} CASE FILE`} color={STATUS_COLOR[activeTab]} />
                <Text style={styles.detailCaseId}>{detailedCase.id}</Text>
              </LinearGradient>

              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>{detailedCase.title}</Text>

                {[
                  { icon: 'person-outline',           label: 'Reporter',   val: detailedCase.user },
                  { icon: 'shield-checkmark-outline', label: 'Officer',    val: detailedCase.officer },
                  { icon: 'business-outline',         label: 'Department', val: detailedCase.dept },
                  { icon: 'navigate-outline',         label: 'State',      val: selectedState.name },
                  { icon: 'calendar-outline',         label: 'Date / Time',val: `${detailedCase.date}  ·  ${detailedCase.time}` },
                  { icon: 'bar-chart-outline',        label: 'Fiscal Year', val: timeSpan },
                ].map((row) => (
                  <View key={row.label} style={styles.infoRow}>
                    <View style={styles.infoIconWrap}>
                      <Ionicons name={row.icon as any} size={15} color={C.primary} />
                    </View>
                    <View>
                      <Text style={styles.infoRowLabel}>{row.label}</Text>
                      <Text style={styles.infoRowVal}>{row.val}</Text>
                    </View>
                  </View>
                ))}

                {/* Admin portal log box */}
                <View style={styles.adminBox}>
                  <Text style={styles.adminTitle}>ADMIN PORTAL LOGS</Text>
                  {[
                    { k: 'Portal Status',    v: activeTab,                   highlight: true },
                    { k: 'Assigned HQ',      v: `${selectedState.name} HQ`,  highlight: false },
                    { k: 'System Timestamp', v: `${detailedCase.date}  ${detailedCase.time}`, highlight: false },
                  ].map((r) => (
                    <View key={r.k} style={styles.adminRow}>
                      <Text style={styles.adminKey}>{r.k}</Text>
                      <Text style={[styles.adminVal, r.highlight && { color: STATUS_COLOR[activeTab] }]}>
                        {r.v}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Close Audit button */}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => { transition(); setView('LIST'); }}
                >
                  <LinearGradient
                    colors={[C.primary, C.primaryMid]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.closeBtnGrad}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#fff" />
                    <Text style={styles.closeBtnText}>Return to Dashboard</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </FadeIn>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ── TIME SPAN MODAL ─────────────────────────────────────────── */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal header */}
            <LinearGradient
              colors={[C.primary, C.primaryMid]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              <Ionicons name="calendar-outline" size={22} color="#fff" />
              <Text style={styles.modalTitle}>Select Time Span</Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <Text style={styles.modalSub}>FISCAL YEAR</Text>
              <View style={styles.yearGrid}>
                {FISCAL_YEARS.map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    style={[styles.yearBtn, timeSpan.includes(yr) && styles.yearBtnActive]}
                    onPress={() => { setTimeSpan(`FY ${yr}`); setShowCalendar(false); }}
                  >
                    <Text style={[styles.yearBtnText, timeSpan.includes(yr) && { color: '#fff' }]}>{yr}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.monthBtn}
                onPress={() => { setTimeSpan('April 2026'); setShowCalendar(false); }}
              >
                <View style={styles.monthBtnIcon}>
                  <Ionicons name="calendar-number-outline" size={18} color={C.primary} />
                </View>
                <Text style={styles.monthBtnText}>Current Month View</Text>
                <Ionicons name="chevron-forward" size={16} color={C.textLow} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCalendar(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  orbTopRight:   { position: 'absolute', top: -20, right: -20, overflow: 'hidden', width: 160, height: 160, borderRadius: 80 },
  orbBottomLeft: { position: 'absolute', bottom: -30, left: 40, overflow: 'hidden', width: 120, height: 120, borderRadius: 60 },

  // Header
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: C.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badge:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  badgeDot:     { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText:    { fontSize: 10, fontWeight: '800', color: '#93C5FD', letterSpacing: 1.5 },
  headerTitle:  { fontSize: 32, fontWeight: '900', color: '#FFFFFF', lineHeight: 36, letterSpacing: -0.5 },

  timeBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    gap: 6, marginTop: 4,
  },
  timeBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  statsSummary: {
    flexDirection: 'row', marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    marginBottom: 14,
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statLabel:   { fontSize: 10, color: '#93C5FD', marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.20)' },

  crumbRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 14, marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
  },
  crumbText: { color: '#E0F2FE', fontSize: 12, fontWeight: '700', marginLeft: 6 },

  // State strip
  stateStrip: { marginTop: 14 },
  stateChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, marginRight: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  stateChipActive: { backgroundColor: C.danger, borderColor: C.danger },
  chipEmoji:     { marginRight: 5, fontSize: 14 },
  stateChipText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.8)' },

  scroll: { padding: 20 },

  // Back button
  backBtn:  { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryGlow, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.primary + '44' },
  backText: { color: C.primary, fontWeight: '800', marginLeft: 10, fontSize: 14 },

  // Tab bar
  tabBar: {
    flexDirection: 'row', backgroundColor: C.card,
    padding: 5, borderRadius: 16, marginBottom: 18,
    borderWidth: 1, borderColor: C.cardBorder, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  tabItem:       { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, overflow: 'hidden' },
  tabItemActive: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, overflow: 'hidden', elevation: 6 },
  tabLabel:       { fontSize: 12, fontWeight: '900', color: C.textMid },
  tabLabelActive: { fontSize: 12, fontWeight: '900', color: '#fff' },
  tabGradFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12 },

  // Chip
  chip:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  chipDot:  { width: 5, height: 5, borderRadius: 3, marginRight: 5 },
  chipText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  // Case card
  caseCard: {
    backgroundColor: C.card, borderRadius: 18, marginBottom: 12,
    borderWidth: 1, borderColor: C.cardBorder,
    flexDirection: 'row', alignItems: 'stretch', overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  caseSidebar: { width: 4 },
  caseBody:    { flex: 1, padding: 16 },
  caseTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  caseId:      { fontSize: 10, fontWeight: '800', color: C.textLow, letterSpacing: 1 },
  caseTitle:   { fontSize: 15, fontWeight: '800', color: C.textHigh, marginBottom: 10 },
  caseMeta:    { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  caseMetaText:{ fontSize: 11, color: C.textMid, fontWeight: '600', marginLeft: 3, marginRight: 3 },
  dot:         { width: 3, height: 3, borderRadius: 2, backgroundColor: C.textLow },

  // Detail card
  detailCard:    { backgroundColor: C.card, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: C.cardBorder, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10 },
  detailGradBar: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailCaseId:  { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  detailContent: { padding: 22 },
  detailTitle:   { fontSize: 22, fontWeight: '900', color: C.textHigh, marginBottom: 22, lineHeight: 28 },

  infoRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primaryGlow, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: C.primary + '33' },
  infoRowLabel: { fontSize: 10, fontWeight: '800', color: C.textLow, letterSpacing: 0.8, marginBottom: 2 },
  infoRowVal:   { fontSize: 13, fontWeight: '700', color: C.textHigh },

  adminBox: {
    backgroundColor: '#F1F5F9', borderRadius: 18,
    padding: 18, marginTop: 4, marginBottom: 20,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  adminTitle: { fontSize: 10, fontWeight: '900', color: C.primary, letterSpacing: 1.2, marginBottom: 14 },
  adminRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  adminKey:   { fontSize: 12, color: C.textMid, fontWeight: '600' },
  adminVal:   { fontSize: 12, fontWeight: '800', color: C.textHigh },

  closeBtn:     { borderRadius: 16, overflow: 'hidden' },
  closeBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  closeBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard:    { backgroundColor: C.card, width: width * 0.88, borderRadius: 28, overflow: 'hidden', elevation: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  modalHeader:  { flexDirection: 'row', alignItems: 'center', padding: 22, gap: 10 },
  modalTitle:   { fontSize: 18, fontWeight: '900', color: '#fff' },
  modalBody:    { padding: 22, paddingTop: 18 },
  modalSub:     { fontSize: 10, fontWeight: '900', color: C.textLow, letterSpacing: 1.5, marginBottom: 14 },

  yearGrid:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  yearBtn:     { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  yearBtnActive:{ backgroundColor: C.primary },
  yearBtnText: { fontSize: 12, fontWeight: '800', color: C.textMid },

  monthBtn: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: C.cardBorder,
    marginBottom: 16, backgroundColor: C.primaryGlow,
  },
  monthBtnIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryGlow, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  monthBtnText: { flex: 1, fontWeight: '800', color: C.primary, fontSize: 13 },

  cancelBtn:     { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { color: C.danger, fontWeight: '900', fontSize: 14 },
});