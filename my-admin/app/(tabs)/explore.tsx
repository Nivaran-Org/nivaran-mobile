import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.18.7:5000';

export default function ExploreScreen() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [tab, setTab] = useState<'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [complaintsRes, usersRes] = await Promise.all([
        fetch(`${BASE_URL}/api/complaints`, { headers }),
        fetch(`${BASE_URL}/api/users`, { headers }),
      ]);

      const complaintsData = await complaintsRes.json();
      const usersData = await usersRes.json();

      if (complaintsData.success) setComplaints(complaintsData.data);
      if (usersData.success) {
        setOfficers(usersData.data.filter((u: any) => u.role === 'officer'));
      }
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const assignToOfficer = async (complaintId: number, officerId: number) => {
    setAssigning(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/complaints/${complaintId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ officer_id: officerId }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Complaint assigned successfully');
        setSelectedCase(null);
        loadData();
      } else {
        Alert.alert('Error', data.message || 'Assignment failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Cannot connect to server');
    } finally {
      setAssigning(false);
    }
  };

  const updateStatus = async (complaintId: number, status: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', `Status updated to ${status}`);
        setSelectedCase(null);
        loadData();
      }
    } catch (err) {
      Alert.alert('Error', 'Cannot connect to server');
    }
  };

  const filteredComplaints = complaints.filter(c =>
    tab === 'RESOLVED' ? c.status === 'resolved' : c.status !== 'resolved'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#10B981';
      case 'in progress': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={{ marginTop: 10, color: '#94A3B8' }}>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>Complaint Management</Text>
          <Text style={styles.headerSub}>
            {complaints.length} Total Complaints
          </Text>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {selectedCase ? (
          // CASE DETAIL VIEW
          <View>
            <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedCase(null)}>
              <Ionicons name="arrow-back-circle-sharp" size={26} color="#1E3A8A" />
              <Text style={styles.backBtnText}>Back to Complaints</Text>
            </TouchableOpacity>

            <View style={styles.auditCard}>
              <View style={[styles.statusBanner, { backgroundColor: getStatusColor(selectedCase.status) }]}>
                <Text style={styles.bannerText}>{selectedCase.status.toUpperCase()}</Text>
              </View>

              <View style={styles.auditBody}>
                <Text style={styles.auditTitle}>{selectedCase.title}</Text>

                {/* AI Routing Info */}
                <View style={[styles.infoBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                  <Text style={[styles.infoLabel, { color: '#1E3A8A' }]}>AI ROUTING</Text>
                  <Text style={styles.infoVal}>Department: <Text style={styles.bold}>{selectedCase.department}</Text></Text>
                  <Text style={styles.infoVal}>Confidence: <Text style={styles.bold}>{(selectedCase.ai_confidence * 100).toFixed(1)}%</Text></Text>
                  <Text style={styles.infoVal}>Status: <Text style={styles.bold}>{selectedCase.ai_status}</Text></Text>
                </View>

                {/* Complaint Info */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>COMPLAINT DETAILS</Text>
                  <Text style={styles.infoVal}>ID: <Text style={styles.bold}>#{selectedCase.id}</Text></Text>
                  <Text style={styles.infoVal}>Description: {selectedCase.description}</Text>
                  <Text style={styles.infoVal}>Priority: <Text style={styles.bold}>{selectedCase.priority}</Text></Text>
                  <Text style={styles.infoVal}>Filed: {new Date(selectedCase.created_at).toLocaleDateString()}</Text>
                </View>

                {/* Assignment */}
                <View style={[styles.infoBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                  <Text style={[styles.infoLabel, { color: '#166534' }]}>ASSIGN TO OFFICER</Text>
                  {selectedCase.assigned_to ? (
                    <Text style={styles.infoVal}>Already assigned to Officer #{selectedCase.assigned_to}</Text>
                  ) : officers.length > 0 ? (
                    officers.map((o: any) => (
                      <TouchableOpacity
                        key={o.id}
                        style={styles.officerBtn}
                        onPress={() => assignToOfficer(selectedCase.id, o.id)}
                        disabled={assigning}
                      >
                        {assigning 
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <Text style={styles.officerBtnText}>Assign to {o.name}</Text>
                        }
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.infoVal}>No officers available</Text>
                  )}
                </View>

                {/* Status Update */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>UPDATE STATUS</Text>
                  <View style={styles.statusBtns}>
                    {['pending', 'in progress', 'resolved'].map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusBtn, { backgroundColor: getStatusColor(s) }]}
                        onPress={() => updateStatus(selectedCase.id, s)}
                      >
                        <Text style={styles.statusBtnText}>{s.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          // COMPLAINTS LIST
          <View>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, tab === 'ACTIVE' && styles.tabActiveRed]} 
                onPress={() => setTab('ACTIVE')}
              >
                <Text style={[styles.tabText, tab === 'ACTIVE' && styles.textWhite]}>
                  ACTIVE ({complaints.filter(c => c.status !== 'resolved').length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, tab === 'RESOLVED' && styles.tabActiveGreen]} 
                onPress={() => setTab('RESOLVED')}
              >
                <Text style={[styles.tabText, tab === 'RESOLVED' && styles.textWhite]}>
                  RESOLVED ({complaints.filter(c => c.status === 'resolved').length})
                </Text>
              </TouchableOpacity>
            </View>

            {filteredComplaints.length === 0 ? (
              <Text style={styles.emptyText}>No complaints in this category</Text>
            ) : (
              filteredComplaints.map((c: any) => (
                <TouchableOpacity 
                  key={c.id} 
                  style={[styles.caseRow, { borderLeftColor: getStatusColor(c.status) }]} 
                  onPress={() => setSelectedCase(c)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.caseId}>#{c.id} — {c.department}</Text>
                    <Text style={styles.caseTitle}>{c.title}</Text>
                    <Text style={styles.caseDate}>
                      Confidence: {(c.ai_confidence * 100).toFixed(1)}% · {c.ai_status}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={22} color="#CBD5E1" />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F8FAFC' },
  header:         { backgroundColor: '#1E3A8A', paddingBottom: 25, paddingHorizontal: 20, paddingTop: 10, borderBottomWidth: 5, borderBottomColor: '#3B82F6' },
  headerTitle:    { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  headerSub:      { color: '#93C5FD', fontSize: 10, fontWeight: '800', marginTop: 4 },
  scroll:         { padding: 15, paddingBottom: 40 },
  backBtn:        { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtnText:    { color: '#1E3A8A', fontWeight: '800', marginLeft: 8, fontSize: 13 },
  emptyText:      { textAlign: 'center', color: '#94A3B8', marginTop: 40, fontWeight: '700' },

  tabContainer:   { flexDirection: 'row', backgroundColor: '#E2E8F0', padding: 4, borderRadius: 12, marginBottom: 20 },
  tab:            { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabText:        { fontSize: 10, fontWeight: '900', color: '#64748B' },
  tabActiveRed:   { backgroundColor: '#EF4444' },
  tabActiveGreen: { backgroundColor: '#10B981' },
  textWhite:      { color: 'white' },

  caseRow:        { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 10, borderLeftWidth: 6, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  caseId:         { fontSize: 9, fontWeight: '900', color: '#94A3B8' },
  caseTitle:      { fontSize: 15, fontWeight: '900', color: '#1E293B', marginVertical: 2 },
  caseDate:       { fontSize: 10, color: '#64748B', fontWeight: '700' },

  auditCard:      { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', elevation: 5 },
  statusBanner:   { paddingVertical: 10, alignItems: 'center' },
  bannerText:     { color: 'white', fontWeight: '900', letterSpacing: 2, fontSize: 12 },
  auditBody:      { padding: 20 },
  auditTitle:     { fontSize: 20, fontWeight: '900', color: '#1E3A8A', textAlign: 'center', marginBottom: 20 },
  infoBox:        { padding: 15, borderRadius: 15, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  infoLabel:      { fontSize: 9, fontWeight: '900', color: '#64748B', marginBottom: 10, letterSpacing: 1 },
  infoVal:        { fontSize: 12, color: '#334155', marginBottom: 4, fontWeight: '600' },
  bold:           { fontWeight: '900', color: '#1E293B' },

  officerBtn:     { backgroundColor: '#1E3A8A', padding: 12, borderRadius: 10, marginBottom: 8, alignItems: 'center' },
  officerBtnText: { color: 'white', fontWeight: '800', fontSize: 13 },

  statusBtns:     { flexDirection: 'row', gap: 8, marginTop: 5 },
  statusBtn:      { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  statusBtnText:  { color: 'white', fontSize: 9, fontWeight: '900' },
});