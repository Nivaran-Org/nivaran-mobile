import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Modal, Image, Dimensions, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AdminDashboard() {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* ─── TOP NAVIGATION BAR ─── */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu-outline" size={28} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.navBrand}>NIVARAN <Text style={styles.adminTag}>ADMIN</Text></Text>
        </View>
        
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.avatar} 
            activeOpacity={0.7}
            onPress={() => setIsProfileVisible(true)}
          >
            <Text style={styles.avatarText}>AD</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ─── WELCOME SECTION ─── */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good Morning, Admin</Text>
          <Text style={styles.subGreeting}>System Status: <Text style={styles.statusOnline}>● Operational</Text></Text>
        </View>

        {/* ─── REAL-TIME STATISTICS (Status Ribbon) ─── */}
        <View style={styles.ribbon}>
           <RibbonItem value="482" label="OPEN" color="#3B82F6" />
           <RibbonItem value="85" label="PENDING" color="#F59E0B" isCenter />
           <RibbonItem value="397" label="RESOLVED" color="#22C55E" />
        </View>

        {/* ─── GRIEVANCE TRENDS (Visual Visualization) ─── */}
        <Text style={styles.sectionHeader}>Grievance Trends (Weekly)</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartYAxis}>
            <Text style={styles.axisLabel}>100</Text>
            <Text style={styles.axisLabel}>50</Text>
            <Text style={styles.axisLabel}>0</Text>
          </View>
          <View style={styles.barContainer}>
            <TrendBar height={60} day="Mon" />
            <TrendBar height={90} day="Tue" active />
            <TrendBar height={40} day="Wed" />
            <TrendBar height={110} day="Thu" />
            <TrendBar height={75} day="Fri" />
          </View>
        </View>

        {/* ─── DEPARTMENT BREAKDOWN (Pie/Progress Style) ─── */}
        <Text style={styles.sectionHeader}>Department Breakdown</Text>
        <View style={styles.deptCard}>
          <DeptProgress label="Academics" value="65%" color="#3B82F6" />
          <DeptProgress label="Infrastructure" value="42%" color="#F59E0B" />
          <DeptProgress label="HR / Admin" value="18%" color="#6366F1" />
        </View>

        {/* ─── URGENCY FEED (High Priority Tickets) ─── */}
        <Text style={styles.sectionHeader}>Urgency Feed</Text>
        <GrievanceItem id="NIV-001" title="Server Downtime: Exams" status="EMERGENCY" color="#EF4444" />
        <GrievanceItem id="NIV-042" title="Water Leakage: Block C" status="HIGH" color="#F59E0B" />

      </ScrollView>

      {/* ─── PROFILE MODAL (Stayed Same) ─── */}
      <Modal animationType="slide" transparent={true} visible={isProfileVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileSheet}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsProfileVisible(false)}>
              <Ionicons name="close-circle" size={30} color="#CBD5E1" />
            </TouchableOpacity>
            <View style={styles.photoFrame}><Text style={styles.avatarTextBig}>AD</Text></View>
            <Text style={styles.profileName}>Admin Name</Text>
            <Text style={styles.profileRole}>Senior Executive • NIVARAN</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={() => setIsProfileVisible(false)}>
              <Text style={styles.logoutText}>Sign Out Securely</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── INTERNAL COMPONENTS ───

const RibbonItem = ({ value, label, color, isCenter }: any) => (
  <View style={[styles.ribbonItem, isCenter && styles.ribbonBorder]}>
    <Text style={[styles.ribbonValue, { color }]}>{value}</Text>
    <Text style={styles.ribbonLabel}>{label}</Text>
  </View>
);

const TrendBar = ({ height: barH, day, active }: any) => (
  <View style={styles.barWrapper}>
    <View style={[styles.bar, { height: barH, backgroundColor: active ? '#1E3A8A' : '#E2E8F0' }]} />
    <Text style={styles.barDay}>{day}</Text>
  </View>
);

const DeptProgress = ({ label, value, color }: any) => (
  <View style={styles.progRow}>
    <View style={styles.progLabelRow}>
      <Text style={styles.progLabel}>{label}</Text>
      <Text style={[styles.progValue, { color }]}>{value}</Text>
    </View>
    <View style={styles.progTrack}>
      <View style={[styles.progFill, { width: value, backgroundColor: color }]} />
    </View>
  </View>
);

const GrievanceItem = ({ id, title, status, color }: any) => (
  <View style={styles.listItem}>
    <View>
      <Text style={styles.caseId}>{id}</Text>
      <Text style={styles.caseTitle}>{title}</Text>
    </View>
    <View style={[styles.badge, { backgroundColor: color + '15' }]}>
      <Text style={[styles.badgeText, { color: color }]}>{status}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  navBar: { height: 65, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  navLeft: { flexDirection: 'row', alignItems: 'center' },
  navBrand: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginLeft: 12 },
  adminTag: { color: '#3B82F6', fontSize: 12 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  notificationDot: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#fff' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 40 },
  welcomeSection: { padding: 20 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subGreeting: { fontSize: 14, color: '#64748B', marginTop: 4 },
  statusOnline: { color: '#22C55E', fontWeight: 'bold' },
  ribbon: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, paddingVertical: 18, elevation: 4 },
  ribbonItem: { flex: 1, alignItems: 'center' },
  ribbonBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' },
  ribbonValue: { fontSize: 22, fontWeight: '900' },
  ribbonLabel: { fontSize: 10, color: '#94A3B8', marginTop: 4, fontWeight: '800' },
  sectionHeader: { fontSize: 13, fontWeight: '900', color: '#334155', marginHorizontal: 22, marginTop: 30, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  chartCard: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'flex-end', elevation: 2 },
  chartYAxis: { justifyContent: 'space-between', height: 120, paddingRight: 15 },
  axisLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold' },
  barContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120 },
  barWrapper: { alignItems: 'center' },
  bar: { width: 30, borderRadius: 6 },
  barDay: { fontSize: 10, marginTop: 8, color: '#64748B', fontWeight: 'bold' },
  deptCard: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 20, gap: 20 },
  progRow: { width: '100%' },
  progLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  progValue: { fontSize: 14, fontWeight: '900' },
  progTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 4 },
  listItem: { backgroundColor: '#fff', marginHorizontal: 20, padding: 18, borderRadius: 20, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  caseId: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8' },
  caseTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  profileSheet: { backgroundColor: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, alignItems: 'center' },
  handle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, marginBottom: 20 },
  closeBtn: { alignSelf: 'flex-end', position: 'absolute', top: 20, right: 20 },
  photoFrame: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarTextBig: { color: '#fff', fontSize: 32, fontWeight: '900' },
  profileName: { fontSize: 22, fontWeight: '900' },
  profileRole: { color: '#3B82F6', marginBottom: 25 },
  logoutBtn: { backgroundColor: '#FEE2E2', width: '100%', padding: 18, borderRadius: 18, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: '900' }
});