import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, Animated, Easing, Dimensions,
  UIManager, LayoutAnimation
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// ─── COLOUR SYSTEM ───────────────────────────────────────────────────────────
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

// ─── INDIA DATASET ───────────────────────────────────────────────────────────
const INDIA_DATA: Record<string, string[]> = {
  "Andaman and Nicobar Islands": ["Nicobar", "South Andaman"],
  "Andhra Pradesh": ["Anantapur", "Chittoor", "Visakhapatnam"],
  "Arunachal Pradesh": ["Tawang", "Tirap"],
  "Assam": ["Barpeta", "Dibrugarh"],
  "Bihar": ["Patna", "Gaya"],
  "Delhi": ["New Delhi", "Central Delhi"],
  "Gujarat": ["Ahmedabad", "Surat"],
  "Haryana": ["Gurugram", "Ambala"],
  "Karnataka": ["Bengaluru Urban", "Mysuru"],
  "Kerala": ["Thrissur", "Wayanad"],
  "Maharashtra": ["Mumbai City", "Pune", "Nagpur"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Jalandhar", "Ludhiana", "Mansa", "Patiala", "Sangrur"],
  "Rajasthan": ["Jaipur", "Jodhpur"],
  "Tamil Nadu": ["Chennai", "Coimbatore"],
  "Uttar Pradesh": ["Lucknow", "Varanasi", "Agra"],
  "West Bengal": ["Kolkata", "Darjeeling"],
};

// ─── MOCK CASE GENERATOR ─────────────────────────────────────────────────────
const getDistrictCases = (dist: string) => [
  { id: `GRV-${dist.substring(0,3).toUpperCase()}-101`, title: "Major Water Pipe Leakage", status: "PENDING",  reportDate: "2026-04-22", userName: "Priyanka Sharma",    assignedTo: "Eng. Deshmukh", dept: "Water Works", time: "10:30 AM", priority: "HIGH" },
  { id: `GRV-${dist.substring(0,3).toUpperCase()}-102`, title: "Garbage Collection Delay",  status: "WORKING",  reportDate: "2026-04-22", userName: "Arjun Singh",        assignedTo: "Sgt. Rathore",  dept: "Sanitation",  time: "02:15 PM", priority: "MEDIUM" },
  { id: `GRV-${dist.substring(0,3).toUpperCase()}-103`, title: "Pothole Repair Needed",     status: "RESOLVED", reportDate: "2026-04-21", userName: "Sukhwinder Kaur",    assignedTo: "Insp. Kumar",   dept: "PWD Roads",   time: "11:00 AM", priority: "LOW" },
];

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: C.danger, MEDIUM: C.warning, LOW: C.accent,
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: C.danger, WORKING: C.warning, RESOLVED: C.success,
};

// ─── SAFE EASING HELPERS ─────────────────────────────────────────────────────
//
// ROOT CAUSE OF THE BUG:
//   react-native-web does not implement the Easing combinator functions
//   (Easing.out, Easing.inOut) correctly — calling them throws
//   "easing is not a function" at runtime because the returned value
//   isn't callable in the web build.
//
// FIX:
//   Replace every Easing.out(…) / Easing.inOut(…) call with a plain
//   numeric easing function that react-native-web CAN handle.
//   - Easing.out(Easing.quad)      ≈ a smooth deceleration → use Easing.bezier(0,0,0.2,1)
//   - Easing.inOut(Easing.sine)    ≈ smooth in+out          → use Easing.bezier(0.45,0,0.55,1)
//
//   Easing.bezier is supported on both native and web.
//
const EASE_OUT_QUAD   = Easing.bezier(0, 0, 0.2, 1);     // replaces Easing.out(Easing.quad)
const EASE_IN_OUT_SINE = Easing.bezier(0.45, 0, 0.55, 1); // replaces Easing.inOut(Easing.sine)

