import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      <View style={styles.content}>
        <Ionicons name="information-circle-outline" size={60} color="#1E3A8A" />
        <Text style={styles.title}>System Information</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.4 (Capstone Build)</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.infoLabel}>Officer Station</Text>
          <Text style={styles.infoValue}>Amritsar Sector - Punjab</Text>
        </View>

        <TouchableOpacity 
          style={styles.closeBtn} 
          onPress={() => router.back()}
        >
          <Text style={styles.closeBtnText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  content: {
    width: '85%',
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E3A8A',
    marginTop: 15,
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 15,
  },
  closeBtn: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  closeBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
});