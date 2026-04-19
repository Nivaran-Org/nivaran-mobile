import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Tab3() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.name}>Officer ID: #9902</Text>
        <Text style={styles.rank}>Senior Inspector • Punjab Unit</Text>
        
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>SECURE LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  name: { fontSize: 20, fontWeight: '900', color: '#1E3A8A' },
  rank: { fontSize: 14, color: '#64748B', marginTop: 5, marginBottom: 30 },
  logoutBtn: { backgroundColor: '#EF4444', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  logoutText: { color: '#fff', fontWeight: '900', fontSize: 12 }
});