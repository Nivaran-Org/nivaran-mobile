import React from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ─── RESOLVED DATA WITH FULL TIMESTAMP PRECISION ───
export const RESOLVED_DATA = [
  {
    id: 'GRV-1020',
    title: 'Damaged Electric Pole',
    category: 'Electricity',
    isFake: false,
    adminScore: 5,
    state: 'Punjab',
    district: 'Ludhiana',
    // USER FILING DETAILS
    reportDate: '10 April, 2026',
    reportTime: '11:20 AM',
    // OFFICER RESOLUTION DETAILS
    solvedDate: '14 April, 2026',
    solvedTime: '04:45 PM',
    timeTaken: '4 Days',
    // VISUAL EVIDENCE
    complaintPhoto: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=500', 
    resolutionPhoto: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?q=80&w=500', 
    // TEXTUAL DATA
    userName: 'Harman Singh',
    userLocation: 'Phase 7, Industrial Area',
    officerName: 'Insp. Rajesh Kumar',
    officerStation: 'Urban Substation A',
    officerRank: 'Junior Engineer',
    previousWork: '120 Poles Restored'
  },
  {
    id: 'GRV-1002',
    title: 'Garbage Pileup',
    category: 'Sanitation',
    isFake: false,
    adminScore: 4,
    state: 'Maharashtra',
    district: 'Pune',
    // USER FILING DETAILS
    reportDate: '13 April, 2026',
    reportTime: '08:10 AM',
    // OFFICER RESOLUTION DETAILS
    solvedDate: '14 April, 2026',
    solvedTime: '09:00 AM',
    timeTaken: '25 Hours',
    // VISUAL EVIDENCE
    complaintPhoto: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=500',
    resolutionPhoto: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500',
    // TEXTUAL DATA
    userName: 'Sanya Gupta',
    userLocation: 'Model Town, Park Road',
    officerName: 'Sgt. Vikram Rathore',
    officerStation: 'Municipal Zone 4',
    officerRank: 'Sanitation Lead',
    previousWork: 'Clean City Award Winner'
  }
];

