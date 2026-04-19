import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={60} color="#1E3A8A" />
        </View>
        
        <Text style={styles.title}>Officer Portal</Text>
        <Text style={styles.subtitle}>
          Welcome to the Grievance Redressal Management System. 
          Manage and resolve citizen complaints efficiently.
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/tab1')}
        >
          <Text style={styles.buttonText}>View My Tasks</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    gap: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});