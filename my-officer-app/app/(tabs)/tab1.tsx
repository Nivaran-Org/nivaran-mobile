import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COMPLAINTS = [
  { 
    id: '101', 
    user: 'Rajesh Kumar', 
    date: '18 April 2026', 
    time: '10:30 AM', 
    issue: 'Street Light Failure', 
    status: 'Critical',
    latitude: 31.6340, 
    longitude: 74.8723 
  },
  { 
    id: '102', 
    user: 'Simran Kaur', 
    date: '17 April 2026', 
    time: '02:15 PM', 
    issue: 'Illegal Dumping', 
    status: 'Pending',
    latitude: 31.6200, 
    longitude: 74.8500 
  },
];

export default function Tab1() {
  const router = useRouter();

  const renderItem = ({ item }: any) => {
    // Encodes the URL so it's safe for web and mobile browsers
    const url = `/details/${item.id}?user=${encodeURIComponent(item.user)}&issue=${encodeURIComponent(item.issue)}&latitude=${item.latitude}&longitude=${item.longitude}&date=${encodeURIComponent(item.date)}&time=${encodeURIComponent(item.time)}`;
    
    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(url as any)}>
        <View style={styles.cardHeader}>
          <Text style={styles.idText}>ID: #{item.id}</Text>
          <Text style={[styles.statusText, {color: item.status === 'Critical' ? '#EF4444' : '#F59E0B'}]}>{item.status}</Text>
        </View>
        <Text style={styles.issueText}>{item.issue}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>{item.user}</Text>
          <Text style={styles.footerText}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nivaran Inbox</Text>
      </View>
      <FlatList
        data={COMPLAINTS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 25, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1E3A8A' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  idText: { fontSize: 12, fontWeight: '800', color: '#94A3B8' },
  statusText: { fontSize: 10, fontWeight: '900' },
  issueText: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginVertical: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  footerText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
});