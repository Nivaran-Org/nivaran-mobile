// app/grievance/[id].tsx
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock data for different departments
const DEPARTMENT_DATA: any = {
  'Municipal': [
    { id: '1', title: 'Street Light Issue', status: 'Pending', date: '2024-04-10' },
    { id: '2', title: 'Road Pothole', status: 'Resolved', date: '2024-04-08' },
  ],
  'Water Dept': [
    { id: '3', title: 'Pipe Leakage', status: 'Critical', date: '2024-04-12' },
    { id: '4', title: 'No Water Supply', status: 'Pending', date: '2024-04-11' },
  ],
};

export default function DepartmentDetails() {
  const { id } = useLocalSearchParams(); // Gets 'Municipal' or 'Water Dept' from the URL
  const router = useRouter();
  
  const grievances = DEPARTMENT_DATA[id as string] || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{id} Grievances</Text>
      </View>

      <FlatList
        data={grievances}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>Status: {item.status} | {item.date}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No records found for this department.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', gap: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, marginHorizontal: 20, marginTop: 15, borderRadius: 10, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSubtitle: { fontSize: 13, color: '#64748B', marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94A3B8' }
});