import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [adminData] = useState({
    name: 'Admin User',
    email: 'admin@system.gov',
    role: 'System Administrator',
    department: 'Central Command',
    phone: '+1 (555) 000-0000',
  });

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout pressed');
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 60 : 20 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color="white" />
          </View>
          <Text style={styles.name}>{adminData.name}</Text>
          <Text style={styles.role}>{adminData.role}</Text>
        </View>

        <View style={styles.infoSection}>
          <InfoItem icon="mail" label="Email" value={adminData.email} />
          <InfoItem icon="briefcase" label="Department" value={adminData.department} />
          <InfoItem icon="call" label="Phone" value={adminData.phone} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon as any} size={20} color="#3B82F6" />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1E3A8A', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  content: { padding: 20, paddingBottom: 30 },
  profileSection: { backgroundColor: 'white', borderRadius: 15, padding: 20, alignItems: 'center', elevation: 2, marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  role: { fontSize: 14, color: '#6B7280', marginTop: 5 },
  infoSection: { marginBottom: 20 },
  infoItem: { backgroundColor: 'white', borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 1 },
  infoText: { marginLeft: 15, flex: 1 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 3 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  logoutButton: { backgroundColor: '#EF4444', borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: 'white', fontWeight: '600', marginLeft: 10, fontSize: 16 },
});
