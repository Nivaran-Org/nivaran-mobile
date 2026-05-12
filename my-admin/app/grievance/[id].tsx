import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';


export default function DetailsScreen() {
  const params = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.mapBox}>
        
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>OFFICER ASSIGNED</Text>
          <Text style={styles.mainValue}>Priyanka (Officer ID: 402)</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>COMPLAINANT</Text>
          <Text style={styles.value}>{params.user}</Text>

          <Text style={styles.label}>ISSUE REPORTED</Text>
          <Text style={styles.issueText}>{params.issue}</Text>
          
          <Text style={styles.footerText}>Logged: {params.date} | {params.time}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  mapBox: { height: 280, width: '100%' },
  content: { padding: 25 },
  label: { fontSize: 10, fontWeight: '900', color: '#94A3B8', letterSpacing: 1, marginBottom: 4 },
  mainValue: { fontSize: 18, fontWeight: '800', color: '#1E3A8A', marginBottom: 20 },
  value: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 15 },
  issueText: { fontSize: 16, color: '#334155', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 15 },
  footerText: { marginTop: 25, color: '#94A3B8', fontSize: 12, fontWeight: '600' }
});