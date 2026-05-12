import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── FULL NATIONAL DIRECTORY: 28 STATES ───
const NATIONAL_STRUCTURE: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  "Manipur": ["Imphal", "Churachandpur", "Thoubal"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Kanpur", "Varanasi", "Agra"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Roorkee"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Asansol"]
};

// ─── CASE GENERATOR: PENDING vs WORKING vs RESOLVED ───
const getDistrictCases = (dist: string) => [
  {
    id: `RESOLVED-${dist.substring(0,3).toUpperCase()}-99`,
    title: "Water Pipeline Leakage",
    status: "RESOLVED",
    reportDate: "12 April, 2026",
    reportTime: "10:15 AM",
    solvedDate: "14 April, 2026",
    solvedTime: "02:20 PM",
    officerName: "Engr. Manish Pathak",
    officerRemarks: "Pipeline joint welded and pressure tested. Supply restored.",
    userName: "Sukhwinder Singh",
    userLocation: "Main Market Road"
  },
  {
    id: `WORKING-${dist.substring(0,3).toUpperCase()}-45`,
    title: "Broken Street Light",
    status: "WORKING",
    reportDate: "15 April, 2026",
    reportTime: "09:00 PM",
    targetCompletion: "2 Days (By 17 April)",
    officerName: "Insp. Somesh Tyagi",
    officerRemarks: "Technician dispatched for light-pole replacement.",
    userName: "Ritu Verma",
    userLocation: "Sector 12, Park View"
  },
  {
    id: `PENDING-${dist.substring(0,3).toUpperCase()}-12`,
    title: "Illegal Waste Burning",
    status: "PENDING",
    reportDate: "16 April, 2026",
    reportTime: "07:30 AM",
    userName: "Arjun Mehta",
    userLocation: "Industrial Area Gate 2"
  }
];

