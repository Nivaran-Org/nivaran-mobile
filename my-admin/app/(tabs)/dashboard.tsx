import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Dimensions, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  // --- MOCK DATA FOR VISUALIZATION ---
  const trendData = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 72 },
    { day: 'Wed', value: 38 },
    { day: 'Thu', value: 85 },
    { day: 'Fri', value: 55 },
    { day: 'Sat', value: 20 },
    { day: 'Sun', value: 15 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. REAL-TIME STATISTICS */}
        <View style={styles.welcomeBox}>
          <Text style={styles.greeting}>Home Base</Text>
          <Text style={styles.subGreeting}>System Performance Summary</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Open" value="142" color="#3B82F6" icon="folder-open" />
          <StatCard label="Pending" value="85" color="#F59E0B" icon="time" />
          <StatCard label="In-Progress" value="112" color="#6366F1" icon="sync" />
          <StatCard label="Resolved" value="942" color="#22C55E" icon="checkmark-done" />
        </View>

        {/* 2. GRIEVANCE TRENDS (Weekly Graph) */}
        <Text style={styles.sectionHeader}>Grievance Trends</Text>
        <View style={styles.chartCard}>
          <View style={styles.barContainer}>
            {trendData.map((item, index) => (
              <View key={index} style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { height: item.value, backgroundColor: item.value > 70 ? '#1E3A8A' : '#94A3B8' }
                  ]} 
                />
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chartFooter}>
            <Text style={styles.footerText}>Average Volume: 48 tickets/day</Text>
          </View>
        </View>

        {/* 3. DEPARTMENT BREAKDOWN */}
        <Text style={styles.sectionHeader}>Department Breakdown</Text>
        <View style={styles.deptCard}>
          <DeptProgress label="Academics" percentage="75%" color="#3B82F6" />
          <DeptProgress label="Infrastructure" percentage="45%" color="#F59E0B" />
          <DeptProgress label="HR / Admin" percentage="22%" color="#6366F1" />
        </View>

        {/* 4. URGENCY FEED */}
        <Text style={styles.sectionHeader}>Urgency Feed (High Priority)</Text>
        <UrgencyItem 
          id="NIV-991" 
          title="Server Outage: Library" 
          time="10m ago" 
          level="EMERGENCY" 
        />
        <UrgencyItem 
          id="NIV-984" 
          title="Water Leak: Hostel B" 
          time="24m ago" 
          level="HIGH" 
        />

      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS ---

const StatCard = ({ label, value, color, icon }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const DeptProgress = ({ label, percentage, color }: any) => (
  <View style={styles.progContainer}>
    <View style={styles.progInfo}>
      <Text style={styles.progLabel}>{label}</Text>
      <Text style={[styles.progPercent, { color }]}>{percentage}</Text>
    </View>
    <View style={styles.progTrack}>
      <View style={[styles.progFill, { width: percentage, backgroundColor: color }]} />
    </View>
  </View>
);

const UrgencyItem = ({ id, title, time, level }: any) => (
  <View style={styles.urgencyCard}>
    <View style={[styles.urgencyLine, { backgroundColor: level === 'EMERGENCY' ? '#EF4444' : '#F59E0B' }]} />
    <View style={styles.urgencyBody}>
      <Text style={styles.urgencyId}>{id} • {time}</Text>
      <Text style={styles.urgencyTitle}>{title}</Text>
    </View>
    <View style={styles.levelBadge}>
      <Text style={[styles.levelText, { color: level === 'EMERGENCY' ? '#EF4444' : '#F59E0B' }]}>{level}</Text>
    </View>
  </View>
);

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 30 },
  welcomeBox: { padding: 25, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  greeting: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  subGreeting: { fontSize: 14, color: '#64748B', marginTop: 4 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, justifyContent: 'space-between' },
  statCard: { width: (width / 2) - 22, backgroundColor: '#fff', padding: 18, borderRadius: 20, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },

  sectionHeader: { fontSize: 14, fontWeight: '900', color: '#334155', marginLeft: 20, marginTop: 15, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  
  chartCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 20, elevation: 3 },
  barContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120 },
  barWrapper: { alignItems: 'center' },
  bar: { width: 14, borderRadius: 7 },
  barLabel: { fontSize: 10, color: '#94A3B8', marginTop: 8, fontWeight: '700' },
  chartFooter: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerText: { fontSize: 12, color: '#64748B', textAlign: 'center' },

  deptCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 20, gap: 18 },
  progContainer: { width: '100%' },
  progInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  progPercent: { fontSize: 14, fontWeight: '900' },
  progTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 4 },

  urgencyCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', elevation: 2 },
  urgencyLine: { width: 5, height: '100%' },
  urgencyBody: { flex: 1, padding: 15 },
  urgencyId: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8' },
  urgencyTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginTop: 2 },
  levelBadge: { paddingRight: 15 },
  levelText: { fontSize: 10, fontWeight: '900' }
});