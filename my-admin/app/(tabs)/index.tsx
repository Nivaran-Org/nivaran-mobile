/**
 * FILE: app/(tabs)/index.tsx  —  NIVARAN Dashboard (Home Tab)
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
  TextInput,
  Platform,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

// ─── SAFE EASING (no Easing.out / Easing.inOut — broken on react-native-web) ─
const EASE_OUT_QUAD    = Easing.bezier(0, 0, 0.2, 1);
const EASE_IN_OUT_SINE = Easing.bezier(0.45, 0, 0.55, 1);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const LIVE_FEED = [
  {
    id: '1',
    location: 'Punjab • Ludhiana',
    status: 'PENDING',
    issue: 'Major Pothole on Highway',
    reporter: 'Amrit Pal Singh',
    color: C.warning,
    icon: 'time-outline',
    time: '2 mins ago',
  },
  {
    id: '2',
    location: 'Maharashtra • Pune',
    status: 'WORKING',
    issue: 'Street Light Not Working',
    reporter: 'Kiran Deshmukh',
    color: C.primaryMid,
    icon: 'sync-outline',
    time: '18 mins ago',
  },
  {
    id: '3',
    location: 'Chandigarh',
    status: 'RESOLVED',
    issue: 'Water Leakage – Sector 17',
    reporter: 'Suresh Verma',
    color: C.success,
    icon: 'checkmark-circle-outline',
    time: '1 hr ago',
  },
];

const SUMMARY_CARDS = [
  { label: 'New Cases',  hindi: 'नई शिकायतें', count: '12',  icon: 'mail-unread',           color: C.primaryMid, route: '/screens/new-cases'     },
  { label: 'Pending',   hindi: 'लंबित',        count: '05',  icon: 'time',                  color: C.warning,    route: '/screens/overdue'        },
  { label: 'Active',    hindi: 'जारी',          count: '24',  icon: 'sync',                  color: C.accent,     route: '/screens/active-cases'   },
  { label: 'Resolved',  hindi: 'पूर्ण',         count: '150', icon: 'checkmark-done-circle', color: '#8B5CF6',    route: '/screens/resolved-cases' },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING:  C.danger,
  WORKING:  C.warning,
  RESOLVED: C.success,
};

// ─── ANIMATED HELPERS (same pattern as explore.tsx) ──────────────────────────

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
        backgroundColor: color,
        transform: [{ scale }],
        opacity: 0.12,
        position: 'absolute',
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
export default function DashboardScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const transition = () =>
    LayoutAnimation.configureNext({
      duration: 280,
      create:  { type: 'easeInEaseOut', property: 'opacity' },
      update:  { type: 'spring',        springDamping: 0.8 },
      delete:  { type: 'easeInEaseOut', property: 'opacity' },
    });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* Orbs */}
        <View style={styles.orbTopRight}>
          <PulseOrb color={C.primaryMid} size={160} />
        </View>
        <View style={styles.orbBottomLeft}>
          <PulseOrb color={C.accent} size={120} />
        </View>

        <View style={styles.headerRow}>
          <View>
            <View style={styles.badge}>
              <View style={[styles.badgeDot, { backgroundColor: C.accent }]} />
              <Text style={styles.badgeText}>LIVE  ·  NIVARAN  ·  निवारण</Text>
            </View>
            <Text style={styles.headerTitle}>Dashboard{'\n'}Overview</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/(tabs)/notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              <View style={styles.notifBadge}>
                <Text style={styles.notifCount}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtnPrimary}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="person-outline" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.statsSummary}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>248</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.accent }]}>1.2K</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.warning }]}>16</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── SEARCH BAR ───────────────────────────────────────────────── */}
        <FadeIn delay={0}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={C.textLow} />
            <TextInput
              placeholder="शिकायत आईडी खोजें  /  Search Case ID..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={C.textLow}
              {...(Platform.OS === 'web' ? ({ style: { outlineStyle: 'none' } } as any) : {})}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={C.textLow} />
              </TouchableOpacity>
            )}
          </View>
        </FadeIn>

        {/* ── SECTION LABEL ────────────────────────────────────────────── */}
        <FadeIn delay={60}>
          <SectionLabel label="डैशबोर्ड सारांश" sub="DASHBOARD SUMMARY" />
        </FadeIn>

        {/* ── ACTION CARDS GRID ─────────────────────────────────────────── */}
        <View style={styles.grid}>
          {SUMMARY_CARDS.map((card, i) => (
            <FadeIn key={card.label} delay={80 + i * 55} style={styles.gridItem}>
              <ScalePress
                onPress={() => router.push(card.route as any)}
                style={styles.actionCard}
              >
                <LinearGradient
                  colors={[card.color + '18', card.color + '06']}
                  style={styles.actionCardGrad}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: card.color + '22', borderColor: card.color + '44' }]}>
                    <Ionicons name={card.icon as any} size={24} color={card.color} />
                  </View>
                  <Text style={[styles.actionCount, { color: card.color }]}>{card.count}</Text>
                  <Text style={styles.actionLabel}>{card.label}</Text>
                  <Text style={styles.actionHindi}>{card.hindi}</Text>
                  <View style={[styles.actionBar, { backgroundColor: card.color }]} />
                </LinearGradient>
              </ScalePress>
            </FadeIn>
          ))}
        </View>

        {/* ── LIVE FEED ─────────────────────────────────────────────────── */}
        <FadeIn delay={300}>
          <SectionLabel label="लाइव फीड" sub="LIVE FEED" />
        </FadeIn>

        {LIVE_FEED.map((item, i) => (
          <FadeIn key={item.id} delay={340 + i * 60}>
            <View style={[styles.feedCard, { borderLeftColor: item.color }]}>
              <View style={styles.feedTop}>
                <View style={styles.feedLocationRow}>
                  <Ionicons name="location-outline" size={12} color={C.textLow} />
                  <Text style={styles.feedLocation}>{item.location}</Text>
                </View>
                <Text style={styles.feedTime}>{item.time}</Text>
              </View>
              <Text style={styles.feedIssue}>{item.issue}</Text>
              <View style={styles.feedBottom}>
                <Chip label={item.status} color={STATUS_COLOR[item.status]} />
                <Text style={styles.feedReporter}>by {item.reporter}</Text>
              </View>
            </View>
          </FadeIn>
        ))}

        {/* ── INFO BOX ─────────────────────────────────────────────────── */}
        <FadeIn delay={560}>
          <View style={styles.infoBox}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="information-circle-outline" size={20} color={C.primary} />
            </View>
            <Text style={styles.infoText}>
              सूचना: सभी अधिकारी शिकायतों का विवरण सही ढंग से पोर्टल पर अपडेट करना सुनिश्चित करें।
            </Text>
          </View>
        </FadeIn>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
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

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Orbs
  orbTopRight:   { position: 'absolute', top: -20, right: -20, overflow: 'hidden', width: 160, height: 160, borderRadius: 80 },
  orbBottomLeft: { position: 'absolute', bottom: -30, left: 40, overflow: 'hidden', width: 120, height: 120, borderRadius: 60 },

  // Header
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: C.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  headerRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badge:         { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  badgeDot:      { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText:     { fontSize: 10, fontWeight: '800', color: '#93C5FD', letterSpacing: 1.5 },
  headerTitle:   { fontSize: 32, fontWeight: '900', color: '#FFFFFF', lineHeight: 36, letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 10, marginTop: 4 },

  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  iconBtnPrimary: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(147,197,253,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.danger, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: C.primary,
  },
  notifCount: { color: '#fff', fontSize: 9, fontWeight: '900' },

  statsSummary: {
    flexDirection: 'row', marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statLabel:   { fontSize: 10, color: '#93C5FD', marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.20)' },

  scroll: { padding: 20 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    padding: 14,
    borderRadius: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: C.cardBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 13, color: C.textHigh },

  // Section label
  sectionRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionAccent: { width: 4, height: 32, backgroundColor: C.primaryMid, borderRadius: 2, marginRight: 10 },
  sectionHindi:  { fontSize: 14, fontWeight: '900', color: C.textHigh },
  sectionSub:    { fontSize: 10, fontWeight: '800', color: C.textLow, letterSpacing: 1.2, marginTop: 1 },

  // Action cards grid
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 28 },
  gridItem:  { width: '48%' },
  actionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.cardBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  actionCardGrad: {
    padding: 18,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  actionIconWrap: {
    width: 48, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10, borderWidth: 1,
  },
  actionCount:  { fontSize: 30, fontWeight: '900', marginBottom: 2 },
  actionLabel:  { fontSize: 13, fontWeight: '800', color: C.textHigh },
  actionHindi:  { fontSize: 11, fontWeight: '600', color: C.textLow, marginTop: 2 },
  actionBar:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: 2 },

  // Chip
  chip:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  chipDot: { width: 5, height: 5, borderRadius: 3, marginRight: 5 },
  chipText:{ fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  // Feed cards
  feedCard: {
    backgroundColor: C.card,
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: C.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  feedTop:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  feedLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  feedLocation:    { fontSize: 11, color: C.textLow, fontWeight: '700', marginLeft: 3 },
  feedTime:        { fontSize: 11, color: C.textLow, fontWeight: '600' },
  feedIssue:       { fontSize: 15, fontWeight: '800', color: C.textHigh, marginBottom: 10 },
  feedBottom:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedReporter:    { fontSize: 11, color: C.textLow, fontWeight: '600' },

  // Info box
  infoBox: {
    marginTop: 6,
    padding: 18,
    backgroundColor: C.primaryGlow,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
    borderWidth: 1,
    borderColor: C.primary + '22',
  },
  infoIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, flexShrink: 0,
  },
  infoText: {
    flex: 1, color: C.primary, fontSize: 12,
    fontWeight: '600', lineHeight: 20,
  },
});