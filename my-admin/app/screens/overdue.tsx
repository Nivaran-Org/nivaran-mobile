/**
 * FILE: app/screens/overdue.tsx
 * UI upgraded to match explore.tsx design system.
 * Functionality unchanged.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Modal, Alert, Animated, Easing, Dimensions,
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
  dangerGlow:  'rgba(239,68,68,0.12)',
  warning:     '#F59E0B',
  violet:      '#7C3AED',
  violetGlow:  'rgba(124,58,237,0.12)',
  textHigh:    '#1E293B',
  textMid:     '#64748B',
  textLow:     '#94A3B8',
};

const EASE_OUT_QUAD    = Easing.bezier(0, 0, 0.2, 1);
const EASE_IN_OUT_SINE = Easing.bezier(0.45, 0, 0.55, 1);

// ─── MOCK DATA (unchanged) ────────────────────────────────────────────────────
const OVERDUE_DATA = [
  { id: 'GRV-2011', title: 'Street Light Not Working',  location: 'Viman Nagar, Lane 4, Pune', filedDate: '10 April, 2026', assignedTo: 'Eng. Priya Deshmukh', dept: 'MSEDCL – Urban Grid',          daysOverdue: 12, lastUpdate: 'No update provided', daySpan: '', priority: 'HIGH',     category: 'Electricity', escalated: false },
  { id: 'GRV-2018', title: 'Sewage Overflow on Road',   location: 'Sector 22, Chandigarh',      filedDate: '08 April, 2026', assignedTo: 'Sgt. Vikram Rathore',  dept: 'Municipal Corp – Drainage',  daysOverdue: 14, lastUpdate: 'No update provided', daySpan: '', priority: 'CRITICAL', category: 'Sanitation',  escalated: false },
  { id: 'GRV-2025', title: 'Pothole Causing Accidents',  location: 'GT Road, Ludhiana',          filedDate: '05 April, 2026', assignedTo: 'Insp. Rajesh Kumar',   dept: 'PWD – Roads Division',       daysOverdue: 17, lastUpdate: 'No update provided', daySpan: '', priority: 'CRITICAL', category: 'Roads',       escalated: false },
  { id: 'GRV-2031', title: 'Broken Water Pipeline',     location: 'Model Town, Ludhiana',       filedDate: '03 April, 2026', assignedTo: 'Insp. Gurpreet Kaur',  dept: 'CWSS – Pipeline Maintenance',daysOverdue: 19, lastUpdate: 'No update provided', daySpan: '', priority: 'HIGH',     category: 'Water Supply',escalated: true  },
];

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  CRITICAL: { color: C.danger,  bg: '#FEE2E2' },
  HIGH:     { color: C.warning, bg: '#FEF3C7' },
  MEDIUM:   { color: C.primaryMid, bg: '#EFF6FF' },
};
const CATEGORY_ICONS: Record<string, string> = {
  Electricity: 'flash', Sanitation: 'water', Roads: 'car', 'Water Supply': 'git-branch',
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
export default function OverdueScreen() {
  const router = useRouter();
  const [cases, setCases]           = useState(OVERDUE_DATA);
  const [selected, setSelected]     = useState<typeof OVERDUE_DATA[0] | null>(null);
  const [modalVisible, setModal]    = useState(false);
  const [filter, setFilter]         = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  const filtered = cases.filter(c => filter === 'ALL' ? true : c.priority === filter);

  const handleEscalate = (item: typeof OVERDUE_DATA[0]) => {
    setSelected(item);
    setModal(true);
  };

  const confirmEscalate = () => {
    if (!selected) return;
    setCases(prev => prev.map(c => c.id === selected.id ? { ...c, escalated: true } : c));
    setModal(false);
    Alert.alert(
      '⚖️ Escalated to District Court',
      `Case ${selected.id} — "${selected.title}" has been formally referred to the District Court.\n\nA notice will be sent to ${selected.assignedTo}.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const totalDays = cases.reduce((sum, c) => sum + c.daysOverdue, 0);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.orbTopRight}><PulseOrb color={C.danger}   size={170} /></View>
        <View style={styles.orbBottomLeft}><PulseOrb color={C.primaryMid} size={130} /></View>

        {/* Nav row */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: C.danger }]} />
            <Text style={styles.badgeText}>PENDING ESCALATIONS  ·  लंबित मामले</Text>
          </View>
        </View>

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.headerTitle}>Overdue{'\n'}Cases</Text>
          <View style={styles.warningBubble}>
            <Ionicons name="warning" size={18} color={C.danger} />
            <Text style={styles.warningNum}>{cases.filter(c => !c.escalated).length}</Text>
            <Text style={styles.warningLabel}>Urgent</Text>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.statsSummary}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{cases.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#FCA5A5' }]}>
              {cases.filter(c => c.priority === 'CRITICAL').length}
            </Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#86EFAC' }]}>
              {cases.filter(c => c.escalated).length}
            </Text>
            <Text style={styles.statLabel}>Escalated</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#93C5FD' }]}>{totalDays}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
        </View>
      </View>

      {/* ── FILTER CHIPS ─────────────────────────────────────────────────── */}
      <FadeSlide delay={0}>
        <View style={styles.filterRow}>
          {(['ALL', 'CRITICAL', 'HIGH'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
            >
              {f !== 'ALL' && (
                <View style={[styles.filterDot, { backgroundColor: PRIORITY_CONFIG[f]?.color ?? C.textLow }]} />
              )}
              {filter === f && f !== 'ALL' && (
                <LinearGradient
                  colors={[PRIORITY_CONFIG[f].color, PRIORITY_CONFIG[f].color + 'BB']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'ALL' ? 'All Cases' : f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </FadeSlide>

      {/* ── LIST ─────────────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const pri     = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.HIGH;
          const catIcon = CATEGORY_ICONS[item.category] ?? 'alert-circle';
          return (
            <FadeSlide delay={60 + index * 65}>
              <View style={[styles.card, item.escalated && styles.cardEscalated]}>
                {/* Left accent bar colored by priority */}
                <View style={[styles.cardAccent, { backgroundColor: item.escalated ? C.violet : pri.color }]} />

                <View style={styles.cardBody}>
                  {/* Top row */}
                  <View style={styles.cardTop}>
                    <View style={[styles.catIconWrap, { backgroundColor: pri.color + '18', borderColor: pri.color + '44' }]}>
                      <Ionicons name={catIcon as any} size={17} color={pri.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.caseId}>{item.id}</Text>
                      <Text style={styles.caseTitle}>{item.title}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: pri.bg, borderColor: pri.color + '55' }]}>
                      <View style={[styles.priorityDot, { backgroundColor: pri.color }]} />
                      <Text style={[styles.priorityText, { color: pri.color }]}>{item.priority}</Text>
                    </View>
                  </View>

                  {/* Meta */}
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={12} color={C.textLow} />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={12} color={C.textLow} />
                    <Text style={styles.metaText}>Filed: {item.filedDate}</Text>
                  </View>

                  {/* Overdue banner */}
                  <View style={styles.overdueBanner}>
                    <Ionicons name="time" size={14} color={C.danger} />
                    <Text style={styles.overdueText}>
                      {item.daysOverdue} Days Overdue — Officer has not updated
                    </Text>
                  </View>

                  {/* Officer row */}
                  <View style={styles.officerRow}>
                    <View style={styles.officerAvatar}>
                      <Ionicons name="person-outline" size={13} color={C.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.officerName}>{item.assignedTo}</Text>
                      <Text style={styles.officerDept}>{item.dept}</Text>
                    </View>
                    <View style={styles.noSpanTag}>
                      <Ionicons name="alert-circle-outline" size={11} color={C.warning} />
                      <Text style={styles.noSpanText}>No ETA</Text>
                    </View>
                  </View>

                  {/* Action buttons */}
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() => router.push('/screens/case-details')}
                    >
                      <Ionicons name="eye-outline" size={14} color={C.primary} />
                      <Text style={styles.viewBtnText}>View</Text>
                    </TouchableOpacity>

                    {item.escalated ? (
                      <View style={styles.escalatedTag}>
                        <Ionicons name="gavel" size={14} color={C.violet} />
                        <Text style={styles.escalatedTagText}>Referred to Court</Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.escalateBtn} onPress={() => handleEscalate(item)}>
                        <LinearGradient
                          colors={[C.violet, '#9333EA']}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                          style={styles.escalateBtnGrad}
                        >
                          <Ionicons name="gavel" size={14} color="#fff" />
                          <Text style={styles.escalateBtnText}>Escalate to Court</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </FadeSlide>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-circle" size={60} color={C.accent} />
            <Text style={styles.emptyText}>No overdue cases!</Text>
          </View>
        }
      />

      {/* ── ESCALATION MODAL ─────────────────────────────────────────────── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <View style={styles.gavelCircle}>
              <Ionicons name="gavel" size={32} color={C.violet} />
            </View>
            <Text style={styles.modalTitle}>Escalate to District Court?</Text>
            <Text style={styles.modalSub}>
              This will formally refer the case to the district judiciary and
              issue a notice to the assigned officer.
            </Text>

            {selected && (
              <View style={styles.modalCaseBox}>
                <Text style={styles.modalCaseId}>{selected.id}</Text>
                <Text style={styles.modalCaseTitle}>{selected.title}</Text>
                <Text style={styles.modalCaseOfficer}>Officer: {selected.assignedTo}</Text>
                <View style={styles.modalDaysRow}>
                  <Ionicons name="time-outline" size={12} color={C.danger} />
                  <Text style={styles.modalCaseDays}>{selected.daysOverdue} days without action</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.confirmBtn} onPress={confirmEscalate}>
              <LinearGradient
                colors={[C.violet, '#9333EA']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.confirmBtnGrad}
              >
                <Ionicons name="gavel" size={18} color="#fff" />
                <Text style={styles.confirmBtnText}>Confirm Escalation</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 3,
    borderBottomColor: C.danger,
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
  badgeText:{ fontSize: 10, fontWeight: '800', color: '#93C5FD', letterSpacing: 1.4 },

  titleBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  headerTitle:{ fontSize: 36, fontWeight: '900', color: '#FFFFFF', lineHeight: 40, letterSpacing: -0.5 },
  warningBubble: {
    backgroundColor: 'rgba(239,68,68,0.22)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', gap: 2,
  },
  warningNum:   { fontSize: 22, fontWeight: '900', color: '#fff' },
  warningLabel: { fontSize: 10, fontWeight: '700', color: '#FCA5A5' },

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

  // Filter
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6, gap: 10 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 22, backgroundColor: C.card, gap: 6,
    borderWidth: 1, borderColor: C.cardBorder, overflow: 'hidden',
    elevation: 1,
  },
  filterChipActive: { borderColor: 'transparent' },
  filterDot:        { width: 7, height: 7, borderRadius: 4 },
  filterText:       { fontSize: 12, fontWeight: '800', color: C.textMid },
  filterTextActive: { color: '#fff' },

  // List
  listContent: { padding: 20, paddingTop: 10 },

  // Card
  card: {
    backgroundColor: C.card, borderRadius: 22, marginBottom: 14,
    flexDirection: 'row', overflow: 'hidden',
    borderWidth: 1, borderColor: C.cardBorder,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10,
  },
  cardEscalated: { opacity: 0.85 },
  cardAccent:    { width: 5 },
  cardBody:      { flex: 1, padding: 16 },

  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  catIconWrap: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  caseId:      { fontSize: 10, color: C.textLow, fontWeight: '800', letterSpacing: 0.8 },
  caseTitle:   { fontSize: 15, fontWeight: '900', color: C.textHigh, marginTop: 1 },
  priorityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1,
  },
  priorityDot:  { width: 5, height: 5, borderRadius: 3 },
  priorityText: { fontSize: 10, fontWeight: '900' },

  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  metaText: { fontSize: 11, color: C.textLow, fontWeight: '600' },

  overdueBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.dangerGlow, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8, marginVertical: 10,
    borderWidth: 1, borderColor: C.danger + '33',
  },
  overdueText: { fontSize: 12, color: C.danger, fontWeight: '700' },

  officerRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 14,
    padding: 10, marginBottom: 14, gap: 10,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  officerAvatar: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.primaryGlow, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.primary + '33',
  },
  officerName: { fontSize: 13, fontWeight: '800', color: C.textHigh },
  officerDept: { fontSize: 11, color: C.textMid, fontWeight: '600', marginTop: 1 },
  noSpanTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    borderWidth: 1, borderColor: C.warning + '44',
  },
  noSpanText: { fontSize: 10, color: C.warning, fontWeight: '900' },

  btnRow:   { flexDirection: 'row', gap: 10 },
  viewBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14,
    backgroundColor: C.primaryGlow, borderWidth: 1, borderColor: C.primary + '33',
  },
  viewBtnText: { fontSize: 12, fontWeight: '800', color: C.primary },
  escalateBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  escalateBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, gap: 6,
  },
  escalateBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  escalatedTag: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: C.violetGlow, paddingVertical: 11, borderRadius: 14,
    borderWidth: 1, borderColor: C.violet + '44',
  },
  escalatedTagText: { color: C.violet, fontWeight: '900', fontSize: 12 },

  emptyBox: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText:{ color: C.textLow, fontSize: 15, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, alignItems: 'center',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: C.cardBorder, borderRadius: 2, marginBottom: 24 },
  gavelCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.violetGlow, justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: C.violet + '44',
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: C.textHigh, marginBottom: 8 },
  modalSub:   { fontSize: 13, color: C.textMid, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  modalCaseBox: {
    backgroundColor: '#F8FAFC', width: '100%', padding: 16, borderRadius: 18,
    marginBottom: 22, borderLeftWidth: 4, borderLeftColor: C.violet,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  modalCaseId:      { fontSize: 10, color: C.textLow, fontWeight: '900', marginBottom: 3 },
  modalCaseTitle:   { fontSize: 15, fontWeight: '900', color: C.textHigh, marginBottom: 4 },
  modalCaseOfficer: { fontSize: 12, color: C.textMid, fontWeight: '600', marginBottom: 6 },
  modalDaysRow:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modalCaseDays:    { fontSize: 12, color: C.danger, fontWeight: '700' },
  confirmBtn:       { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  confirmBtnGrad:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  confirmBtnText:   { color: '#fff', fontWeight: '900', fontSize: 15 },
  cancelBtn:        { paddingVertical: 12 },
  cancelBtnText:    { color: C.textLow, fontWeight: '700', fontSize: 14 },
});