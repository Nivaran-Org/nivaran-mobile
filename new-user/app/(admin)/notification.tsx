import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, Dimensions, StatusBar, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native'; // Using Bell icon for consistency

const ALERTS = [
  { id: '1', title: 'Critical: Power Failure', loc: 'Amritsar', time: '2 mins ago' },
  { id: '2', title: 'New Grievance Assigned', loc: 'Jalandhar', time: '15 mins ago' },
  { id: '3', title: 'System Maintenance', loc: 'HQ', time: '1 hour ago' },
];

export default function Notifications() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* Header - Rounded Bottom */}
      <View style={styles.header}>
        <Text style={styles.chakra}>☸</Text>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Recent Alerts</Text>
        <View style={styles.card}>
          <FlatList
            data={ALERTS}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.alertItem}>
                <Ionicons name="alert-circle" size={24} color="#EF4444" />
                <View style={{ marginLeft: 15 }}>
                  <Text style={styles.alertTitle}>{item.title}</Text>
                  <Text style={styles.alertSub}>{item.loc} • {item.time}</Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' }, 
  scrollContent: { padding: 20, paddingBottom: 48 },

  /* header - Rounded Bottom */
  header: {
    backgroundColor: '#1E3A8A', 
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 20,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  backBtn: { padding: 4 },
  chakra: { fontSize: 24, color: '#BFDBFE' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },

  /* card */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
  },

  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: '#374151',
    marginBottom: 10, letterSpacing: 0.2,
    marginTop: 10,
  },

  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  alertSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 40, // Align with text
  },
});
