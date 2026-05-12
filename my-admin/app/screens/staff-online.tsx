/**
 * FILE: app/screens/staff-online.tsx
 *
 * Field Force Monitor — shows live officer status, current assignment,
 * solved/incomplete counts, and links to their personal history log.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, Image, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const STAFF_DATA = [
  {
    id: '1',
    name: 'Insp. Amandeep Singh',
    role: 'Zonal Lead – Jalandhar West',
    status: 'Active',
    dept: 'PWD – Roads Division',
    badge: 'PB-4421',
    phone: '+91 98765 43210',
    currentTask: '#GRV-1024 — Road Repair, GT Road',
    taskSince: '2 hrs ago',
    solved: 142,
    incomplete: 3,
    overdueCount: 1,
    avgScore: 4.8,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: 'GT Road, Ludhiana',
  },
  {
    id: '2',
    name: 'Officer Priya Sharma',
    role: 'Field Officer – Sanitation',
    status: 'On Break',
    dept: 'MSEDCL – Urban Grid',
    badge: 'MH-1102',
    phone: '+91 91234 56789',
    currentTask: 'None assigned',
    taskSince: '—',
    solved: 89,
    incomplete: 1,
    overdueCount: 0,
    avgScore: 4.5,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    location: 'Pune HQ',
  },
  {
    id: '3',
    name: 'Sgt. Vikram Rathore',
    role: 'Safety & Traffic Monitor',
    status: 'Active',
    dept: 'Municipal Corp – Sanitation',
    badge: 'CH-0089',
    phone: '+91 97300 12345',
    currentTask: '#GRV-1088 — Signal Failure, Sector 7',
    taskSince: '45 mins ago',
    solved: 210,
    incomplete: 12,
    overdueCount: 5,
    avgScore: 3.9,
    image: 'https://randomuser.me/api/portraits/men/54.jpg',
    location: 'Sector 7, Chandigarh',
  },
  {
    id: '4',
    name: 'Insp. Gurpreet Kaur',
    role: 'Water & Utilities Lead',
    status: 'Offline',
    dept: 'CWSS – Pipeline Maintenance',
    badge: 'PB-3310',
    phone: '+91 70011 55566',
    currentTask: 'None assigned',
    taskSince: '—',
    solved: 67,
    incomplete: 6,
    overdueCount: 3,
    avgScore: 4.1,
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    location: 'Offline',
  },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; dot: string }> = {
  Active:    { color: '#16A34A', bg: '#DCFCE7', dot: '#4ADE80' },
  'On Break':{ color: '#D97706', bg: '#FEF3C7', dot: '#FBBF24' },
  Offline:   { color: '#64748B', bg: '#F1F5F9', dot: '#94A3B8' },
};

// ─── Blinking dot for live indicator ─────────────────────────────────────────
function BlinkDot() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.liveDot, { opacity: anim }]} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StaffOnline() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'On Break' | 'Offline'>('ALL');

  const activeCount = STAFF_DATA.filter(s => s.status === 'Active').length;

  const filtered = STAFF_DATA.filter(s =>
    statusFilter === 'ALL' ? true : s.status === statusFilter
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={26} color="white" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.headerLabel}>REAL-TIME</Text>
              <Text style={styles.headerTitle}>Field Force Monitor</Text>
            </View>
            <View style={styles.liveChip}>
              <BlinkDot />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{STAFF_DATA.length}</Text>
              <Text style={styles.statLbl}>Total Officers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#4ADE80' }]}>{activeCount}</Text>
              <Text style={styles.statLbl}>On Field</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#FBBF24' }]}>
                {STAFF_DATA.filter(s => s.status === 'On Break').length}
              </Text>
              <Text style={styles.statLbl}>On Break</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#94A3B8' }]}>
                {STAFF_DATA.filter(s => s.status === 'Offline').length}
              </Text>
              <Text style={styles.statLbl}>Offline</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ── FILTER ── */}
      <View style={styles.filterRow}>
        {(['ALL', 'Active', 'On Break', 'Offline'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setStatusFilter(f)}
            style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
          >
            {f !== 'ALL' && (
              <View style={[
                styles.filterDot,
                { backgroundColor: STATUS_CONFIG[f]?.dot ?? '#94A3B8' }
              ]} />
            )}
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f === 'ALL' ? 'All' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── STAFF LIST ── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const sc = STATUS_CONFIG[item.status];
          return (
            <View style={styles.card}>
              {/* Top row */}
              <View style={styles.topRow}>
                <Image source={{ uri: item.image }} style={styles.avatar} />
                <View style={styles.infoCol}>
                  <Text style={styles.staffName}>{item.name}</Text>
                  <Text style={styles.staffRole}>{item.role}</Text>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badgeText}>#{item.badge}</Text>
                    <Text style={styles.deptText}>{item.dept}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
                  <Text style={[styles.statusLabel, { color: sc.color }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Current Assignment */}
              <View style={styles.assignBox}>
                <View style={styles.assignHeader}>
                  <Text style={styles.assignLabel}>Current Assignment</Text>
                  {item.taskSince !== '—' && (
                    <Text style={styles.taskSince}>{item.taskSince}</Text>
                  )}
                </View>
                <View style={styles.taskRow}>
                  <Ionicons
                    name={item.currentTask === 'None assigned' ? 'remove-circle-outline' : 'document-text'}
                    size={14}
                    color={item.currentTask === 'None assigned' ? '#94A3B8' : '#1E3A8A'}
                  />
                  <Text style={[
                    styles.taskText,
                    { color: item.currentTask === 'None assigned' ? '#94A3B8' : '#1E3A8A' }
                  ]}>
                    {item.currentTask}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color="#94A3B8" />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              </View>

              {/* Performance stats */}
              <View style={styles.perfRow}>
                <View style={styles.perfItem}>
                  <Text style={[styles.perfNum, { color: '#22C55E' }]}>{item.solved}</Text>
                  <Text style={styles.perfLbl}>Solved</Text>
                </View>
                <View style={styles.perfDivider} />
                <View style={styles.perfItem}>
                  <Text style={[styles.perfNum, { color: '#EF4444' }]}>{item.incomplete}</Text>
                  <Text style={styles.perfLbl}>Incomplete</Text>
                </View>
                <View style={styles.perfDivider} />
                <View style={styles.perfItem}>
                  <Text style={[
                    styles.perfNum,
                    { color: item.overdueCount > 0 ? '#F59E0B' : '#94A3B8' }
                  ]}>
                    {item.overdueCount}
                  </Text>
                  <Text style={styles.perfLbl}>Overdue</Text>
                </View>
                <View style={styles.perfDivider} />
                <View style={styles.perfItem}>
                  <Text style={[styles.perfNum, { color: '#FBBF24' }]}>
                    {item.avgScore}★
                  </Text>
                  <Text style={styles.perfLbl}>Rating</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.historyBtn}
                  onPress={() => router.push('/screens/staff-history')}
                >
                  <Ionicons name="time-outline" size={15} color="white" />
                  <Text style={styles.historyBtnText}>View History</Text>
                  <Ionicons name="chevron-forward" size={13} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.callBtn}>
                  <Ionicons name="call-outline" size={16} color="#1E3A8A" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    backgroundColor: '#1E3A8A',
    paddingBottom: 18,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    borderBottomWidth: 4, borderColor: '#3B82F6', elevation: 10,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 12,
  },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 6, borderRadius: 10 },
  headerLabel: { color: '#93C5FD', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(74,222,128,0.2)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  liveText: { color: '#4ADE80', fontSize: 11, fontWeight: '900' },

  statsRow: {
    flexDirection: 'row', marginTop: 16, marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16,
    padding: 12, justifyContent: 'space-between',
  },
  statBox: { alignItems: 'center', flex: 1 },
  statNum: { color: 'white', fontSize: 20, fontWeight: '900' },
  statLbl: { color: '#93C5FD', fontSize: 10, fontWeight: '700', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Filter
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 6, gap: 8,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#E2E8F0',
  },
  filterChipActive: { backgroundColor: '#1E3A8A' },
  filterDot: { width: 7, height: 7, borderRadius: 4 },
  filterText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  filterTextActive: { color: 'white' },

  listContent: { padding: 18, paddingTop: 10 },

  // Card
  card: {
    backgroundColor: 'white', borderRadius: 22, padding: 16,
    marginBottom: 14, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8,
  },

  topRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatar: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#E2E8F0' },
  infoCol: { flex: 1, marginLeft: 12 },
  staffName: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
  staffRole: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 1 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 3, flexWrap: 'wrap' },
  badgeText: { fontSize: 10, color: '#3B82F6', fontWeight: '800' },
  deptText: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },

  // Assignment box
  assignBox: {
    backgroundColor: '#F8FAFC', borderRadius: 14,
    padding: 12, marginBottom: 12,
  },
  assignHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  assignLabel: { fontSize: 9, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  taskSince: { fontSize: 10, color: '#3B82F6', fontWeight: '700' },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  taskText: { fontSize: 13, fontWeight: '700', flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },

  // Performance
  perfRow: {
    flexDirection: 'row', backgroundColor: '#F8FAFC',
    borderRadius: 14, padding: 12, marginBottom: 12,
    justifyContent: 'space-between',
  },
  perfItem: { alignItems: 'center', flex: 1 },
  perfNum: { fontSize: 16, fontWeight: '900' },
  perfLbl: { fontSize: 9, color: '#94A3B8', fontWeight: '700', marginTop: 2 },
  perfDivider: { width: 1, backgroundColor: '#E2E8F0' },

  // Actions
  actionRow: { flexDirection: 'row', gap: 10 },
  historyBtn: {
    flex: 1, backgroundColor: '#1E3A8A', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 14,
    borderBottomWidth: 2, borderColor: '#3B82F6',
  },
  historyBtnText: { color: 'white', fontWeight: '900', fontSize: 13 },
  callBtn: {
    width: 46, backgroundColor: '#EFF6FF', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#DBEAFE',
  },
});