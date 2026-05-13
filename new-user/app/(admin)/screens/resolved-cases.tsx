import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, Image, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getComplaints } from '../../../services/api';

export default function ResolvedCases() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getComplaints();
      if (res.success) {
        const resolved = (res.data ?? []).filter((c: any) => c.status === 'resolved');
        setComplaints(resolved);
      }
    } catch (e) {
      console.error('fetchResolvedCases:', e);
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
            <Text style={styles.headerTitle}>National Archive ({complaints.length})</Text>
            <Ionicons name="shield-checkmark-sharp" size={24} color="#4ADE80" />
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
            <Ionicons name="archive-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No resolved cases in archive</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.auditCard} onPress={() => router.push(`/(admin)/screens/case-details?id=${item.id}`)}>
            
            {/* DEPT BADGE */}
            <View style={styles.jurisdictionContainer}>
               <Ionicons name="business" size={14} color="#3B82F6" />
               <Text style={styles.jurisdictionText}>{item.department || 'General'}</Text>
            </View>

            {/* TOP BAR: ID & TOTAL DURATION */}
            <View style={styles.topBar}>
              <Text style={styles.idLabel}>ID: {item.id}</Text>
              <View style={styles.timeBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.timeText}>Status: Resolved</Text>
              </View>
            </View>

            <Text style={styles.caseHeading}>{item.title}</Text>

            {/* TIMELINE */}
            <View style={styles.timelineRow}>
              <View style={styles.timeNode}>
                <Text style={styles.nodeLabel}>REPORTED</Text>
                <Text style={styles.nodeDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <View style={styles.timelineLink} />
              <View style={styles.timeNode}>
                <Text style={styles.nodeLabel}>FIXED</Text>
                <Text style={styles.nodeDate}>{new Date(item.updated_at).toLocaleDateString()}</Text>
              </View>
            </View>

            {/* VISUAL EVIDENCE */}
            {item.photo_url && (
              <View style={styles.photoBox}>
                <View style={styles.imgLabelGreen}><Text style={styles.imgLabelText}>RESOLVED PROOF</Text></View>
                <Image source={{ uri: item.photo_url }} style={styles.auditImg} />
              </View>
            )}

            {/* IDENTITY SECTION */}
            <View style={styles.identityRow}>
              <View style={styles.personInfo}>
                <Text style={styles.roleLabel}>CITIZEN REPORTER</Text>
                <Text style={styles.nameText}>User ID: {item.user_id}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.personInfo}>
                <Text style={styles.roleLabel}>ASSIGNED OFFICER</Text>
                <Text style={styles.nameText}>Officer ID: {item.officer_id || 'N/A'}</Text>
              </View>
            </View>

            {/* FOOTER */}
            <View style={styles.cardFooter}>
               <View style={{ flex: 1 }}>
                  <Text style={styles.historyLabel}>PRIORITY LEVEL</Text>
                  <Text style={styles.historyText}>{item.priority?.toUpperCase() || 'NORMAL'}</Text>
               </View>
               <View style={styles.scoreCircle}>
                  <Text style={styles.scoreVal}>5.0</Text>
                  <Text style={styles.scoreUnit}>/5</Text>
               </View>
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
  
  auditCard: { backgroundColor: 'white', borderRadius: 22, marginBottom: 20, padding: 20, elevation: 3, marginHorizontal: 5 },
  jurisdictionContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  jurisdictionText: { fontSize: 11, fontWeight: '800', color: '#3B82F6', marginLeft: 5, textTransform: 'uppercase' },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  idLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  timeText: { fontSize: 10, color: '#059669', fontWeight: '800', marginLeft: 4 },
  
  caseHeading: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 15 },

  timelineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  timeNode: { alignItems: 'center' },
  nodeLabel: { fontSize: 8, fontWeight: '900', color: '#94A3B8', marginBottom: 4 },
  nodeDate: { fontSize: 12, fontWeight: '800', color: '#334155' },
  timelineLink: { height: 2, flex: 0.5, backgroundColor: '#CBD5E1', marginHorizontal: 10 },

  photoBox: { position: 'relative', marginBottom: 20 },
  imgLabelGreen: { position: 'absolute', top: 5, left: 5, zIndex: 1, backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  imgLabelText: { color: 'white', fontSize: 8, fontWeight: '900' },
  auditImg: { width: '100%', height: 160, borderRadius: 15, backgroundColor: '#F1F5F9' },

  identityRow: { flexDirection: 'row', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  personInfo: { flex: 1 },
  roleLabel: { fontSize: 8, fontWeight: '900', color: '#94A3B8', marginBottom: 4 },
  nameText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  divider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 12 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  historyLabel: { fontSize: 8, fontWeight: '900', color: '#94A3B8', marginBottom: 2 },
  historyText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  scoreCircle: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: '#1E3A8A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  scoreVal: { color: 'white', fontWeight: '900', fontSize: 16 },
  scoreUnit: { color: '#93C5FD', fontWeight: '700', fontSize: 11 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#94A3B8', fontWeight: '600' }
});