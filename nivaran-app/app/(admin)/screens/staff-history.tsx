import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// MOCK DATA: History of a specific officer
const HISTORY_DATA = [
  { id: '1', task: 'Broken Pipe Repair', date: '12 April, 2026', status: 'Solved', location: 'Model Town', score: '5/5' },
  { id: '2', task: 'Illegal Hoarding', date: '10 April, 2026', status: 'Incomplete', location: 'GT Road', score: 'N/A' },
  { id: '3', task: 'Street Light Fix', date: '08 April, 2026', status: 'Solved', location: 'Rama Mandi', score: '4/5' },
  { id: '4', task: 'Drainage Cleaning', date: '05 April, 2026', status: 'Solved', location: 'Central Market', score: '5/5' },
];

export default function StaffHistory() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  const filteredData = HISTORY_DATA.filter(item => 
    filter === 'All' ? true : item.status === filter
  );

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
            <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>Officer Logs</Text>
                <Text style={styles.headerSub}>Insp. Amandeep Singh</Text>
            </View>
            <TouchableOpacity style={styles.exportBtn}>
              <Ionicons name="download-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterBar}>
        {['All', 'Solved', 'Incomplete'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, filter === tab && styles.activeTab]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <View style={styles.cardLeft}>
               <View style={[styles.statusIndicator, { backgroundColor: item.status === 'Solved' ? '#22C55E' : '#EF4444' }]} />
               <View>
                  <Text style={styles.taskTitle}>{item.task}</Text>
                  <Text style={styles.locationText}>{item.location} • {item.date}</Text>
               </View>
            </View>

            <View style={styles.cardRight}>
                {item.status === 'Solved' ? (
                    <View style={styles.scoreBadge}>
                        <Ionicons name="star" size={10} color="#F59E0B" />
                        <Text style={styles.scoreText}>{item.score}</Text>
                    </View>
                ) : (
                    <Text style={styles.pendingText}>PENDING</Text>
                )}
                <TouchableOpacity onPress={() => router.push('/(admin)/screens/case-details')}>
                   <Ionicons name="eye" size={20} color="#94A3B8" />
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
    borderColor: '#3B82F6'
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  titleContainer: { flex: 1, marginLeft: 15 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  headerSub: { color: '#93C5FD', fontSize: 12, fontWeight: '600' },
  exportBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 10 },
  
  filterBar: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0' },
  activeTab: { backgroundColor: '#1E3A8A' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  activeTabText: { color: 'white' },

  historyCard: { 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 15, 
    borderRadius: 18, 
    marginBottom: 12,
    elevation: 2 
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIndicator: { width: 4, height: 35, borderRadius: 2 },
  taskTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  locationText: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  
  cardRight: { alignItems: 'flex-end', gap: 8 },
  scoreBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFBEB', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  scoreText: { fontSize: 10, fontWeight: '900', color: '#D97706', marginLeft: 4 },
  pendingText: { fontSize: 10, fontWeight: '900', color: '#EF4444' }
});