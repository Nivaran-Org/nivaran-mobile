/**
 * FILE: app/screens/staff-history.tsx
 *
 * Officer's personal history log — shows all past cases, scores,
 * status filters, and links to full case detail view.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const HISTORY_DATA = [
  {
    id: 'GRV-1001',
    task: 'Broken Pipe Repair',
    date: '12 April, 2026',
    filedDate: '01 April, 2026',
    actionDate: '12 April, 2026',
    status: 'Solved',
    location: 'Model Town, Ludhiana',
    category: 'Water Supply',
    score: 5,
    daysToResolve: 11,
    daySpan: '7 Days',
    beforePhoto: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=500',
    afterPhoto: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=500',
  },
  {
    id: 'GRV-2018',
    task: 'Illegal Hoarding Removal',
    date: '10 April, 2026',
    filedDate: '08 April, 2026',
    actionDate: '—',
    status: 'Incomplete',
    location: 'GT Road, Ludhiana',
    category: 'Infrastructure',
    score: 0,
    daysToResolve: 0,
    daySpan: '', // officer didn't fill
    beforePhoto: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=500',
    afterPhoto: '',
  },
  {
    id: 'GRV-1003',
    task: 'Street Light Fix',
    date: '08 April, 2026',
    filedDate: '28 March, 2026',
    actionDate: '08 April, 2026',
    status: 'Solved',
    location: 'Rama Mandi, Ludhiana',
    category: 'Electricity',
    score: 4,
    daysToResolve: 11,
    daySpan: '5 Days',
    beforePhoto: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500',
    afterPhoto: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=500',
  },
  {
    id: 'GRV-1004',
    task: 'Drainage Cleaning',
    date: '05 April, 2026',
    filedDate: '25 March, 2026',
    actionDate: '05 April, 2026',
    status: 'Solved',
    location: 'Central Market, Chandigarh',
    category: 'Sanitation',
    score: 5,
    daysToResolve: 11,
    daySpan: '4 Days',
    beforePhoto: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=500',
    afterPhoto: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500',
  },
  {
    id: 'GRV-2031',
    task: 'Pothole – Highway Stretch',
    date: '02 April, 2026',
    filedDate: '20 March, 2026',
    actionDate: '—',
    status: 'Incomplete',
    location: 'GT Road Near Bypass',
    category: 'Roads',
    score: 0,
    daysToResolve: 0,
    daySpan: '',
    beforePhoto: 'https://images.unsplash.com/photo-1584776296974-382efaa422b8?q=80&w=500',
    afterPhoto: '',
  },
];

const FILTERS = ['All', 'Solved', 'Incomplete'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  'Water Supply': '#3B82F6',
  Electricity:   '#F59E0B',
  Sanitation:    '#22C55E',
  Roads:         '#EF4444',
  Infrastructure:'#8B5CF6',
};

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= count ? 'star' : 'star-outline'}
          size={11}
          color={i <= count ? '#F59E0B' : '#E2E8F0'}
        />
      ))}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StaffHistory() {
  const router = useRouter();
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All');

  const filteredData = HISTORY_DATA.filter(item =>
    filter === 'All' ? true : item.status === filter
  );

  const solvedCount = HISTORY_DATA.filter(h => h.status === 'Solved').length;
  const incompleteCount = HISTORY_DATA.filter(h => h.status === 'Incomplete').length;
  const avgScore = (
    HISTORY_DATA.filter(h => h.score > 0).reduce((s, h) => s + h.score, 0) /
    HISTORY_DATA.filter(h => h.score > 0).length
  ).toFixed(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={26} color="white" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerLabel}>OFFICER PERFORMANCE LOG</Text>
              <Text style={styles.headerTitle}>Case History</Text>
              <Text style={styles.headerSub}>Insp. Amandeep Singh  •  PB-4421</Text>
            </View>
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() => Alert.alert('Export', 'Generating PDF report...')}
            >
              <Ionicons name="download-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Performance snapshot */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{HISTORY_DATA.length}</Text>
              <Text style={styles.statLbl}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#4ADE80' }]}>{solvedCount}</Text>
              <Text style={styles.statLbl}>Solved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#FCA5A5' }]}>{incompleteCount}</Text>
              <Text style={styles.statLbl}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#FDE68A' }]}>{avgScore}★</Text>
              <Text style={styles.statLbl}>Avg Score</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ── FILTER TABS ── */}
      <View style={styles.filterBar}>
        {FILTERS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.activeTab]}
            onPress={() => setFilter(tab)}
          >
            {tab !== 'All' && (
              <View style={[
                styles.filterDot,
                { backgroundColor: tab === 'Solved' ? '#22C55E' : '#EF4444' }
              ]} />
            )}
            <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>
              {tab} {tab !== 'All' && `(${HISTORY_DATA.filter(h => h.status === tab).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── LIST ── */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSolved = item.status === 'Solved';
          const catColor = CATEGORY_COLORS[item.category] ?? '#3B82F6';

          return (
            <View style={[
              styles.historyCard,
              { borderLeftColor: isSolved ? '#22C55E' : '#EF4444' }
            ]}>
              {/* Top row */}
              <View style={styles.cardTop}>
                <View style={[styles.catDot, { backgroundColor: `${catColor}20` }]}>
                  <View style={[styles.catDotInner, { backgroundColor: catColor }]} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.caseId}>{item.id}  •  {item.category}</Text>
                  <Text style={styles.taskTitle}>{item.task}</Text>
                </View>

                {isSolved ? (
                  <View style={styles.scoreBadge}>
                    <Stars count={item.score} />
                    <Text style={styles.scoreText}>{item.score}/5</Text>
                  </View>
                ) : (
                  <View style={styles.incompleteBadge}>
                    <Ionicons name="alert-circle" size={12} color="#EF4444" />
                    <Text style={styles.incompleteText}>PENDING</Text>
                  </View>
                )}
              </View>

              {/* Location & Dates */}
              <View style={styles.metaSection}>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={12} color="#94A3B8" />
                  <Text style={styles.metaText}>{item.location}</Text>
                </View>
                <View style={styles.datesRow}>
                  <View style={styles.dateChip}>
                    <Ionicons name="create-outline" size={11} color="#64748B" />
                    <Text style={styles.dateLabel}>Filed:</Text>
                    <Text style={styles.dateValue}>{item.filedDate}</Text>
                  </View>
                  <View style={styles.dateChip}>
                    <Ionicons
                      name={isSolved ? 'checkmark-circle-outline' : 'remove-circle-outline'}
                      size={11}
                      color={isSolved ? '#22C55E' : '#94A3B8'}
                    />
                    <Text style={styles.dateLabel}>Action:</Text>
                    <Text style={[
                      styles.dateValue,
                      { color: isSolved ? '#22C55E' : '#94A3B8' }
                    ]}>
                      {item.actionDate}
                    </Text>
                  </View>
                </View>

                {/* Day span */}
                <View style={styles.daySpanRow}>
                  <Ionicons
                    name={item.daySpan ? 'time-outline' : 'alert-circle-outline'}
                    size={12}
                    color={item.daySpan ? '#22C55E' : '#F59E0B'}
                  />
                  <Text style={[
                    styles.daySpanText,
                    { color: item.daySpan ? '#22C55E' : '#F59E0B' }
                  ]}>
                    {item.daySpan
                      ? `Estimated Day Span: ${item.daySpan}`
                      : 'Day span not provided by officer'}
                  </Text>
                </View>
              </View>

              {/* Resolution time if solved */}
              {isSolved && item.daysToResolve > 0 && (
                <View style={styles.resolvedChip}>
                  <Ionicons name="checkmark-done" size={12} color="#16A34A" />
                  <Text style={styles.resolvedChipText}>
                    Resolved in {item.daysToResolve} days
                  </Text>
                </View>
              )}

              {/* View button */}
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => router.push('/screens/case-details')}
              >
                <Ionicons name="eye-outline" size={14} color="#1E3A8A" />
                <Text style={styles.viewBtnText}>View Full Case</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="documents-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyText}>No cases found.</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    backgroundColor: '#1E3A8A', paddingBottom: 18,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    borderBottomWidth: 4, borderColor: '#3B82F6', elevation: 10,
  },
  headerContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 12,
  },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 6, borderRadius: 10 },
  titleContainer: { flex: 1, marginLeft: 12 },
  headerLabel: { color: '#93C5FD', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  headerSub: { color: '#BFDBFE', fontSize: 11, fontWeight: '600', marginTop: 1 },
  exportBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 10, borderRadius: 12,
  },

  statsRow: {
    flexDirection: 'row', marginTop: 16, marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16,
    padding: 12, justifyContent: 'space-between',
  },
  statBox: { alignItems: 'center', flex: 1 },
  statNum: { color: 'white', fontSize: 18, fontWeight: '900' },
  statLbl: { color: '#93C5FD', fontSize: 10, fontWeight: '700', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Filter
  filterBar: {
    flexDirection: 'row', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 6, gap: 8,
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#E2E8F0',
  },
  activeTab: { backgroundColor: '#1E3A8A' },
  filterDot: { width: 7, height: 7, borderRadius: 4 },
  tabText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  activeTabText: { color: 'white' },

  listContent: { padding: 18, paddingTop: 8 },

  // Card
  historyCard: {
    backgroundColor: 'white', borderRadius: 18,
    padding: 14, marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
    borderLeftWidth: 4,
  },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  catDot: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  catDotInner: { width: 10, height: 10, borderRadius: 5 },
  caseId: { fontSize: 9, color: '#94A3B8', fontWeight: '800' },
  taskTitle: { fontSize: 14, fontWeight: '900', color: '#1E293B', marginTop: 1 },

  // Score
  scoreBadge: {
    alignItems: 'flex-end', gap: 2,
    backgroundColor: '#FFFBEB', paddingHorizontal: 8,
    paddingVertical: 5, borderRadius: 10,
    borderWidth: 1, borderColor: '#FEF3C7',
  },
  scoreText: { fontSize: 10, fontWeight: '900', color: '#D97706' },
  incompleteBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEE2E2', paddingHorizontal: 8,
    paddingVertical: 5, borderRadius: 10,
  },
  incompleteText: { fontSize: 10, fontWeight: '900', color: '#EF4444' },

  // Meta
  metaSection: { marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  metaText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  datesRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F8FAFC', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 8,
  },
  dateLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  dateValue: { fontSize: 10, color: '#1E293B', fontWeight: '800' },

  daySpanRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F8FAFC', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start',
  },
  daySpanText: { fontSize: 11, fontWeight: '700' },

  resolvedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#DCFCE7', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 8,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  resolvedChipText: { fontSize: 11, color: '#16A34A', fontWeight: '700' },

  viewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EFF6FF', paddingHorizontal: 14,
    paddingVertical: 9, borderRadius: 12, alignSelf: 'flex-end',
  },
  viewBtnText: { fontSize: 12, fontWeight: '800', color: '#1E3A8A' },

  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '700', marginTop: 12 },
});