import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const OVERDUE_DATA = [
  { id: '882', title: 'Sewage Leakage', officer: 'S. Amrit', delay: '48h Overdue', priority: 'Critical' },
  { id: '901', title: 'Street Light Failure', officer: 'M. Pathak', delay: '24h Overdue', priority: 'High' },
];

export default function Overdue() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* RED ALERT HEADER */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>SLA Breached</Text>
            <Ionicons name="warning" size={24} color="#FECACA" />
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={OVERDUE_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.overdueCard}>
            <View style={styles.statusStrip} />
            <View style={styles.cardBody}>
              <View style={styles.topLine}>
                <Text style={styles.delayLabel}>{item.delay}</Text>
                <View style={styles.priorityBadge}><Text style={styles.priorityText}>{item.priority}</Text></View>
              </View>
              
              <Text style={styles.caseTitle}>{item.title}</Text>
              
              <View style={styles.officerRow}>
                <View style={styles.officerAvatar}>
                   <Ionicons name="person" size={14} color="#EF4444" />
                </View>
                <Text style={styles.officerName}>Assigned to: <Text style={{fontWeight: '800'}}>{item.officer}</Text></Text>
              </View>

              <TouchableOpacity style={styles.escalateBtn}>
                <Ionicons name="notifications-active" size={18} color="white" style={{marginRight: 8}} />
                <Text style={styles.escalateText}>Send Notice to Officer</Text>
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
    backgroundColor: '#EF4444', // Red for urgency
    paddingBottom: 20, 
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25 
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { flex: 1, color: 'white', fontSize: 20, fontWeight: '900', marginLeft: 10 },
  overdueCard: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    marginBottom: 15, 
    flexDirection: 'row', 
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOpacity: 0.1,
  },
  statusStrip: { width: 6, backgroundColor: '#EF4444' },
  cardBody: { flex: 1, padding: 20 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  delayLabel: { color: '#EF4444', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  priorityBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { color: '#EF4444', fontSize: 10, fontWeight: '800' },
  caseTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  officerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  officerAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  officerName: { fontSize: 13, color: '#64748B' },
  escalateBtn: { 
    backgroundColor: '#1E293B', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 14, 
    borderRadius: 15 
  },
  escalateText: { color: 'white', fontWeight: '800', fontSize: 14 }
});