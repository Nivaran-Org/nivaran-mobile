/**
 * FILE: app/screens/resolved-cases.tsx
 * UI upgraded to match explore.tsx design system.
 * Functionality unchanged.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Image, Modal, ScrollView, Animated, Easing, Dimensions,
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

const EASE_OUT_QUAD    = Easing.bezier(0, 0, 0.2, 1);
const EASE_IN_OUT_SINE = Easing.bezier(0.45, 0, 0.55, 1);

// ─── MOCK DATA (unchanged) ────────────────────────────────────────────────────
const RESOLVED_DATA = [
  {
    id: 'GRV-1001', title: 'Broken Pipe Repair', category: 'Water Supply',
    location: 'Model Town, Ludhiana',
    filedDate: '01 April, 2026', filedTime: '09:32 AM',
    actionDate: '12 April, 2026', actionTime: '02:15 PM',
    resolvedDate: '12 April, 2026', daysToResolve: 11,
    officer: 'Insp. Amandeep Singh', dept: 'CWSS – Pipeline Maintenance',
    officerBadge: 'PB-4421', score: 5, complainant: 'Suresh Verma',
    beforePhoto: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=500',
    afterPhoto:  'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=500',
    description: 'Major water pipeline burst causing flooding in residential area. Residents had no water supply for 3 days.',
  },
  {
    id: 'GRV-1002', title: 'Street Light Fixed', category: 'Electricity',
    location: 'Rama Mandi, Ludhiana',
    filedDate: '03 April, 2026', filedTime: '07:50 AM',
    actionDate: '10 April, 2026', actionTime: '04:40 PM',
    resolvedDate: '10 April, 2026', daysToResolve: 7,
    officer: 'Officer Priya Sharma', dept: 'MSEDCL – Urban Grid',
    officerBadge: 'MH-1102', score: 4, complainant: 'Ranjit Kaur',
    beforePhoto: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500',
    afterPhoto:  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=500',
    description: 'Street lights on 3 poles were non-functional for 15+ days, creating safety hazard at night.',
  },
  {
    id: 'GRV-1003', title: 'Drainage Cleaning Done', category: 'Sanitation',
    location: 'Central Market, Chandigarh',
    filedDate: '28 March, 2026', filedTime: '11:10 AM',
    actionDate: '08 April, 2026', actionTime: '10:00 AM',
    resolvedDate: '08 April, 2026', daysToResolve: 11,
    officer: 'Sgt. Vikram Rathore', dept: 'Municipal Corp – Sanitation',
    officerBadge: 'CH-0089', score: 5, complainant: 'Mohit Garg',
    beforePhoto: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=500',
    afterPhoto:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500',
    description: 'Main drainage channel completely blocked causing sewage to overflow onto market roads.',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Water Supply': C.primaryMid,
  Electricity:   C.warning,
  Sanitation:    C.accent,
  Roads:         C.danger,
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

function Stars({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name={i <= count ? 'star' : 'star-outline'} size={12}
          color={i <= count ? C.warning : C.cardBorder} />
      ))}
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function ResolvedCases() {
  const router   = useRouter();
  const [selected, setSelected] = useState<typeof RESOLVED_DATA[0] | null>(null);

  const avgDays   = Math.round(RESOLVED_DATA.reduce((s, c) => s + c.daysToResolve, 0) / RESOLVED_DATA.length);
  const avgRating = (RESOLVED_DATA.reduce((s, c) => s + c.score, 0) / RESOLVED_DATA.length).toFixed(1);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.orbTopRight}><PulseOrb color="#34D399" size={170} /></View>
        <View style={styles.orbBottomLeft}><PulseOrb color={C.primaryMid} size={130} /></View>

        {/* Nav row */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: '#34D399' }]} />
            <Text style={styles.badgeText}>COMPLETED  ·  हल किए गए मामले</Text>
          </View>
        </View>

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.headerTitle}>Resolved{'\n'}Cases</Text>
          <View style={styles.resolvedBubble}>
            <Ionicons name="checkmark-done-circle" size={22} color="#34D399" />
            <Text style={styles.resolvedNum}>{RESOLVED_DATA.length}</Text>
            <Text style={styles.resolvedLabel}>Solved</Text>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.statsSummary}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{RESOLVED_DATA.length}</Text>
            <Text style={styles.statLabel}>Total Solved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#86EFAC' }]}>{avgDays}d</Text>
            <Text style={styles.statLabel}>Avg Resolution</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#FDE68A' }]}>{avgRating}★</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </View>

      {/* ── LIST ─────────────────────────────────────────────────────────── */}
      <FlatList
        data={RESOLVED_DATA}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const catColor = CATEGORY_COLORS[item.category] ?? C.primaryMid;
          return (
            <FadeSlide delay={index * 70}>
              <View style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: catColor }]} />

                <View style={styles.cardBody}>
                  {/* Top */}
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.caseIdRow}>
                        <Text style={styles.caseId}>{item.id}</Text>
                        <View style={[styles.catBadge, { backgroundColor: catColor + '18', borderColor: catColor + '44' }]}>
                          <Text style={[styles.catBadgeText, { color: catColor }]}>{item.category}</Text>
                        </View>
                      </View>
                      <Text style={styles.caseTitle}>{item.title}</Text>
                    </View>
                    <View style={styles.scorePill}>
                      <Stars count={item.score} />
                      <Text style={styles.scoreNum}>{item.score}/5</Text>
                    </View>
                  </View>

                  {/* Location */}
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={12} color={C.textLow} />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>

                  {/* Timeline */}
                  <View style={styles.timeline}>
                    {[
                      { label: 'Complaint Filed',      date: item.filedDate,    time: item.filedTime,   by: item.complainant, color: C.danger },
                      { label: 'Officer Took Action',  date: item.actionDate,   time: item.actionTime,  by: item.officer,     color: C.primaryMid },
                      { label: 'Case Resolved',        date: item.resolvedDate, time: '',               by: `${item.daysToResolve} days`, color: C.accent },
                    ].map((ev, i) => (
                      <View key={i}>
                        <View style={styles.timelineItem}>
                          <View style={[styles.timelineDot, { backgroundColor: ev.color }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.tlLabel}>{ev.label}</Text>
                            <Text style={styles.tlDate}>{ev.date}{ev.time ? `  ·  ${ev.time}` : ''}</Text>
                            <Text style={styles.tlBy}>{ev.by}</Text>
                          </View>
                        </View>
                        {i < 2 && <View style={styles.tlConnector} />}
                      </View>
                    ))}
                  </View>

                  {/* Photo proof */}
                  <Text style={styles.photoSectionLabel}>Proof Photos</Text>
                  <View style={styles.photoRow}>
                    <View style={styles.photoWrap}>
                      <Image source={{ uri: item.beforePhoto }} style={styles.photo} />
                      <View style={[styles.photoTag, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[styles.photoTagText, { color: C.danger }]}>BEFORE</Text>
                      </View>
                    </View>
                    <View style={styles.arrowWrap}>
                      <Ionicons name="arrow-forward" size={18} color={C.accent} />
                    </View>
                    <View style={styles.photoWrap}>
                      <Image source={{ uri: item.afterPhoto }} style={styles.photo} />
                      <View style={[styles.photoTag, { backgroundColor: '#DCFCE7' }]}>
                        <Text style={[styles.photoTagText, { color: C.accent }]}>AFTER</Text>
                      </View>
                    </View>
                  </View>

                  {/* Full report button */}
                  <TouchableOpacity style={styles.detailBtn} onPress={() => setSelected(item)}>
                    <LinearGradient
                      colors={[C.primary, C.primaryMid]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={styles.detailBtnGrad}
                    >
                      <Ionicons name="document-text-outline" size={14} color="#fff" />
                      <Text style={styles.detailBtnText}>View Full Report</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </FadeSlide>
          );
        }}
      />

      {/* ── FULL REPORT MODAL ─────────────────────────────────────────────── */}
      {selected && (
        <Modal visible={!!selected} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHandle} />

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal header */}
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalId}>{selected.id}</Text>
                    <Text style={styles.modalTitle}>{selected.title}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelected(null)}
                  >
                    <Ionicons name="close" size={18} color={C.textMid} />
                  </TouchableOpacity>
                </View>

                {/* Description */}
                <View style={styles.descBox}>
                  <Ionicons name="document-text-outline" size={14} color={C.primaryMid} style={{ marginTop: 1 }} />
                  <Text style={styles.modalDesc}>{selected.description}</Text>
                </View>

                {/* Officer card */}
                <Text style={styles.modalSectionTitle}>Assigned Officer</Text>
                <View style={styles.officerBox}>
                  <View style={styles.officerAvatar}>
                    <Ionicons name="person-outline" size={20} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.officerName}>{selected.officer}</Text>
                    <Text style={styles.officerDept}>{selected.dept}</Text>
                    <Text style={styles.officerBadge}>Badge #{selected.officerBadge}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 3 }}>
                    <Stars count={selected.score} />
                    <Text style={styles.scoreLabel}>{selected.score}/5</Text>
                  </View>
                </View>

                {/* Timeline */}
                <Text style={styles.modalSectionTitle}>Case Timeline</Text>
                <View style={styles.modalTimelineBox}>
                  {[
                    { label: 'Complaint Filed By',          name: selected.complainant, date: selected.filedDate,    time: selected.filedTime,   color: C.danger },
                    { label: 'Officer Assigned & Action',   name: selected.officer,     date: selected.actionDate,   time: selected.actionTime,  color: C.primaryMid },
                    { label: 'Case Marked Resolved',        name: 'System',             date: selected.resolvedDate, time: '',                   color: C.accent },
                  ].map((ev, i) => (
                    <View key={i} style={styles.modalTimelineRow}>
                      <View style={[styles.modalDot, { backgroundColor: ev.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mtLabel}>{ev.label}</Text>
                        <Text style={styles.mtName}>{ev.name}</Text>
                        <Text style={styles.mtDate}>{ev.date}{ev.time ? `  ·  ${ev.time}` : ''}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.resolutionChip}>
                  <Ionicons name="time-outline" size={14} color={C.accent} />
                  <Text style={styles.resolutionText}>
                    Total resolution time: {selected.daysToResolve} days
                  </Text>
                </View>

                {/* Photos */}
                <Text style={styles.modalSectionTitle}>Before & After Evidence</Text>
                <View style={styles.photoRow}>
                  <View style={styles.photoWrap}>
                    <Image source={{ uri: selected.beforePhoto }} style={styles.photoLg} />
                    <View style={[styles.photoTag, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.photoTagText, { color: C.danger }]}>BEFORE</Text>
                    </View>
                  </View>
                  <View style={styles.arrowWrap}>
                    <Ionicons name="arrow-forward" size={20} color={C.accent} />
                  </View>
                  <View style={styles.photoWrap}>
                    <Image source={{ uri: selected.afterPhoto }} style={styles.photoLg} />
                    <View style={[styles.photoTag, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.photoTagText, { color: C.accent }]}>AFTER</Text>
                    </View>
                  </View>
                </View>

                <View style={{ height: 30 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header — green tint for resolved
  header: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#059669',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    borderBottomWidth: 3,
    borderBottomColor: '#34D399',
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
  badgeText:{ fontSize: 10, fontWeight: '800', color: '#A7F3D0', letterSpacing: 1.4 },

  titleBlock:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  headerTitle:   { fontSize: 36, fontWeight: '900', color: '#FFFFFF', lineHeight: 40, letterSpacing: -0.5 },
  resolvedBubble:{
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', gap: 3,
  },
  resolvedNum:   { fontSize: 22, fontWeight: '900', color: '#fff' },
  resolvedLabel: { fontSize: 10, fontWeight: '700', color: '#A7F3D0' },

  statsSummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statLabel:   { fontSize: 10, color: '#A7F3D0', marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.20)' },

  // List
  listContent: { padding: 20, paddingTop: 22 },

  // Card
  card: {
    backgroundColor: C.card, borderRadius: 22, marginBottom: 16,
    flexDirection: 'row', overflow: 'hidden',
    borderWidth: 1, borderColor: C.cardBorder,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10,
  },
  cardAccent: { width: 5 },
  cardBody:   { flex: 1, padding: 16 },

  cardTop:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  caseIdRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  caseId:     { fontSize: 10, color: C.textLow, fontWeight: '800' },
  catBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  catBadgeText:{ fontSize: 10, fontWeight: '800' },
  caseTitle:  { fontSize: 15, fontWeight: '900', color: C.textHigh },
  scorePill:  { alignItems: 'flex-end', gap: 3 },
  scoreNum:   { fontSize: 10, fontWeight: '800', color: C.warning },

  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  metaText: { fontSize: 11, color: C.textLow, fontWeight: '600' },

  // Timeline
  timeline:       { marginBottom: 16 },
  timelineItem:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  timelineDot:    { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  tlConnector:    { width: 2, height: 12, backgroundColor: C.cardBorder, marginLeft: 4, marginVertical: 2 },
  tlLabel:        { fontSize: 9, color: C.textLow, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  tlDate:         { fontSize: 12, fontWeight: '800', color: C.textHigh },
  tlBy:           { fontSize: 10, color: C.textMid, fontWeight: '600' },

  // Photos
  photoSectionLabel: { fontSize: 10, fontWeight: '900', color: C.textLow, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  photoRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  photoWrap:  { flex: 1, position: 'relative' },
  photo:      { width: '100%', height: 90, borderRadius: 14, backgroundColor: C.cardBorder },
  photoLg:    { width: '100%', height: 130, borderRadius: 16, backgroundColor: C.cardBorder },
  arrowWrap:  {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.accentGlow, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.accent + '44',
  },
  photoTag:     { position: 'absolute', bottom: 7, left: 7, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  photoTagText: { fontSize: 9, fontWeight: '900' },

  detailBtn:     { borderRadius: 14, overflow: 'hidden' },
  detailBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 7 },
  detailBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, maxHeight: '92%',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: C.cardBorder, borderRadius: 2, alignSelf: 'center', marginBottom: 22 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  modalId:     { fontSize: 10, color: C.textLow, fontWeight: '800', marginBottom: 3 },
  modalTitle:  { fontSize: 18, fontWeight: '900', color: C.textHigh },
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
  },

  descBox:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14, marginBottom: 20 },
  modalDesc: { flex: 1, fontSize: 13, color: C.textMid, lineHeight: 20 },

  modalSectionTitle: { fontSize: 10, fontWeight: '900', color: C.textLow, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },

  officerBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.primaryGlow, padding: 14, borderRadius: 16,
    marginBottom: 20, borderWidth: 1, borderColor: C.primary + '22',
  },
  officerAvatar: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.primary + '33',
  },
  officerName:  { fontSize: 14, fontWeight: '800', color: C.textHigh },
  officerDept:  { fontSize: 11, color: C.textMid, fontWeight: '600', marginTop: 1 },
  officerBadge: { fontSize: 10, color: C.primaryMid, fontWeight: '700', marginTop: 2 },
  scoreLabel:   { fontSize: 11, fontWeight: '700', color: C.warning },

  modalTimelineBox: { marginBottom: 12 },
  modalTimelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  modalDot:         { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  mtLabel:          { fontSize: 9, color: C.textLow, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  mtName:           { fontSize: 13, fontWeight: '800', color: C.textHigh },
  mtDate:           { fontSize: 11, color: C.textMid, fontWeight: '600' },

  resolutionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.accentGlow, paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12, marginBottom: 22, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: C.accent + '44',
  },
  resolutionText: { fontSize: 12, color: '#16A34A', fontWeight: '700' },
});