import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Platform, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getOfficers, getComplaints, createOfficer } from '../../../services/api';

const showAlert = (title: string, msg: string, onOk?: () => void) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n\n${msg}`); onOk?.(); }
  else Alert.alert(title, msg, [{ text: 'OK', onPress: onOk }]);
};

export default function StaffOnline() {
  const router = useRouter();
  const [officers, setOfficers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const fetchData = useCallback(async () => {
    try {
      const [oRes, cRes] = await Promise.all([getOfficers(), getComplaints()]);
      if (oRes.success) setOfficers(oRes.data ?? []);
      if (cRes.success) setComplaints(cRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]));

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      showAlert('Missing Fields', 'All fields are required.');
      return;
    }
    setCreating(true);
    try {
      const res = await createOfficer(form.name, form.email, form.password);
      if (res.success) {
        setModalVisible(false);
        setForm({ name: '', email: '', password: '' });
        showAlert('✅ Officer Created', `${form.name} has been added as a field officer.`, fetchData);
      } else {
        showAlert('Error', res.message || 'Failed to create officer.');
      }
    } catch (e) {
      showAlert('Error', 'Something went wrong.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A8A" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Field Officers ({officers.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={officers}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No officers yet</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyBtnText}>Add First Officer</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const assigned = complaints.filter(c => c.assigned_to === item.id);
          const resolved = assigned.filter(c => c.status === 'resolved').length;
          const active = assigned.filter(c => c.status === 'in_progress').length;
          
          return (
            <TouchableOpacity 
              style={styles.officerCard}
              onPress={() => router.push(`/(admin)/screens/staff-history?id=${item.id}`)}
            >
              <View style={styles.officerTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.officerName}>{item.name}</Text>
                  <Text style={styles.officerEmail}>{item.email}</Text>
                </View>
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{assigned.length}</Text>
                  <Text style={styles.statLbl}>Assigned</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statVal, { color: '#EF4444' }]}>{active}</Text>
                  <Text style={styles.statLbl}>Active</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statVal, { color: '#10B981' }]}>{resolved}</Text>
                  <Text style={styles.statLbl}>Solved</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statVal, { color: '#F59E0B' }]}>
                    {assigned.length > 0 ? Math.round((resolved / assigned.length) * 100) : 0}%
                  </Text>
                  <Text style={styles.statLbl}>Rate</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Create Officer Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Officer</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#94A3B8" value={form.name} onChangeText={t => setForm(f => ({ ...f, name: t }))} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={t => setForm(f => ({ ...f, email: t }))} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#94A3B8" secureTextEntry value={form.password} onChangeText={t => setForm(f => ({ ...f, password: t }))} />
            <TouchableOpacity style={[styles.createBtn, creating && { opacity: 0.7 }]} onPress={handleCreate} disabled={creating}>
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnText}>Create Officer Account</Text>}
            </TouchableOpacity>
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
    backgroundColor: '#1E3A8A', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 20, paddingTop: Platform.OS === 'android' ? 50 : 60,
    gap: 12,
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '900' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  officerCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 14,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  officerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  officerName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  officerEmail: { fontSize: 12, color: '#94A3B8' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' },
  statsRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  statLbl: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  emptyBtn: { backgroundColor: '#1E3A8A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#0F172A', marginBottom: 12,
  },
  createBtn: { backgroundColor: '#1E3A8A', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});