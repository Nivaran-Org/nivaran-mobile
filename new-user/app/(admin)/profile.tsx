import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminProfile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Admin Portal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="shield-checkmark" size={50} color="#1E3A8A" />
          </View>
          <Text style={styles.name}>Executive Lead</Text>
          <Text style={styles.location}>Based in: Punjab, India</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          <View style={styles.experienceBox}>
            <Text style={styles.company}>Microsoft Corporation</Text>
            <Text style={styles.duration}>10 Years Experience</Text>
            <Text style={styles.description}>
              Served in higher management divisions, focusing on technical infrastructure 
              and large-scale system deployments before leading the Nivaran project.
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Jurisdiction</Text>
          <Text style={styles.detailText}>• Regional Headquarters: Jalandhar</Text>
          <Text style={styles.detailText}>• Authority: Full State Access (Punjab)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1E3A8A', padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  profileCard: { backgroundColor: 'white', padding: 30, borderRadius: 25, alignItems: 'center', elevation: 5, marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#1E3A8A' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  location: { color: '#64748B', fontWeight: '600', marginTop: 5 },
  infoSection: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase' },
  experienceBox: { backgroundColor: '#E0F2FE', padding: 20, borderRadius: 20 },
  company: { fontSize: 18, fontWeight: 'bold', color: '#0369A1' },
  duration: { fontSize: 14, fontWeight: '700', color: '#075985', marginBottom: 8 },
  description: { color: '#1E3A8A', lineHeight: 20, fontWeight: '500' },
  detailText: { fontSize: 16, color: '#334155', marginBottom: 8, fontWeight: '600' }
});