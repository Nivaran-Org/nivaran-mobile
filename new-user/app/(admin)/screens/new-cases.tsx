import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, Image, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getComplaints } from '../../../services/api';

export default function NewCases() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getComplaints();
      if (res.success) {
        const pending = (res.data ?? []).filter((c: any) => c.status === 'pending');
        setComplaints(pending);
      }
    } catch (e) {
      console.error('fetchNewCases:', e);
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
      
      {/* HEADER - Rounded */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Live Tracking Console</Text>
            <View style={styles.livePulse} />
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={complaints}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No new cases to track</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.caseCard} onPress={() => router.push(`/(admin)/screens/case-details?id=${item.id}`)}>
            <View style={styles.topRow}>
               <View style={styles.jurisdictionBadge}>
                  <Ionicons name="business" size={12} color="#3B82F6" />
                  <Text style={styles.jurisdictionText}>{item.department || 'General'}</Text>
               </View>
               <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
                 <Text style={[styles.statusText, { color: '#EF4444' }]}>PENDING</Text>
               </View>
            </View>

            <Text style={styles.caseTitle}>{item.title}</Text>
            
            <View style={styles.timestampRow}>
               <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
               <Text style={styles.timestampText}>Filed on: {new Date(item.created_at).toLocaleString()}</Text>
            </View>

            {item.photo_url && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.photo_url }} style={styles.complaintImg} />
                <View style={styles.imgOverlay}><Text style={styles.imgOverlayText}>CITIZEN PROOF</Text></View>
              </View>
            )}

            <View style={styles.responseBox}>
              <View style={styles.pendingContainer}>
                <Ionicons name="alert-circle" size={22} color="#EF4444" />
                <View>
                  <Text style={styles.pendingBoldText}>ACTION REQUIRED</Text>
                  <Text style={styles.pendingSubText}>Tap to assign an officer and begin processing.</Text>
                </View>
              </View>
            </View>

            <View style={styles.userInfo}>
               <Text style={styles.infoLabel}>PRIORITY LEVEL:</Text>
               <Text style={styles.userNameText}>{item.priority?.toUpperCase() || 'NORMAL'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  header: { 
    backgroundColor: '#1E3A8A', 
    paddingBottom: 25, 
    borderBottomLeftRadius: 22, 
    borderBottomRightRadius: 22, 
    elevation: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 0
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { flex: 1, color: 'white', fontSize: 18, fontWeight: '900', marginLeft: 10 },
  livePulse: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ADE80', borderWidth: 2, borderColor: '#1E3A8A' },
  
  caseCard: { backgroundColor: 'white', borderRadius: 22, padding: 20, marginBottom: 20, marginHorizontal: 5, elevation: 5 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jurisdictionBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  jurisdictionText: { fontSize: 10, fontWeight: '900', color: '#3B82F6', marginLeft: 4, textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  
  caseTitle: { fontSize: 19, fontWeight: '900', color: '#1E293B' },
  timestampRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5, marginBottom: 15 },
  timestampText: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  
  imageContainer: { marginBottom: 20, position: 'relative' },
  complaintImg: { width: '100%', height: 180, borderRadius: 20, backgroundColor: '#F1F5F9' },
  imgOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  imgOverlayText: { color: 'white', fontSize: 9, fontWeight: '900' },
  
  responseBox: { padding: 18, borderRadius: 20, borderWidth: 2, borderColor: '#EF4444', backgroundColor: '#FCFDFF', marginBottom: 15 },
  pendingContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pendingBoldText: { color: '#EF4444', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  pendingSubText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  
  userInfo: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  infoLabel: { fontSize: 9, fontWeight: '900', color: '#94A3B8', marginBottom: 4 },
  userNameText: { fontSize: 12, color: '#1E293B', fontWeight: '800' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#94A3B8', fontWeight: '600' }
});