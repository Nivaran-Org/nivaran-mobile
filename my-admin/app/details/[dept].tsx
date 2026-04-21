import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Advanced Data Configuration for each department
const DEPT_CONFIG: any = {
  Municipal: {
    color: '#3B82F6', 
    metallic: '#1E3A8A', // Royal Blue
    bg: '#F0F9FF',
    icon: 'business',
    data: [
      { id: 'M1', task: 'Road Repair: Block C', status: 'In Progress', time: '2h ago' },
      { id: 'M2', task: 'Park Maintenance', status: 'Pending', time: '5h ago' }
    ]
  },
  Electricity: {
    color: '#F59E0B',
    metallic: '#78350F', // Metallic Amber
    bg: '#FFFBEB',
    icon: 'flash',
    data: [
      { id: 'E1', task: 'Transformer Sparking', status: 'Emergency', time: '10m ago' },
      { id: 'E2', task: 'Grid Maintenance', status: 'Scheduled', time: 'Tomorrow' }
    ]
  },
  Water: {
    color: '#06B6D4',
    metallic: '#164E63', // Deep Sea Metallic
    bg: '#ECFEFF',
    icon: 'water',
    data: [
      { id: 'W1', task: 'Main Pipeline Leak', status: 'Critical', time: 'Just Now' },
      { id: 'W2', task: 'Supply Pressure Check', status: 'Normal', time: '3h ago' }
    ]
  },
  Security: {
    color: '#6366F1',
    metallic: '#312E81', // Royal Indigo
    bg: '#EEF2FF',
    icon: 'shield-checkmark',
    data: [
      { id: 'S1', task: 'Gate 4 CCTV Down', status: 'Alert', time: '15m ago' },
      { id: 'S2', task: 'Patrol Route Change', status: 'Updated', time: '1h ago' }
    ]
  }
};

export default function DepartmentDetail() {
  const { dept } = useLocalSearchParams();
  const router = useRouter();
  
  // Normalize "Water Dept" title to "Water" for the config
  const selectedKey = dept === "Water Dept" ? "Water" : (dept as string);
  const config = DEPT_CONFIG[selectedKey] || DEPT_CONFIG.Municipal;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: config.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* ROYAL METALLIC HEADER */}
      <View style={[styles.header, { backgroundColor: config.metallic }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{dept} Division</Text>
          <Text style={styles.subtitle}>Official Admin Records</Text>
        </View>
        <Ionicons name={config.icon} size={35} color="rgba(255,255,255,0.3)" />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Active Records</Text>
        
        <FlatList
          data={config.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.glassCard}>
              <View style={[styles.statusLine, { backgroundColor: config.color }]} />
              <View style={styles.cardMain}>
                <Text style={styles.taskText}>{item.task}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.timeText}><Ionicons name="time-outline" /> {item.time}</Text>
                  <Text style={[styles.statusBadge, { color: config.metallic }]}>{item.status}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.arrowCircle}>
                <Ionicons name="arrow-forward" size={18} color={config.metallic} />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 25, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomLeftRadius: 35, 
    borderBottomRightRadius: 35,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1, marginLeft: 15 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748B', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  glassCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 15, 
    flexDirection: 'row', 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05
  },
  statusLine: { width: 5, height: '100%', borderRadius: 10 },
  cardMain: { flex: 1, marginLeft: 15 },
  taskText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  cardFooter: { flexDirection: 'row', marginTop: 8, gap: 15 },
  timeText: { fontSize: 12, color: '#94A3B8' },
  statusBadge: { fontSize: 12, fontWeight: '900' },
  arrowCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }
});