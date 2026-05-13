import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, Image, Platform, ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getOfficers } from '../../../services/api';

export default function StaffOnline() {
  const router = useRouter();
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getOfficers();
      if (res.success) {
        setOfficers(res.data ?? []);
      }
    } catch (e) {
      console.error('fetchStaffOnline:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER - Rounded Blue */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Field Force Monitor</Text>
            <View style={styles.liveIndicator}>
               <View style={styles.liveDot} />
               <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={officers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No officers online</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.staffCard}>
            {/* TOP ROW: Profile & Status */}
            <View style={styles.topRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{(item.name || 'O').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.staffName}>{item.name}</Text>
                <Text style={styles.staffRole}>{item.email}</Text>
              </View>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: '#DCFCE7' }
              ]}>
                <Text style={[
                  styles.statusLabel, 
                  { color: '#16A34A' }
                ]}>
                  ACTIVE
                </Text>
              </View>
            </View>

            {/* MIDDLE ROW: Info */}
            <View style={styles.assignmentBox}>
              <Text style={styles.boxLabel}>ID REFERENCE</Text>
              <Text style={styles.taskText}>OFF-00{item.id}</Text>
            </View>

            {/* BOTTOM ROW: Performance Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>-</Text>
                <Text style={styles.statLabel}>Solved</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>-</Text>
                <Text style={styles.statLabel}>Incomplete</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.viewBtn}
                onPress={() => router.push(`/(admin)/screens/staff-history?id=${item.id}`)}
              >
                <Text style={styles.viewBtnText}>History</Text>
                <Ionicons name="chevron-forward" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#1E3A8A', 
    paddingBottom: 25, 
    borderBottomLeftRadius: 22, 
    borderBottomRightRadius: 22,
    elevation: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 0
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { flex: 1, color: 'white', fontSize: 20, fontWeight: '900', marginLeft: 10 },
  liveIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 12 
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 6 },
  liveText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  
  staffCard: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10 
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarCircle: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#1E3A8A', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarInitial: { color: 'white', fontWeight: '900', fontSize: 20 },
  infoCol: { flex: 1, marginLeft: 12 },
  staffName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  staffRole: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusLabel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  
  assignmentBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 15 },
  boxLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
  taskText: { fontSize: 13, color: '#1E3A8A', fontWeight: '700' },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  statDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0' },
  
  viewBtn: { 
    backgroundColor: '#1E3A8A', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 12,
    borderBottomWidth: 2,
    borderColor: '#3B82F6'
  },
  viewBtnText: { color: 'white', fontSize: 12, fontWeight: '800', marginRight: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#94A3B8', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});