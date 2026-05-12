/**
 * FILE: app/screens/new-cases.tsx
 * UI upgraded to match explore.tsx design system.
 * Functionality unchanged.
 */

import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Platform, StatusBar, Animated, Easing, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ─── COLOUR SYSTEM ────────────────────────────────────────────────────────────
const C = {
  bg:          '#F8FAFC',
  card:        '#FFFFFF',
  cardBorder:  '#E2E8F0',
  primary:     '#1E3A8A',
  primaryMid:  '#3B82F6',
  primaryGlow: 'rgba(30,58,138,0.10)',
  accent:      '#22C55E',
  accentGlow:  'rgba(34,197,94,0.12)',
  danger:      '#EF4444',
  warning:     '#F59E0B',
  textHigh:    '#1E293B',
  textMid:     '#64748B',
  textLow:     '#94A3B8',
};

// ─── SAFE EASING ──────────────────────────────────────────────────────────────
const EASE_OUT_QUAD    = Easing.bezier(0, 0, 0.2, 1);
const EASE_IN_OUT_SINE = Easing.bezier(0.45, 0, 0.55, 1);

// ─── MOCK DATA (unchanged) ────────────────────────────────────────────────────
const NEW_CASES_DATA = [
  {
    id: '1',
    title: 'Major Pothole on Highway',
    location: 'GT Road Near Jalandhar Bypass',
    city: 'Punjab • Ludhiana',
    time: '2 mins ago',
    filedAt: '22 Apr 2025, 10:43 AM',
    category: 'Roads',
    officer: { name: 'Insp. Rajesh Kumar', badge: 'PB-4421', dept: 'PWD – Roads Division', phone: '+91 98765 43210', daySpan: '' },
    user: { name: 'Amarjeet Singh', phone: '+91 99887 76655', address: 'House 14, Sector 32, Ludhiana' },
    officerPhoto: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=500',
    userPhoto: 'https://images.unsplash.com/photo-1584776296974-382efaa422b8?q=80&w=500',
    hasGps: false,
    softwareDetected: 'Adobe Photoshop CC',
  },
  {
    id: '2',
    title: 'Street Light Not Working',
    location: 'Viman Nagar, Lane 4',
    city: 'Maharashtra • Pune',
    time: '15 mins ago',
    filedAt: '22 Apr 2025, 08:20 AM',
    category: 'Electricity',
    officer: { name: 'Eng. Priya Deshmukh', badge: 'MH-1102', dept: 'MSEDCL – Urban Grid', phone: '+91 91234 56789', daySpan: '3 Days' },
    user: { name: 'Rohit Kulkarni', phone: '+91 88002 11234', address: 'Flat 7B, Viman Nagar, Pune' },
    officerPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=500',
    userPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500',
    hasGps: true,
    softwareDetected: 'None',
  },
  {
    id: '3',
    title: 'Water Leakage in Main Line',
    location: 'Sector 17 Market',
    city: 'Chandigarh',
    time: '1 hour ago',
    filedAt: '22 Apr 2025, 09:55 AM',
    category: 'Water Supply',
    officer: { name: 'Insp. Gurpreet Kaur', badge: 'CH-0089', dept: 'CWSS – Pipeline Maintenance', phone: '+91 97300 12345', daySpan: '5 Days' },
    user: { name: 'Suresh Verma', phone: '+91 70011 55566', address: 'Shop 4, Sector 17, Chandigarh' },
    officerPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500',
    userPhoto: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=500',
    hasGps: false,
    softwareDetected: 'None',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Roads: C.danger, Electricity: C.warning, 'Water Supply': C.primaryMid, Sanitation: C.accent,
};
const CATEGORY_ICONS: Record<string, string> = {
  Roads: 'car-outline', Electricity: 'flash-outline', 'Water Supply': 'water-outline', Sanitation: 'trash-outline',
};

// ─── ANIMATED HELPERS ─────────────────────────────────────────────────────────
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
    <Animated.View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, transform: [{ scale }],
      opacity: 0.13, position: 'absolute',
    }} />
  );
}

