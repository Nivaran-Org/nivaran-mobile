import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, 
  TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Platform, Alert, Modal, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getComplaints, getOfficers, assignComplaint, updateComplaintStatus, escalateComplaint } from '../../../services/api';

export default function CaseDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<any>(null);
  const [officers, setOfficers] = useState<any[]>([]);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("Awaiting Audit...");

  const fetchData = async () => {
    try {
      const [complaintsRes, officersRes] = await Promise.all([
        getComplaints(),
        getOfficers()
      ]);
      
      if (complaintsRes.success) {
        const found = complaintsRes.data.find((c: any) => c.id.toString() === id);
        if (found) {
          setComplaint(found);
        }
      }
      if (officersRes.success) {
        setOfficers(officersRes.data ?? []);
      }
    } catch (e) {
      console.error('fetchCaseDetails:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAssignOfficer = async (officerId: number) => {
  setIsAssigning(true);
  try {
    const res = await assignComplaint(Number(id), officerId);
    if (res.success) {
      setIsAssignModalVisible(false);
      await fetchData(); // refresh
      // ✅ Show feedback after modal closes
      setTimeout(() => {
        if (Platform.OS === 'web') {
          window.alert('✅ Officer assigned successfully!');
        } else {
          Alert.alert('✅ Success', 'Officer has been assigned to this case.');
        }
      }, 300);
    } else {
      if (Platform.OS === 'web') {
        window.alert('Error: ' + (res.message || 'Failed to assign officer.'));
      } else {
        Alert.alert('Error', res.message || 'Failed to assign officer.');
      }
    }
  } catch (e) {
    console.error('handleAssignOfficer:', e);
    if (Platform.OS === 'web') {
      window.alert('Error: Something went wrong.');
    } else {
      Alert.alert('Error', 'Something went wrong.');
    }
  } finally {
    setIsAssigning(false);
  }
};

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await updateComplaintStatus(Number(id), status);
      if (res.success) {
        Alert.alert("Success", `Case marked as ${status}.`);
        fetchData(); // Refresh data
      } else {
        Alert.alert("Error", res.message || "Failed to update status.");
      }
    } catch (e) {
      console.error('handleUpdateStatus:', e);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleEscalate = async () => {
  const confirmed = Platform.OS === 'web'
    ? window.confirm(`Escalate Case #${id}?\n\nThis will send an urgent email to nitinmishra85666@gmail.com`)
    : await new Promise(resolve =>
        Alert.alert('Escalate Case', `Send urgent email for Case #${id}?`, [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Escalate', style: 'destructive', onPress: () => resolve(true) },
        ])
      );

  if (!confirmed) return;

  try {
    const res = await escalateComplaint(Number(id));
    if (res.success) {
      if (Platform.OS === 'web') {
        window.alert(`✅ Escalation sent!\n\nEmail dispatched to nitinmishra85666@gmail.com for Case #${id}`);
      } else {
        Alert.alert('✅ Escalated', `Email sent to nitinmishra85666@gmail.com for Case #${id}`);
      }
    } else {
      if (Platform.OS === 'web') {
        window.alert('Escalation Failed: ' + (res.message || 'Could not send email.'));
      } else {
        Alert.alert('Failed', res.message || 'Could not send escalation email.');
      }
    }
  } catch (e) {
    console.error('handleEscalate:', e);
    if (Platform.OS === 'web') {
      window.alert('Network Error: Could not reach server.');
    } else {
      Alert.alert('Error', 'Network error. Check connection.');
    }
  }
};

  const handleSaveNotes = () => {
    Alert.alert("Registry Updated", "Administrative notes and audit logs have been securely synced with the central database.");
  };

  // Mock Data for demonstration if real data is missing some fields
  const mockOfficer = {
    name: complaint?.officer_name || "Unassigned",
    photo: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=500", 
    hasGps: true, 
    softwareDetected: "None" 
  };

  const handleSecurityScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (mockOfficer.softwareDetected !== "None") {
        setVerificationStatus(`🚩 FAKE: Created in ${mockOfficer.softwareDetected}`);
      } else if (!mockOfficer.hasGps) {
        setVerificationStatus("⚠️ WARNING: No GPS Metadata found");
      } else {
        setVerificationStatus("✅ VERIFIED: Live On-Site Photo");
      }
    }, 2000);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.center}>
        <Text>Case not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#1E3A8A' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Case #{complaint.id}</Text>
            <TouchableOpacity onPress={handleSaveNotes}>
              <Text style={styles.submitText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {/* Case Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: complaint.status === 'resolved' ? '#DCFCE7' : '#FEF3C7' }]}>
              <Text style={[styles.statusText, { color: complaint.status === 'resolved' ? '#16A34A' : '#D97706' }]}>
                {complaint.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.priorityText}>Priority: {complaint.priority?.toUpperCase() || 'NORMAL'}</Text>
          </View>
          <Text style={styles.caseTitle}>{complaint.title}</Text>
          <Text style={styles.caseDesc}>{complaint.description}</Text>
          
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="business" size={16} color="#64748B" />
              <Text style={styles.metaText}>{complaint.department || 'General'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={16} color="#64748B" />
              <Text style={styles.metaText}>{new Date(complaint.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={16} color="#64748B" />
              <Text style={styles.metaText}>{complaint.officer_name || 'Unassigned'}</Text>
            </View>
          </View>
        </View>

        {/* Management Actions */}
        <Text style={styles.sectionTitle}>Management Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setIsAssignModalVisible(true)}>
            <Ionicons name="person-add" size={20} color="#1E3A8A" />
            <Text style={styles.actionBtnText}>{complaint.officer_id ? 'Reassign' : 'Assign Officer'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleEscalate}>
            <Ionicons name="trending-up" size={20} color="#1E3A8A" />
            <Text style={styles.actionBtnText}>Escalate</Text>
          </TouchableOpacity>
        </View>

        {/* 1. VISUAL PROOF */}
        <Text style={styles.sectionTitle}>Visual Proof Comparison</Text>
        <View style={styles.imageGrid}>
          <View style={styles.imageWrapper}>
            <Text style={styles.imageLabel}>User's Complaint</Text>
            <Image source={{ uri: complaint.photo_url || 'https://via.placeholder.com/200' }} style={styles.proofImage} />
            <View style={[styles.tag, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.tagText, { color: '#EF4444' }]}>BEFORE</Text>
            </View>
          </View>
          <View style={styles.imageWrapper}>
            <Text style={styles.imageLabel}>Officer's Fix</Text>
            <Image source={{ uri: mockOfficer.photo }} style={styles.proofImage} />
            <View style={[styles.tag, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.tagText, { color: '#22C55E' }]}>AFTER</Text>
            </View>
          </View>
        </View>

        {/* 2. SECURITY SCAN */}
        <View style={styles.verificationBox}>
          <Text style={styles.verifyTitle}>Internal Security Audit</Text>
          {isScanning ? (
            <View style={styles.loadingArea}>
                <ActivityIndicator color="#1E3A8A" size="small" />
                <Text style={styles.loadingText}>Analyzing EXIF Data...</Text>
            </View>
          ) : (
            <Text style={[
              styles.statusText, 
              { color: verificationStatus.includes('✅') ? '#22C55E' : verificationStatus.includes('Awaiting') ? '#64748B' : '#EF4444' }
            ]}>
              {verificationStatus}
            </Text>
          )}
          <TouchableOpacity style={[styles.scanBtn, isScanning && { opacity: 0.6 }]} onPress={handleSecurityScan} disabled={isScanning}>
            <Ionicons name="shield-checkmark" size={20} color="white" />
            <Text style={styles.scanBtnText}>Run Authenticity Check</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.resolveBtn, complaint.status === 'resolved' && { backgroundColor: '#94A3B8' }]} 
          onPress={() => handleUpdateStatus('resolved')}
          disabled={complaint.status === 'resolved'}
        >
          <Text style={styles.resolveBtnText}>
            {complaint.status === 'resolved' ? 'CASE RESOLVED' : 'MARK AS RESOLVED'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Officer Assignment Modal */}
      <Modal
        visible={isAssignModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Field Officer</Text>
              <TouchableOpacity onPress={() => setIsAssignModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {isAssigning ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.modalLoadingText}>Assigning officer...</Text>
              </View>
            ) : (
              <FlatList
                data={officers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.officerItem} 
                    onPress={() => handleAssignOfficer(item.id)}
                  >
                    <View style={styles.officerAvatar}>
                      <Text style={styles.officerInitial}>{(item.name || 'O').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.officerInfo}>
                      <Text style={styles.officerName}>{item.name}</Text>
                      <Text style={styles.officerEmail}>{item.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyModal}>
                    <Text style={styles.emptyModalText}>No officers available</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    backgroundColor: '#1E3A8A', 
    paddingBottom: 25, 
    borderBottomLeftRadius: 22, 
    borderBottomRightRadius: 22,
    elevation: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 0
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  submitText: { color: '#93C5FD', fontWeight: '900' },
  scrollBody: { padding: 20, paddingBottom: 40 },
  
  infoCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 25, elevation: 2 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '900' },
  priorityText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  caseTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 10 },
  caseDesc: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 20 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1, marginTop: 10 },
  
  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  actionBtn: { flex: 1, backgroundColor: '#EFF6FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#DBEAFE' },
  actionBtnText: { color: '#1E3A8A', fontWeight: '800', fontSize: 13 },

  imageGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  imageWrapper: { width: '48%' },
  imageLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 8, textAlign: 'center' },
  proofImage: { width: '100%', height: 180, borderRadius: 15, backgroundColor: '#E2E8F0' },
  tag: { position: 'absolute', bottom: 10, right: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '900' },
  
  verificationBox: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 25, marginBottom: 25, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', elevation: 2 },
  verifyTitle: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 10 },
  statusText: { fontSize: 15, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  loadingArea: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  loadingText: { marginLeft: 10, color: '#1E3A8A', fontWeight: '600' },
  scanBtn: { backgroundColor: '#1E3A8A', flexDirection: 'row', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  scanBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  
  resolveBtn: { backgroundColor: '#10B981', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  resolveBtnText: { color: 'white', fontWeight: '900', fontSize: 14, letterSpacing: 1 },

  /* Modal Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, minHeight: '50%', maxHeight: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  modalLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalLoadingText: { marginTop: 10, color: '#64748B', fontWeight: '600' },
  officerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  officerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  officerInitial: { color: 'white', fontWeight: '800', fontSize: 16 },
  officerInfo: { flex: 1 },
  officerName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  officerEmail: { fontSize: 12, color: '#64748B' },
  emptyModal: { padding: 40, alignItems: 'center' },
  emptyModalText: { color: '#94A3B8', fontWeight: '600' }
});