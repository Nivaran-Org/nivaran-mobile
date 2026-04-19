import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, SafeAreaView, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionSquare } from '../../components/ActionSquare'; 
import { useRouter } from 'expo-router';

// 1. IMPORT DATA FROM RESOLVED CASES
import { RESOLVED_DATA } from '../screens/resolved-cases';

export default function AdminHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // 2. DYNAMIC COUNT CALCULATION
  const totalResolvedCount = RESOLVED_DATA ? RESOLVED_DATA.length : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* METALLIC BLUE HEADER */}
      <View style={styles.metallicHeader}>
        <SafeAreaView>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.welcomeText}>Admin Portal</Text>
              <View style={styles.pulseContainer}>
                <View style={styles.pulseDot} />
                <Text style={styles.pulseText}>Live System</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.adminProfileBar}>
              <View style={styles.adminInfoText}>
                <Text style={styles.adminName}>H. Singh</Text>
                <Text style={styles.adminRole}>Super Admin</Text>
              </View>
              <View style={styles.profileIconCircle}>
                <Ionicons name="person" size={18} color="#1E3A8A" />
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        {/* SEARCH BAR */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionLabel}>Track Complaint</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput 
              placeholder="Search ID, Officer, or City..." 
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* 4 ACTION SQUARES */}
        <Text style={styles.sectionLabel}>Priority Monitor</Text>
        <View style={styles.actionGrid}>
          <ActionSquare 
            label="New Cases" 
            count="12" 
            icon="mail-unread" 
            color="#3B82F6" 
            bgColor="#EFF6FF" 
            onPress={() => router.push('/screens/new-cases')} 
          />
          <ActionSquare 
            label="Overdue" 
            count="05" 
            icon="alert-circle" 
            color="#EF4444" 
            bgColor="#FEF2F2" 
            isLate={true} 
            onPress={() => router.push('/screens/overdue')} 
          />
          <ActionSquare 
            label="Staff Online" 
            count="24" 
            icon="people" 
            color="#22C55E" 
            bgColor="#F0FDF4" 
            onPress={() => router.push('/screens/staff-online')} 
          />
          
          {/* 3. DYNAMICALLY UPDATED RESOLVED SQUARE */}
          <ActionSquare 
            label="Resolved" 
            count={totalResolvedCount.toString()} 
            icon="checkmark-done-circle" 
            color="#8B5CF6" 
            bgColor="#F5F3FF" 
            onPress={() => router.push('/screens/resolved-cases')} 
          />
        </View>

        {/* SYSTEM LOG */}
        <View style={styles.activityBox}>
            <Text style={styles.sectionLabel}>System Log</Text>
            <View style={styles.logItem}>
               <Ionicons name="radio-button-on" size={12} color="#22C55E" />
               <Text style={styles.logText}>
                 Successfully archived <Text style={{fontWeight:'bold'}}>{totalResolvedCount}</Text> cases
               </Text>
            </View>
            <View style={styles.logItem}>
               <Ionicons name="radio-button-on" size={12} color="#22C55E" />
               <Text style={styles.logText}>New grievance filed in <Text style={{fontWeight:'bold'}}>Jalandhar</Text></Text>
            </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  metallicHeader: { 
    backgroundColor: '#1E3A8A', paddingHorizontal: 25, paddingBottom: 30, paddingTop: 10,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, borderBottomWidth: 4, borderColor: '#3B82F6' 
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  welcomeText: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  pulseContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 6 },
  pulseText: { fontSize: 10, fontWeight: '700', color: '#93C5FD', textTransform: 'uppercase' },
  adminProfileBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 15 },
  adminInfoText: { marginRight: 10, alignItems: 'flex-end' },
  adminName: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  adminRole: { color: '#93C5FD', fontSize: 10, fontWeight: '600' },
  profileIconCircle: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  scrollBody: { paddingHorizontal: 25, paddingBottom: 40 },
  searchSection: { marginTop: 25, marginBottom: 25 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15 },
  searchBar: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, 
    paddingHorizontal: 15, height: 55, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  activityBox: { marginTop: 10, backgroundColor: '#FFF', padding: 20, borderRadius: 25, elevation: 2 },
  logItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  logText: { fontSize: 13, color: '#475569' }
});