export default function ResolvedCases() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>National Archive ({RESOLVED_DATA.length})</Text>
            <Ionicons name="shield-checkmark-sharp" size={24} color="#4ADE80" />
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={RESOLVED_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.auditCard}>
            
            {/* JURISDICTION BADGE */}
            <View style={styles.jurisdictionContainer}>
               <Ionicons name="location-sharp" size={14} color="#3B82F6" />
               <Text style={styles.jurisdictionText}>{item.state} • {item.district}</Text>
            </View>

            {/* TOP BAR: ID & TOTAL DURATION */}
            <View style={styles.topBar}>
              <Text style={styles.idLabel}>{item.id} | {item.category}</Text>
              <View style={styles.timeBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.timeText}>Solved in {item.timeTaken}</Text>
              </View>
            </View>

            <Text style={styles.caseHeading}>{item.title}</Text>

            {/* DETAILED TIMELINE (DATES & TIMES) */}
            <View style={styles.timelineRow}>
              <View style={styles.timeNode}>
                <Text style={styles.nodeLabel}>REPORTED</Text>
                <Text style={styles.nodeDate}>{item.reportDate}</Text>
                <Text style={styles.nodeTime}>{item.reportTime}</Text>
              </View>
              <View style={styles.timelineLink} />
              <View style={styles.timeNode}>
                <Text style={styles.nodeLabel}>FIXED</Text>
                <Text style={styles.nodeDate}>{item.solvedDate}</Text>
                <Text style={styles.nodeTime}>{item.solvedTime}</Text>
              </View>
            </View>

            {/* VISUAL AUDIT: PROBLEM VS SOLUTION */}
            <Text style={styles.sectionTitle}>AUDIT EVIDENCE</Text>
            <View style={styles.photoComparison}>
              <View style={styles.photoBox}>
                <View style={styles.imgLabelRed}><Text style={styles.imgLabelText}>ISSUE</Text></View>
                <Image source={{ uri: item.complaintPhoto }} style={styles.auditImg} />
              </View>
              <View style={styles.photoBox}>
                <View style={styles.imgLabelGreen}><Text style={styles.imgLabelText}>FIXED</Text></View>
                <Image source={{ uri: item.resolutionPhoto }} style={styles.auditImg} />
              </View>
            </View>

            {/* IDENTITY SECTION (TEXT ONLY) */}
            <View style={styles.identityRow}>
              <View style={styles.personInfo}>
                <Text style={styles.roleLabel}>CITIZEN REPORTER</Text>
                <Text style={styles.nameText}>{item.userName}</Text>
                <Text style={styles.subText}>{item.userLocation}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.personInfo}>
                <Text style={styles.roleLabel}>OFFICER IN CHARGE</Text>
                <Text style={styles.nameText}>{item.officerName}</Text>
                <Text style={styles.subText}>{item.officerStation}</Text>
                <Text style={styles.rankText}>{item.officerRank}</Text>
              </View>
            </View>

            {/* FOOTER: PERFORMANCE SCORE */}
            <View style={styles.cardFooter}>
               <View style={{ flex: 1 }}>
                  <Text style={styles.historyLabel}>OFFICER TRACK RECORD</Text>
                  <Text style={styles.historyText}>🏆 {item.previousWork}</Text>
               </View>
               <View style={styles.scoreCircle}>
                  <Text style={styles.scoreVal}>{item.adminScore}</Text>
                  <Text style={styles.scoreUnit}>/5</Text>
               </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { backgroundColor: '#1E3A8A', paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 10 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { flex: 1, color: 'white', fontSize: 18, fontWeight: '900', marginLeft: 10 },
  
  auditCard: { backgroundColor: 'white', borderRadius: 25, marginBottom: 20, padding: 20, elevation: 3 },
  jurisdictionContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  jurisdictionText: { fontSize: 11, fontWeight: '800', color: '#3B82F6', marginLeft: 5, textTransform: 'uppercase' },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  idLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  timeText: { fontSize: 10, color: '#059669', fontWeight: '800', marginLeft: 4 },
  
  caseHeading: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 15 },

  timelineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  timeNode: { alignItems: 'center' },
  nodeLabel: { fontSize: 8, fontWeight: '900', color: '#94A3B8', marginBottom: 4 },
  nodeDate: { fontSize: 12, fontWeight: '800', color: '#334155' },
  nodeTime: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  timelineLink: { height: 2, flex: 0.5, backgroundColor: '#CBD5E1', marginHorizontal: 10 },

  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#94A3B8', marginBottom: 10, letterSpacing: 1 },
  photoComparison: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  photoBox: { width: '48%', position: 'relative' },
  imgLabelRed: { position: 'absolute', top: 5, left: 5, zIndex: 1, backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  imgLabelGreen: { position: 'absolute', top: 5, left: 5, zIndex: 1, backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  imgLabelText: { color: 'white', fontSize: 8, fontWeight: '900' },
  auditImg: { width: '100%', height: 110, borderRadius: 15, backgroundColor: '#F1F5F9' },

  identityRow: { flexDirection: 'row', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  personInfo: { flex: 1 },
  roleLabel: { fontSize: 8, fontWeight: '900', color: '#94A3B8', marginBottom: 4 },
  nameText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  subText: { fontSize: 10, color: '#64748B', marginTop: 2 },
  rankText: { fontSize: 9, fontWeight: 'bold', color: '#3B82F6', marginTop: 2 },
  divider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 12 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  historyLabel: { fontSize: 8, fontWeight: '900', color: '#94A3B8', marginBottom: 2 },
  historyText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  scoreCircle: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: '#1E3A8A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  scoreVal: { color: 'white', fontWeight: '900', fontSize: 16 },
  scoreUnit: { color: '#93C5FD', fontWeight: '700', fontSize: 11 }
});