import React from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 1. MOCK DATA: Detailed Officer Profiles
const STAFF_DATA = [
  {
    id: '1',
    name: 'Insp. Amandeep Singh',
    role: 'Zonal Lead - Jalandhar West',
    status: 'Active',
    currentTask: '#GRV-1024: Road Repair',
    solved: 142,
    incomplete: 3,
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '2',
    name: 'Officer Priya Sharma',
    role: 'Field Officer - Sanitation',
    status: 'On Break',
    currentTask: 'None',
    solved: 89,
    incomplete: 1,
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '3',
    name: 'Sgt. Vikram Rathore',
    role: 'Safety & Traffic Monitor',
    status: 'Active',
    currentTask: '#GRV-1088: Signal Failure',
    solved: 210,
    incomplete: 12,
    image: 'https://randomuser.me/api/portraits/men/54.jpg'
  }
];

export default function StaffOnline() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* METALLIC HEADER */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Field Force Monitor</Text>
            <View style={styles.liveIndicator}>
               <View style={styles.liveDot} />
               <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={STAFF_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.staffCard}>
            {/* TOP ROW: Profile & Status */}
            <View style={styles.topRow}>
              <Image source={{ uri: item.image }} style={styles.avatar} />
              <View style={styles.infoCol}>
                <Text style={styles.staffName}>{item.name}</Text>
                <Text style={styles.staffRole}>{item.role}</Text>
              </View>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: item.status === 'Active' ? '#DCFCE7' : '#F1F5F9' }
              ]}>
                <Text style={[
                  styles.statusLabel, 
                  { color: item.status === 'Active' ? '#16A34A' : '#64748B' }
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>

            {/* MIDDLE ROW: Current Assignment */}
            <View style={styles.assignmentBox}>
              <Text style={styles.boxLabel}>Current Assignment</Text>
              <Text style={styles.taskText}>{item.currentTask}</Text>
            </View>

            {/* BOTTOM ROW: Performance Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.solved}</Text>
                <Text style={styles.statLabel}>Solved</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>{item.incomplete}</Text>
                <Text style={styles.statLabel}>Incomplete</Text>
              </View>
              
              {/* UPDATED: Navigates to Staff History Screen */}
              <TouchableOpacity 
                style={styles.viewBtn}
                onPress={() => router.push('/screens/staff-history')}
              >
                <Text style={styles.viewBtnText}>History</Text>
                <Ionicons name="chevron-forward" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#1E3A8A', 
    paddingBottom: 20, 
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25,
    borderBottomWidth: 4,
    borderColor: '#3B82F6',
    elevation: 8
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { flex: 1, color: 'white', fontSize: 20, fontWeight: '900', marginLeft: 10 },
  liveIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 12 
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 6 },
  liveText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  
  staffCard: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10 
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E2E8F0' },
  infoCol: { flex: 1, marginLeft: 12 },
  staffName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  staffRole: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusLabel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  
  assignmentBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 15 },
  boxLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
  taskText: { fontSize: 13, color: '#1E3A8A', fontWeight: '700' },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  statDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0' },
  
  viewBtn: { 
    backgroundColor: '#1E3A8A', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 12,
    borderBottomWidth: 2,
    borderColor: '#3B82F6'
  },
  viewBtnText: { color: 'white', fontSize: 12, fontWeight: '800', marginRight: 4 }
});