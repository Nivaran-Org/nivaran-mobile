import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function Tab2() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.padding}>
        <Text style={styles.title}>Active Grievances</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No critical alerts in your sector.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  padding: { padding: 25 },
  title: { fontSize: 22, fontWeight: '900', color: '#1E3A8A', marginTop: 40, marginBottom: 20 },
  emptyCard: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  emptyText: { color: '#64748B', fontWeight: '600' }
});