function FadeSlide({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty      = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 360, delay, useNativeDriver: true, easing: EASE_OUT_QUAD }),
      Animated.timing(ty,      { toValue: 0, duration: 360, delay, useNativeDriver: true, easing: EASE_OUT_QUAD }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY: ty }] }}>{children}</Animated.View>;
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function NewCasesScreen() {
  const router = useRouter();

  const handleViewCase = (item: typeof NEW_CASES_DATA[0]) => {
    router.push({ pathname: '/screens/case-details', params: { caseData: JSON.stringify(item) } });
  };

  const renderItem = ({ item, index }: { item: typeof NEW_CASES_DATA[0]; index: number }) => {
    const catColor = CATEGORY_COLORS[item.category] ?? C.primaryMid;
    const catIcon  = CATEGORY_ICONS[item.category]  ?? 'alert-circle-outline';
    return (
      <FadeSlide delay={index * 70}>
        <View style={styles.caseCard}>
          {/* Left accent bar */}
          <View style={[styles.cardAccent, { backgroundColor: catColor }]} />

          <View style={styles.cardInner}>
            {/* Top row: category icon + badge + time */}
            <View style={styles.cardTop}>
              <View style={[styles.catIconWrap, { backgroundColor: catColor + '18', borderColor: catColor + '40' }]}>
                <Ionicons name={catIcon as any} size={16} color={catColor} />
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: catColor + '18', borderColor: catColor + '44' }]}>
                <Text style={[styles.categoryBadgeText, { color: catColor }]}>{item.category}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Text style={styles.timeText}>{item.time}</Text>
            </View>

            {/* Title */}
            <Text style={styles.caseTitle}>{item.title}</Text>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={C.textMid} />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
            <Text style={styles.cityText}>{item.city}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Officer info row */}
            <View style={styles.officerRow}>
              <View style={styles.officerAvatar}>
                <Ionicons name="person-outline" size={14} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.officerName}>{item.officer.name}</Text>
                <Text style={styles.officerDept}>{item.officer.dept}</Text>
              </View>
            </View>

            {/* Day Span Indicator */}
            <View style={[
              styles.daySpanRow,
              { backgroundColor: item.officer.daySpan ? C.accentGlow : '#FEF3C7', borderColor: item.officer.daySpan ? C.accent + '44' : C.warning + '44' }
            ]}>
              <Ionicons
                name={item.officer.daySpan ? 'time-outline' : 'alert-circle-outline'}
                size={13}
                color={item.officer.daySpan ? C.accent : C.warning}
              />
              <Text style={[styles.daySpanText, { color: item.officer.daySpan ? C.accent : C.warning }]}>
                {item.officer.daySpan ? `ETA: ${item.officer.daySpan}` : 'Day span not provided by officer'}
              </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.buttonGroup}>
              <Pressable style={styles.assignBtn}>
                <LinearGradient
                  colors={[C.primary, C.primaryMid]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.assignBtnGrad}
                >
                  <Ionicons name="person-add-outline" size={15} color="#fff" />
                  <Text style={styles.assignBtnText}>Assign Official</Text>
                </LinearGradient>
              </Pressable>
              <Pressable style={styles.viewBtn} onPress={() => handleViewCase(item)}>
                <Ionicons name="eye-outline" size={18} color={C.primary} />
              </Pressable>
            </View>
          </View>
        </View>
      </FadeSlide>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.orbTopRight}><PulseOrb color={C.primaryMid} size={170} /></View>
        <View style={styles.orbBottomLeft}><PulseOrb color={C.accent} size={130} /></View>

        {/* Nav row */}
        <View style={styles.navRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </Pressable>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: C.accent }]} />
            <Text style={styles.badgeText}>LIVE  ·  NIVARAN  ·  निवारण</Text>
          </View>
        </View>

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.headerTitle}>New{'\n'}Grievances</Text>
          <View style={styles.countBubble}>
            <Text style={styles.countNum}>{NEW_CASES_DATA.length}</Text>
            <Text style={styles.countLabel}>Cases</Text>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.statsSummary}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{NEW_CASES_DATA.length}</Text>
            <Text style={styles.statLabel}>New Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.warning }]}>
              {NEW_CASES_DATA.filter(c => !c.officer.daySpan).length}
            </Text>
            <Text style={styles.statLabel}>No ETA</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.accent }]}>
              {NEW_CASES_DATA.filter(c => c.hasGps).length}
            </Text>
            <Text style={styles.statLabel}>GPS Tagged</Text>
          </View>
        </View>
      </View>

      {/* ── LIST ─────────────────────────────────────────────────────────── */}
      <FlatList
        data={NEW_CASES_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={60} color={C.textLow} />
            <Text style={styles.emptyText}>No new cases reported yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: C.primary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
  },
  orbTopRight:   { position: 'absolute', top: -20, right: -20, overflow: 'hidden', width: 170, height: 170, borderRadius: 85 },
  orbBottomLeft: { position: 'absolute', bottom: -40, left: 30, overflow: 'hidden', width: 130, height: 130, borderRadius: 65 },

  navRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center', alignItems: 'center',
  },
  badge:    { flexDirection: 'row', alignItems: 'center' },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText:{ fontSize: 10, fontWeight: '800', color: '#93C5FD', letterSpacing: 1.5 },

  titleBlock:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  headerTitle: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', lineHeight: 40, letterSpacing: -0.5 },
  countBubble: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center',
  },
  countNum:   { fontSize: 26, fontWeight: '900', color: '#fff' },
  countLabel: { fontSize: 10, fontWeight: '700', color: '#93C5FD', marginTop: 1 },

  statsSummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statLabel:   { fontSize: 10, color: '#93C5FD', marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.20)' },

  // List
  listContent: { padding: 20, paddingTop: 22 },

  // Card
  caseCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.cardBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  cardAccent: { width: 5 },
  cardInner:  { flex: 1, padding: 18 },

  cardTop:     { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  catIconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  categoryBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: '800' },
  timeText: { fontSize: 11, color: C.textLow, fontWeight: '600' },

  caseTitle:    { fontSize: 17, fontWeight: '900', color: C.textHigh, marginBottom: 8, lineHeight: 22 },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  locationText: { color: C.textMid, fontSize: 13, fontWeight: '600' },
  cityText:     { fontSize: 11, color: C.textLow, fontWeight: '700', marginLeft: 17, marginBottom: 14 },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 14 },

  officerRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  officerAvatar: {
    width: 34, height: 34, borderRadius: 12,
    backgroundColor: C.primaryGlow, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.primary + '33',
  },
  officerName: { fontSize: 13, fontWeight: '800', color: C.textHigh },
  officerDept: { fontSize: 11, color: C.textMid, fontWeight: '600', marginTop: 1 },

  daySpanRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, marginBottom: 16, alignSelf: 'flex-start',
  },
  daySpanText: { fontSize: 12, fontWeight: '800' },

  buttonGroup: { flexDirection: 'row', gap: 10 },
  assignBtn:   { flex: 1, borderRadius: 14, overflow: 'hidden' },
  assignBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, gap: 7,
  },
  assignBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  viewBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.primaryGlow, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.primary + '33',
  },

  // Empty
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText:      { color: C.textLow, fontSize: 15, fontWeight: '700' },
});