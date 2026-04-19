import React from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ─── NEW CASES DATA WITH PRECISION TIMESTAMPS ───
export const NEW_CASES_DATA = [
  {
    id: 'CASE-7702',
    title: 'Major Pothole on Highway',
    category: 'Roads',
    state: 'Punjab',
    district: 'Ludhiana',
    // USER FILING DETAILS
    reportDate: '15 April, 2026',
    reportTime: '10:30 AM',
    // STATUS & OFFICER LOGIC
    status: 'PENDING',
    officerUpdateDate: '',
    officerUpdateTime: '',
    officerRemarks: '',
    targetCompletion: '',
    complaintPhoto: 'https://images.unsplash.com/photo-1599591459413-327593581f98?q=80&w=500',
    userName: 'Amrit Pal',
    userLocation: 'GT Road Near Jalandhar Bypass',
  },
  {
    id: 'CASE-8812',
    title: 'Street Light Not Working',
    category: 'Electricity',
    state: 'Maharashtra',
    district: 'Pune',
    // USER FILING DETAILS
    reportDate: '14 April, 2026',
    reportTime: '09:15 PM',
    // STATUS & OFFICER LOGIC
    status: 'WORKING',
    officerUpdateDate: '15 April, 2026', // When officer wrote the note
    officerUpdateTime: '08:45 AM',
    officerRemarks: 'Technician dispatched for bulb replacement. Supply line checked.',
    targetCompletion: '18 April, 2026',
    complaintPhoto: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=500',
    userName: 'Kiran Deshmukh',
    userLocation: 'Viman Nagar, Lane 4',
  }
];

export default function NewCases() {
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
            <Text style={styles.headerTitle}>Live Tracking Console</Text>
            <View style={styles.livePulse} />
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={NEW_CASES_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.caseCard}>
            
            {/* JURISDICTION & TOP STATUS */}
            <View style={styles.topRow}>
               <View style={styles.jurisdictionBadge}>
                  <Ionicons name="location" size={12} color="#3B82F6" />
                  <Text style={styles.jurisdictionText}>{item.state} • {item.district}</Text>
               </View>
               <View style={[
                 styles.statusBadge, 
                 { backgroundColor: item.status === 'PENDING' ? '#FEE2E2' : '#DCFCE7' }
               ]}>
                 <Text style={[
                   styles.statusText, 
                   { color: item.status === 'PENDING' ? '#EF4444' : '#10B981' }
                 ]}>
                   {item.status}
                 </Text>
               </View>
            </View>

            <Text style={styles.caseTitle}>{item.title}</Text>
            
            {/* USER REPORT TIMESTAMP */}
            <View style={styles.timestampRow}>
               <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
               <Text style={styles.timestampText}>Filed on: {item.reportDate} at {item.reportTime}</Text>
            </View>

            {/* COMPLAINT IMAGE */}
            <View style={styles.imageContainer}>
               <Image source={{ uri: item.complaintPhoto }} style={styles.complaintImg} />
               <View style={styles.imgOverlay}><Text style={styles.imgOverlayText}>CITIZEN PROOF</Text></View>
            </View>

            {/* OFFICER DYNAMIC BOX */}
            <View style={[
              styles.responseBox, 
              { borderColor: item.status === 'PENDING' ? '#EF4444' : '#10B981' }
            ]}>
              {item.status === 'PENDING' ? (
                <View style={styles.pendingContainer}>
                  <Ionicons name="alert-circle" size={22} color="#EF4444" />
                  <View>
                    <Text style={styles.pendingBoldText}>ACTION REQUIRED</Text>
                    <Text style={styles.pendingSubText}>Officer has not acknowledged this case.</Text>
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.officerHeader}>
                     <Text style={styles.workingLabel}>OFFICER IN CHARGE: WORKING</Text>
                     <Text style={styles.updateTime}>Updated: {item.officerUpdateDate} | {item.officerUpdateTime}</Text>
                  </View>
                  
                  <Text style={styles.remarksText}>"{item.officerRemarks}"</Text>
                  
                  <View style={styles.targetRow}>
                    <View style={styles.targetIconBox}>
                        <Ionicons name="checkmark-done-circle" size={16} color="white" />
                    </View>
                    <View>
                        <Text style={styles.targetLabel}>TARGET COMPLETION DATE</Text>
                        <Text style={styles.targetDate}>{item.targetCompletion}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* USER CONTACT DETAILS */}
            <View style={styles.userInfo}>
               <Text style={styles.infoLabel}>REPORTED BY:</Text>
               <Text style={styles.userNameText}>{item.userName} • {item.userLocation}</Text>
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
  livePulse: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ADE80', borderWidth: 2, borderColor: '#1E3A8A' },
  
  caseCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, marginBottom: 20, marginHorizontal: 5, elevation: 5 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jurisdictionBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  jurisdictionText: { fontSize: 10, fontWeight: '900', color: '#3B82F6', marginLeft: 4, textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  
  caseTitle: { fontSize: 19, fontWeight: '900', color: '#1E293B' },
  timestampRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5, marginBottom: 15 },
  timestampText: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  
  imageContainer: { marginBottom: 20, position: 'relative' },
  complaintImg: { width: '100%', height: 180, borderRadius: 20, backgroundColor: '#F1F5F9' },
  imgOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  imgOverlayText: { color: 'white', fontSize: 9, fontWeight: '900' },
  
  responseBox: { padding: 18, borderRadius: 20, borderWidth: 2, backgroundColor: '#FCFDFF', marginBottom: 15 },
  pendingContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pendingBoldText: { color: '#EF4444', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  pendingSubText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  
  officerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  workingLabel: { color: '#059669', fontWeight: '900', fontSize: 10, letterSpacing: 0.5 },
  updateTime: { fontSize: 9, color: '#94A3B8', fontWeight: 'bold' },
  remarksText: { color: '#334155', fontSize: 14, fontWeight: '700', fontStyle: 'italic', lineHeight: 20, marginBottom: 15 },
  
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F0FDF4', padding: 10, borderRadius: 12 },
  targetIconBox: { backgroundColor: '#10B981', padding: 6, borderRadius: 8 },
  targetLabel: { fontSize: 8, fontWeight: '900', color: '#64748B', textTransform: 'uppercase' },
  targetDate: { fontSize: 13, fontWeight: '900', color: '#065F46' },
  
  userInfo: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  infoLabel: { fontSize: 9, fontWeight: '900', color: '#94A3B8', marginBottom: 4 },
  userNameText: { fontSize: 12, color: '#1E293B', fontWeight: '800' }
});