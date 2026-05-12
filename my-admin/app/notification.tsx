import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ALERTS = [
  { id: '1', title: 'Critical: Power Failure', loc: 'Amritsar', time: '2 mins ago' },
  { id: '2', title: 'New Grievance Assigned', loc: 'Jalandhar', time: '15 mins ago' },
  { id: '3', title: 'System Maintenance', loc: 'HQ', time: '1 hour ago' },
];

export default function Notifications() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <FlatList
        data={ALERTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.alertItem}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.alertTitle}>{item.title}</Text>
              <Text style={styles.alertSub}>{item.loc} • {item.time}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold' },
  alertItem: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC', borderRadius: 15, marginBottom: 10 }
});