export default function ExploreScreen() {
  const [state, setState] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [tab, setTab] = useState<'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const districts = state ? NATIONAL_STRUCTURE[state] : [];
  const cases = district ? getDistrictCases(district) : [];
  const filteredCases = cases.filter(c => tab === 'RESOLVED' ? c.status === 'RESOLVED' : c.status !== 'RESOLVED');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>National Command Console</Text>
          <Text style={styles.headerSub}>
            {state ? `${state} ${district ? `> ${district}` : ''}` : '28 States | 100% District Coverage'}
          </Text>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {state && (
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            if (selectedCase) setSelectedCase(null);
            else if (district) setDistrict(null);
            else setState(null);
          }}>
            <Ionicons name="arrow-back-circle-sharp" size={26} color="#1E3A8A" />
            <Text style={styles.backBtnText}>Back to {district ? state : 'National View'}</Text>
          </TouchableOpacity>
        )}

        {/* 1. STATE GRID (All 28) */}
        {!state && (
          <View style={styles.stateGrid}>
            {Object.keys(NATIONAL_STRUCTURE).map(s => (
              <TouchableOpacity key={s} style={styles.stateCard} onPress={() => setState(s)}>
                <Text style={styles.stateName}>{s}</Text>
                <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 2. DISTRICT LIST */}
        {state && !district && (
          <View>
            <Text style={styles.label}>Select Local Jurisdiction</Text>
            {districts.map(d => (
              <TouchableOpacity key={d} style={styles.districtCard} onPress={() => setDistrict(d)}>
                <Text style={styles.districtName}>{d}</Text>
                <Ionicons name="map" size={18} color="#3B82F6" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 3. CASE TRACKER (Active vs Resolved) */}
        {district && !selectedCase && (
          <View>
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tab, tab === 'ACTIVE' && styles.tabActiveRed]} onPress={() => setTab('ACTIVE')}>
                <Text style={[styles.tabText, tab === 'ACTIVE' && styles.textWhite]}>ACTIVE / PENDING</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, tab === 'RESOLVED' && styles.tabActiveGreen]} onPress={() => setTab('RESOLVED')}>
                <Text style={[styles.tabText, tab === 'RESOLVED' && styles.textWhite]}>RESOLVED ARCHIVE</Text>
              </TouchableOpacity>
            </View>

            {filteredCases.map(c => (
              <TouchableOpacity key={c.id} style={[styles.caseRow, { borderLeftColor: c.status === 'RESOLVED' ? '#10B981' : c.status === 'WORKING' ? '#F59E0B' : '#EF4444' }]} onPress={() => setSelectedCase(c)}>
                <View style={{flex: 1}}>
                  <Text style={styles.caseId}>{c.id}</Text>
                  <Text style={styles.caseTitle}>{c.title}</Text>
                  <Text style={styles.caseDate}>Reported: {c.reportDate}</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={22} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 4. FINAL CASE AUDIT */}
        {selectedCase && (
          <View style={styles.auditCard}>
            <View style={[styles.statusBanner, { backgroundColor: selectedCase.status === 'RESOLVED' ? '#10B981' : selectedCase.status === 'WORKING' ? '#F59E0B' : '#EF4444' }]}>
              <Text style={styles.bannerText}>{selectedCase.status}</Text>
            </View>

            <View style={styles.auditBody}>
              <Text style={styles.auditTitle}>{selectedCase.title}</Text>
              
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>CITIZEN REPORT</Text>
                <Text style={styles.infoVal}>Filed By: <Text style={styles.bold}>{selectedCase.userName}</Text></Text>
                <Text style={styles.infoVal}>Filed On: {selectedCase.reportDate} at {selectedCase.reportTime}</Text>
                <Text style={styles.infoVal}>Location: {selectedCase.userLocation}</Text>
              </View>

              <View style={[styles.infoBox, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                <Text style={[styles.infoLabel, { color: '#0369A1' }]}>OFFICER RESOLUTION</Text>
                {selectedCase.status === 'PENDING' ? (
                  <Text style={styles.pendingAlert}>⚠️ OFFICER HAS NOT VIEWED COMPLAINT</Text>
                ) : (
                  <View>
                    <Text style={styles.infoVal}>Assigned: {selectedCase.officerName}</Text>
                    {selectedCase.status === 'RESOLVED' ? (
                      <Text style={styles.infoVal}>Solved: <Text style={styles.greenText}>{selectedCase.solvedDate} at {selectedCase.solvedTime}</Text></Text>
                    ) : (
                      <Text style={styles.infoVal}>Target: <Text style={styles.yellowText}>{selectedCase.targetCompletion}</Text></Text>
                    )}
                    <Text style={styles.remarksText}>Officer Note: "{selectedCase.officerRemarks}"</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1E3A8A', paddingBottom: 25, paddingHorizontal: 20, paddingTop: 10, borderBottomWidth: 5, borderBottomColor: '#3B82F6' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  headerSub: { color: '#93C5FD', fontSize: 10, fontWeight: '800', marginTop: 4 },
  scroll: { padding: 15 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtnText: { color: '#1E3A8A', fontWeight: '800', marginLeft: 8, fontSize: 13 },
  
  stateGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stateCard: { width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  stateName: { fontSize: 12, fontWeight: '800', color: '#334155' },

  label: { fontSize: 10, fontWeight: '900', color: '#94A3B8', marginBottom: 15, letterSpacing: 1 },
  districtCard: { backgroundColor: 'white', padding: 18, borderRadius: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  districtName: { fontWeight: '900', color: '#1E293B' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', padding: 4, borderRadius: 12, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabText: { fontSize: 10, fontWeight: '900', color: '#64748B' },
  tabActiveRed: { backgroundColor: '#EF4444' },
  tabActiveGreen: { backgroundColor: '#10B981' },
  textWhite: { color: 'white' },

  caseRow: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 10, borderLeftWidth: 6, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  caseId: { fontSize: 9, fontWeight: '900', color: '#94A3B8' },
  caseTitle: { fontSize: 15, fontWeight: '900', color: '#1E293B', marginVertical: 2 },
  caseDate: { fontSize: 10, color: '#64748B', fontWeight: '700' },

  auditCard: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', elevation: 5 },
  statusBanner: { paddingVertical: 10, alignItems: 'center' },
  bannerText: { color: 'white', fontWeight: '900', letterSpacing: 2, fontSize: 12 },
  auditBody: { padding: 20 },
  auditTitle: { fontSize: 20, fontWeight: '900', color: '#1E3A8A', textAlign: 'center', marginBottom: 20 },
  infoBox: { padding: 15, borderRadius: 15, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  infoLabel: { fontSize: 9, fontWeight: '900', color: '#64748B', marginBottom: 10, letterSpacing: 1 },
  infoVal: { fontSize: 12, color: '#334155', marginBottom: 4, fontWeight: '600' },
  bold: { fontWeight: '900', color: '#1E293B' },
  pendingAlert: { color: '#EF4444', fontWeight: '900', textAlign: 'center', marginTop: 5, fontSize: 11 },
  greenText: { color: '#10B981', fontWeight: '900' },
  yellowText: { color: '#B45309', fontWeight: '900' },
  remarksText: { marginTop: 10, padding: 10, backgroundColor: 'white', borderRadius: 8, fontStyle: 'italic', fontSize: 12, color: '#475569', borderWidth: 1, borderColor: '#E2E8F0' }
});