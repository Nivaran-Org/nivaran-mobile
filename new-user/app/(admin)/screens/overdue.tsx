import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, ActivityIndicator, RefreshControl, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getComplaints } from '../../../services/api';

export default function Overdue() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getComplaints();
      if (res.success) {
        const now = new Date().getTime();
        const overdue = (res.data ?? []).filter((c: any) => {
          const created = new Date(c.created_at).getTime();
          return c.status === 'pending' && (now - created) > (48 * 60 * 60 * 1000);
        });
        setComplaints(overdue);
      }
    } catch (e) {
      console.error('fetchOverdueCases:', e);
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
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* HEADER - Rounded Blue */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>SLA Breached</Text>
            <Ionicons name="alert-circle" size={24} color="#FECACA" />
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={complaints}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No SLA breaches detected</Text>
          </View>
        }
        renderItem={({ item }) => {
          const hoursOverdue = Math.floor((new Date().getTime() - new Date(item.created_at).getTime()) / (60 * 60 * 1000));
          return (
            <TouchableOpacity style={styles.overdueCard} onPress={() => router.push(`/(admin)/screens/case-details?id=${item.id}`)}>
              <View style={styles.statusStrip} />
              <View style={styles.cardBody}>
                <View style={styles.topLine}>
                  <Text style={styles.delayLabel}>{hoursOverdue}h Overdue</Text>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>{item.priority?.toUpperCase() || 'HIGH'}</Text>
                  </View>
                </View>
                
                <Text style={styles.caseTitle}>{item.title}</Text>
                
                <View style={styles.officerRow}>
                  <View style={styles.officerAvatar}>
                     <Ionicons name="person" size={14} color="#EF4444" />
                  </View>
                  <Text style={styles.officerName}>Reported on: <Text style={{fontWeight: '800'}}>{new Date(item.created_at).toLocaleDateString()}</Text></Text>
                </View>

                <TouchableOpacity style={styles.escalateBtn}>
                  <Ionicons name="notifications-active" size={18} color="white" style={{marginRight: 8}} />
                  <Text style={styles.escalateText}>Escalate to Dept Head</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#1E3A8A', 
    paddingBottom: 25, 
    borderBottomLeftRadius: 22, 
    borderBottomRightRadius: 22,
    paddingTop: Platform.OS === 'android' ? 10 : 0
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { flex: 1, color: 'white', fontSize: 20, fontWeight: '900', marginLeft: 10 },
  overdueCard: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    marginBottom: 15, 
    flexDirection: 'row', 
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOpacity: 0.1,
  },
  statusStrip: { width: 6, backgroundColor: '#EF4444' },
  cardBody: { flex: 1, padding: 20 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  delayLabel: { color: '#EF4444', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  priorityBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { color: '#EF4444', fontSize: 10, fontWeight: '800' },
  caseTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  officerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  officerAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  officerName: { fontSize: 13, color: '#64748B' },
  escalateBtn: { 
    backgroundColor: '#1E293B', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 14, 
    borderRadius: 15 
  },
  escalateText: { color: 'white', fontWeight: '800', fontSize: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#94A3B8', fontWeight: '600' }
});