// ─── ANIMATED COMPONENTS ─────────────────────────────────────────────────────

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

  const flatExternal = StyleSheet.flatten(style) ?? {};

  return (
    <Animated.View
      style={{
        ...flatExternal,
        opacity:   anim,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Pulse glow for the header orb */
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

  const flatStyle = StyleSheet.flatten(style) ?? {};

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={handleIn} onPressOut={handleOut}>
      <Animated.View style={{ ...flatStyle, transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── STATUS CHIP ─────────────────────────────────────────────────────────────
function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const [stateVal, setStateVal]         = useState<string | null>(null);
  const [district, setDistrict]         = useState<string | null>(null);
  const [tab, setTab]                   = useState<'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const districts     = stateVal ? INDIA_DATA[stateVal] : [];
  const cases         = district ? getDistrictCases(district) : [];
  const filteredCases = cases.filter(c =>
    tab === 'RESOLVED' ? c.status === 'RESOLVED' : c.status !== 'RESOLVED'
  );

  const transition = () =>
    LayoutAnimation.configureNext({
      duration: 280,
      create:  { type: 'easeInEaseOut', property: 'opacity' },
      update:  { type: 'spring',        springDamping: 0.8 },
      delete:  { type: 'easeInEaseOut', property: 'opacity' },
    });

  const goBack = () => {
    transition();
    if (selectedCase) setSelectedCase(null);
    else if (district) setDistrict(null);
    else setStateVal(null);
  };

  const crumb = [stateVal, district].filter(Boolean).join('  ›  ');

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
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
            <Text style={styles.headerTitle}>Command{'\n'}Centre</Text>
          </View>
          <View style={styles.headerActions}>
            <Link href="/notifications" asChild>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
                <View style={styles.notifBadge}>
                  <Text style={styles.notifCount}>3</Text>
                </View>
              </TouchableOpacity>
            </Link>
            <Link href="/admin-profile" asChild>
              <TouchableOpacity style={styles.iconBtnPrimary}>
                <Ionicons name="person-outline" size={20} color="#93C5FD" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {crumb ? (
          <FadeIn>
            <View style={styles.crumbRow}>
              <Ionicons name="navigate-outline" size={12} color={C.accent} />
              <Text style={styles.crumbText}>{crumb}</Text>
            </View>
          </FadeIn>
        ) : (
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
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* BACK BUTTON */}
        {(stateVal || selectedCase) && (
          <FadeIn>
            <TouchableOpacity style={styles.backBtn} onPress={goBack}>
              <View style={styles.backIcon}>
                <Ionicons name="arrow-back" size={16} color={C.primary} />
              </View>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </FadeIn>
        )}

        {/* 1 ── STATE GRID */}
        {!stateVal && (
          <FadeIn>
            <Text style={styles.sectionLabel}>Select State / UT</Text>
            <View style={styles.stateGrid}>
              {Object.keys(INDIA_DATA).sort().map((s, i) => (
                <FadeIn key={s} delay={i * 35} style={styles.stateGridItem}>
                  <ScalePress
                    onPress={() => { transition(); setStateVal(s); }}
                    style={styles.stateCard}
                  >
                    <Text style={styles.stateName}>{s}</Text>
                    <View style={styles.stateArrow}>
                      <Ionicons name="chevron-forward" size={12} color={C.primary} />
                    </View>
                  </ScalePress>
                </FadeIn>
              ))}
            </View>
          </FadeIn>
        )}

        {/* 2 ── DISTRICT LIST */}
        {stateVal && !district && !selectedCase && (
          <FadeIn>
            <Text style={styles.sectionLabel}>Districts in {stateVal}</Text>
            {districts.map((d, i) => (
              <FadeIn key={d} delay={i * 50}>
                <ScalePress
                  onPress={() => { transition(); setDistrict(d); }}
                  style={styles.districtCard}
                >
                  <View style={styles.districtLeft}>
                    <View style={styles.districtIconWrap}>
                      <Ionicons name="map-outline" size={18} color={C.accent} />
                    </View>
                    <Text style={styles.districtName}>{d}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.textLow} />
                </ScalePress>
              </FadeIn>
            ))}
          </FadeIn>
        )}

        {/* 3 ── CASE LIST */}
        {district && !selectedCase && (
          <FadeIn>
            {/* Tab bar */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={tab === 'ACTIVE' ? styles.tabItemActive : styles.tabItem}
                onPress={() => { transition(); setTab('ACTIVE'); }}
              >
                {tab === 'ACTIVE' && (
                  <LinearGradient
                    colors={[C.danger, '#F87171']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabGradientFill}
                  />
                )}
                <Text style={tab === 'ACTIVE' ? styles.tabLabelActive : styles.tabLabel}>
                  Active
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tab === 'RESOLVED' ? styles.tabItemActive : styles.tabItem}
                onPress={() => { transition(); setTab('RESOLVED'); }}
              >
                {tab === 'RESOLVED' && (
                  <LinearGradient
                    colors={[C.success, '#4ADE80']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabGradientFill}
                  />
                )}
                <Text style={tab === 'RESOLVED' ? styles.tabLabelActive : styles.tabLabel}>
                  Resolved
                </Text>
              </TouchableOpacity>
            </View>

            {filteredCases.length > 0 ? filteredCases.map((c, i) => (
              <FadeIn key={c.id} delay={i * 60}>
                <ScalePress onPress={() => { transition(); setSelectedCase(c); }} style={styles.caseCard}>
                  <View style={[styles.caseSidebar, { backgroundColor: STATUS_COLOR[c.status] }]} />
                  <View style={styles.caseBody}>
                    <View style={styles.caseTop}>
                      <Text style={styles.caseId}>{c.id}</Text>
                      <Chip label={c.status} color={STATUS_COLOR[c.status]} />
                    </View>
                    <Text style={styles.caseTitle}>{c.title}</Text>
                    <View style={styles.caseMeta}>
                      <Ionicons name="person-outline" size={12} color={C.textMid} />
                      <Text style={styles.caseMetaText}>{c.userName}</Text>
                      <View style={styles.dot} />
                      <Ionicons name="time-outline" size={12} color={C.textMid} />
                      <Text style={styles.caseMetaText}>{c.time}</Text>
                      <View style={styles.dot} />
                      <View style={[styles.priorityPill, { backgroundColor: PRIORITY_COLOR[c.priority] + '22' }]}>
                        <Text style={[styles.priorityText, { color: PRIORITY_COLOR[c.priority] }]}>{c.priority}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.textLow} style={styles.caseChevron} />
                </ScalePress>
              </FadeIn>
            )) : (
              <FadeIn>
                <View style={styles.emptyState}>
                  <Ionicons name="folder-open-outline" size={40} color={C.textLow} />
                  <Text style={styles.emptyText}>No cases in this category</Text>
                </View>
              </FadeIn>
            )}
          </FadeIn>
        )}

        {/* 4 ── CASE DETAIL */}
        {selectedCase && (
          <FadeIn>
            <View style={styles.detailCard}>
              <LinearGradient
                colors={[STATUS_COLOR[selectedCase.status] + 'DD', STATUS_COLOR[selectedCase.status] + '33']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.detailGradientBar}
              >
                <Chip label={selectedCase.status} color={STATUS_COLOR[selectedCase.status]} />
                <Text style={styles.detailCaseId}>{selectedCase.id}</Text>
              </LinearGradient>

              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>{selectedCase.title}</Text>

                {[
                  { icon: 'person-outline',           label: 'Reporter', val: selectedCase.userName },
                  { icon: 'shield-checkmark-outline', label: 'Officer',  val: `${selectedCase.assignedTo}  ·  ${selectedCase.dept}` },
                  { icon: 'business-outline',         label: 'Dept',     val: selectedCase.dept },
                  { icon: 'calendar-outline',         label: 'Date',     val: `${selectedCase.reportDate}  ·  ${selectedCase.time}` },
                  { icon: 'flag-outline',             label: 'Priority', val: selectedCase.priority },
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

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => { transition(); setSelectedCase(null); }}
                >
                  <LinearGradient
                    colors={[C.primary, C.primaryMid]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.closeBtnGrad}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#fff" />
                    <Text style={styles.closeBtnText}>Close Audit</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </FadeIn>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  orbTopRight:   { position: 'absolute', top: -20, right: -20, overflow: 'hidden', width: 160, height: 160, borderRadius: 80 },
  orbBottomLeft: { position: 'absolute', bottom: -30, left: 40, overflow: 'hidden', width: 120, height: 120, borderRadius: 60 },

  // ── Header ──
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 0,
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

  statsSummary: { flexDirection: 'row', marginTop: 18, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)' },
  statItem:     { flex: 1, alignItems: 'center' },
  statNum:      { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statLabel:    { fontSize: 10, color: '#93C5FD', marginTop: 2, fontWeight: '600' },
  statDivider:  { width: 1, backgroundColor: 'rgba(255,255,255,0.20)' },

  crumbRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)' },
  crumbText: { color: '#E0F2FE', fontSize: 12, fontWeight: '700', marginLeft: 6 },

  scroll: { padding: 20 },

  backBtn:  { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryGlow, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.primary + '44' },
  backText: { color: C.primary, fontWeight: '800', marginLeft: 10, fontSize: 14 },

  sectionLabel: { fontSize: 11, fontWeight: '900', color: C.textLow, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 },

  stateGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  stateGridItem: { width: '48%' },
  stateCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.cardBorder,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  stateName:  { fontSize: 12, fontWeight: '700', color: C.textHigh, flexShrink: 1, marginRight: 8 },
  stateArrow: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.primaryGlow, justifyContent: 'center', alignItems: 'center' },

  districtCard: {
    backgroundColor: C.card, borderRadius: 18, padding: 18, marginBottom: 10,
    borderWidth: 1, borderColor: C.cardBorder,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  districtLeft:     { flexDirection: 'row', alignItems: 'center' },
  districtIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.accentGlow, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  districtName:     { fontSize: 15, fontWeight: '800', color: C.textHigh },

  tabBar:        { flexDirection: 'row', backgroundColor: C.card, padding: 5, borderRadius: 16, marginBottom: 18, borderWidth: 1, borderColor: C.cardBorder, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  tabItem:       { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, overflow: 'hidden' },
  tabItemActive: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, overflow: 'hidden', elevation: 6 },
  tabLabel:       { fontSize: 12, fontWeight: '900', color: C.textMid },
  tabLabelActive: { fontSize: 12, fontWeight: '900', color: '#fff' },
  tabGradientFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12 },

  chip:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  chipDot:  { width: 5, height: 5, borderRadius: 3, marginRight: 5 },
  chipText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  caseCard: {
    backgroundColor: C.card, borderRadius: 18, marginBottom: 12,
    borderWidth: 1, borderColor: C.cardBorder,
    flexDirection: 'row', alignItems: 'stretch',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  caseSidebar:  { width: 4 },
  caseBody:     { flex: 1, padding: 16 },
  caseTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  caseId:       { fontSize: 10, fontWeight: '800', color: C.textLow, letterSpacing: 1 },
  caseTitle:    { fontSize: 15, fontWeight: '800', color: C.textHigh, marginBottom: 10 },
  caseMeta:     { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  caseMetaText: { fontSize: 11, color: C.textMid, fontWeight: '600', marginLeft: 3, marginRight: 3 },
  caseChevron:  { alignSelf: 'center', marginLeft: 4 },
  dot:          { width: 3, height: 3, borderRadius: 2, backgroundColor: C.textLow },
  priorityPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  priorityText: { fontSize: 9, fontWeight: '900' },

  emptyState: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  emptyText:  { color: C.textLow, fontWeight: '700', fontSize: 14 },

  detailCard:        { backgroundColor: C.card, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: C.cardBorder, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10 },
  detailGradientBar: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailCaseId:      { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  detailContent:     { padding: 22 },
  detailTitle:       { fontSize: 22, fontWeight: '900', color: C.textHigh, marginBottom: 22, lineHeight: 28 },

  infoRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primaryGlow, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: C.primary + '33' },
  infoRowLabel: { fontSize: 10, fontWeight: '800', color: C.textLow, letterSpacing: 0.8, marginBottom: 2 },
  infoRowVal:   { fontSize: 13, fontWeight: '700', color: C.textHigh },

  closeBtn:     { marginTop: 10, borderRadius: 16, overflow: 'hidden' },
  closeBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  closeBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});