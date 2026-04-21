import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Dimensions, StatusBar, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ─── PERFORMANCE DATA ───
const STATE_PERFORMANCE = [
  { state: 'Punjab', rate: '98.4%', status: 'up' },
  { state: 'Maharashtra', rate: '96.2%', status: 'up' },
  { state: 'Gujarat', rate: '94.8%', status: 'down' },
  { state: 'Tamil Nadu', rate: '92.1%', status: 'up' },
  { state: 'Kerala', rate: '91.5%', status: 'up' },
];

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. NATIONAL ANALYTICS HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSubtitle}>National Command Centre</Text>
            <Text style={styles.headerTitle}>System Analytics</Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>LIVE AUDIT</Text>
          </View>
        </View>
        
        <View style={styles.quickMetrics}>
          <View style={styles.metric}>
            <Text style={styles.metricVal}>98.2%</Text>
            <Text style={styles.metricLabel}>Avg. Resolution</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricVal}>3.2 Days</Text>
            <Text style={styles.metricLabel}>Response Time</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricVal}>14,205</Text>
            <Text style={styles.metricLabel}>Total Fixed</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 2. TOP PERFORMING STATES (Leaderboard) */}
        <Text style={styles.sectionLabel}>State-Wise Resolution Rate</Text>
        <View style={styles.card}>
          {STATE_PERFORMANCE.map((item, index) => (
            <View key={index} style={styles.stateRow}>
              <View style={styles.stateRankBox}>
                <Text style={styles.stateRankText}>{index + 1}</Text>
              </View>
              <Text style={styles.stateNameText}>{item.state}</Text>
              <View style={styles.rateContainer}>
                <Text style={styles.rateText}>{item.rate}</Text>
                <Ionicons 
                  name={item.status === 'up' ? "trending-up" : "trending-down"} 
                  size={16} 
                  color={item.status === 'up' ? "#22C55E" : "#EF4444"} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* 3. OFFICER RANKING (High Efficiency) */}
        <Text style={styles.sectionLabel}>Top Performing Officers</Text>
        <View style={styles.card}>
          <PerformanceRow rank={1} name="Insp. Amanpreet Singh" region="Ludhiana" score="4.9" />
          <PerformanceRow rank={2} name="Insp. Vikram Rathore" region="Pune" score="4.8" />
          <PerformanceRow rank={3} name="S. Priya Sharma" region="Noida" score="4.7" />
        </View>

        {/* 4. FINAL COMPLIANCE TERMINAL */}
        <Text style={styles.sectionLabel}>System Audit & Compliance</Text>
        <View style={styles.terminalCard}>
          <View style={styles.terminalHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#1E3A8A" />
            <Text style={styles.terminalTitle}>Integrity Archive</Text>
          </View>

          <View style={styles.archiveList}>
            <ArchiveItem title="National Grievance Report" date="April 2026" status="VERIFIED" />
            <ArchiveItem title="Officer Conduct Audit" date="Q1 Summary" status="SIGNED" />
          </View>

          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>GENERATE COMPLIANCE CERTIFICATE</Text>
            <Ionicons name="document-text-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SYSTEM FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.version}>v4.0.2 Command Interface</Text>
          <Text style={styles.syncStatus}>Encryption: AES-256 Active</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS ---

const PerformanceRow = ({ rank, name, region, score }: any) => (
  <View style={styles.perfRow}>
    <View style={styles.rankCircle}><Text style={styles.rankNum}>{rank}</Text></View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.perfName}>{name}</Text>
      <Text style={styles.perfRegion}>{region} Jurisdiction</Text>
    </View>
    <View style={styles.perfScore}>
      <Ionicons name="star" size={12} color="#F59E0B" />
      <Text style={styles.perfScoreText}>{score}</Text>
    </View>
  </View>
);

const ArchiveItem = ({ title, date, status }: any) => (
  <View style={styles.archiveRow}>
    <View>
      <Text style={styles.archiveMain}>{title}</Text>
      <Text style={styles.archiveSub}>{date}</Text>
    </View>
    <View style={styles.statusBadge}>
      <Text style={styles.statusBadgeText}>{status}</Text>
    </View>
  </View>
);

// --- STYLES ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 50 },
  
  header: { 
    backgroundColor: '#1E3A8A', 
    padding: 25, 
    paddingTop: Platform.OS === 'ios' ? 50 : 60,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 10
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSubtitle: { color: '#BFDBFE', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '900' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 6 },
  liveText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  
  quickMetrics: { flexDirection: 'row', marginTop: 25, backgroundColor: 'rgba(0,0,0,0.25)', padding: 18, borderRadius: 25 },
  metric: { flex: 1, alignItems: 'center' },
  metricVal: { color: '#fff', fontSize: 16, fontWeight: '900' },
  metricLabel: { color: '#93C5FD', fontSize: 9, marginTop: 4, fontWeight: '700' },
  vDivider: { width: 1, height: '70%', backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'center' },

  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#94A3B8', marginLeft: 25, marginTop: 30, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  
  stateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  stateRankBox: { width: 28, height: 28, backgroundColor: '#F1F5F9', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  stateRankText: { fontSize: 12, fontWeight: '900', color: '#1E3A8A' },
  stateNameText: { flex: 1, marginLeft: 15, fontSize: 14, fontWeight: '800', color: '#334155' },
  rateContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rateText: { fontSize: 14, fontWeight: '900', color: '#1E3A8A' },

  perfRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  rankCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center' },
  rankNum: { color: 'white', fontSize: 10, fontWeight: '900' },
  perfName: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  perfRegion: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  perfScore: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  perfScoreText: { fontSize: 12, fontWeight: '900', color: '#D97706', marginLeft: 4 },

  terminalCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 25, padding: 20, borderLeftWidth: 8, borderLeftColor: '#1E3A8A', elevation: 5 },
  terminalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  terminalTitle: { fontSize: 16, fontWeight: '900', color: '#1E3A8A' },
  archiveList: {},
  archiveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  archiveMain: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  archiveSub: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  statusBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 9, fontWeight: '900', color: '#10B981' },
  exportBtn: { backgroundColor: '#1E3A8A', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 18, gap: 10, marginTop: 10 },
  exportText: { color: '#fff', fontWeight: '900', fontSize: 12 },

  footer: { marginTop: 40, alignItems: 'center' },
  version: { fontSize: 11, color: '#CBD5E1', fontWeight: '800' },
  syncStatus: { fontSize: 9, color: '#94A3B8', marginTop: 4, fontWeight: '700' }
});
