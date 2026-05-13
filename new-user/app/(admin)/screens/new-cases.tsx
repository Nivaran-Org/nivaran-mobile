import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { getComplaints, getOfficers, getAllUsers } from '../../../services/api';
import { BASE_URL } from '../../../contexts/AuthContext';

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  pending:     { bg: '#FEF3C7', text: '#D97706' },
  in_progress: { bg: '#DBEAFE', text: '#2563EB' },
  resolved:    { bg: '#DCFCE7', text: '#16A34A' },
  rejected:    { bg: '#FEE2E2', text: '#EF4444' },
};

export default function NewCases() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    try {
      const [cRes, oRes, uRes] = await Promise.all([
        getComplaints(),
        getOfficers(),
        getAllUsers()
      ]);
      
      if (cRes.success) {
        const rawData = cRes.data || [];
        const linked = rawData.map((c: any) => {
          const reporter = uRes.data?.find((u: any) => u.id === c.user_id);
          const officer = oRes.data?.find((o: any) => o.id === c.assigned_to);

          const getResPhoto = (obj: any) => {
            if (!obj) return null;
            const candidates = [
              obj.rectification_image, obj.rectificationImage, obj.rectified_image, 
              obj.rectifiedImage, obj.rectifiedImageUrl, obj.rectified_image_url, 
              obj.rectified_photo_url, obj.resolved_photo_url, obj.resolved_photo, 
              obj.resolution_photo, obj.rectification_photo, obj.proof_url,
              obj.rectification_image_url
            ];
            for (const cand of candidates) {
              if (typeof cand === 'string') return cand;
              if (cand && typeof cand === 'object' && cand.url) return cand.url;
              if (cand && typeof cand === 'object' && cand.uri) return cand.uri;
            }
            if (Array.isArray(obj.rectification_images) && obj.rectification_images[0]) {
              const first = obj.rectification_images[0];
              return typeof first === 'string' ? first : (first?.url || first?.uri);
            }
            if (obj.resolution) return getResPhoto(obj.resolution);
            return null;
          };

          const resPhoto = getResPhoto(c);
          const formattedResPhoto = resPhoto 
            ? (typeof resPhoto === 'string' ? (resPhoto.startsWith('http') ? resPhoto : `${BASE_URL}${resPhoto.startsWith('/') ? '' : '/'}${resPhoto}`) : null)
            : null;

          const mainPhoto = c.photo_url;
          const formattedMainPhoto = mainPhoto
            ? (mainPhoto.startsWith('http') ? mainPhoto : `${BASE_URL}${mainPhoto.startsWith('/') ? '' : '/'}${mainPhoto}`)
            : 'https://via.placeholder.com/100';

          return {
            ...c,
            display_user_name: c.user_name || c.user?.name || reporter?.name || 'Citizen',
            display_officer_name: c.officer_name || officer?.name || 'Unassigned',
            display_main_photo: formattedMainPhoto,
            display_resolved_photo: formattedResPhoto,
            norm_status: (c.status || 'pending').toLowerCase().replace('-', '_')
          };
        });
        setComplaints(linked);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]));

  const filtered = filter === 'all'
    ? complaints
    : complaints.filter(c => c.norm_status === filter);

  const sorted = [...filtered].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1E3A8A" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>All Cases ({complaints.length})</Text>
            <View style={styles.livePulse} />
          </View>
        </SafeAreaView>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {['all', 'pending', 'in_progress', 'resolved'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'in_progress' ? 'Active' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No cases found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const sc = STATUS_COLOR[item.status] || { bg: '#F1F5F9', text: '#64748B' };
          return (
            <TouchableOpacity
              style={styles.caseCard}
              onPress={() => router.push(`/(admin)/screens/case-details?id=${item.id}`)}
            >
              <View style={styles.cardMain}>
                <Image 
                  source={{ uri: item.display_resolved_photo || item.display_main_photo }} 
                  style={styles.caseThumb} 
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.topRow}>
                    <Text style={styles.caseId}>#{item.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.text }]}>
                        {(item.status || 'pending').replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.caseTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.reporterName}>By {item.display_user_name}</Text>
                </View>
              </View>

              <Text style={styles.caseDesc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="business-outline" size={12} color="#94A3B8" />
                  <Text style={styles.metaText}>{item.department || 'Unassigned'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                  <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString('en-IN')}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={12} color="#94A3B8" />
                  <Text style={styles.metaText}>{item.display_officer_name}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={[styles.priorityBadge, {
                  backgroundColor: item.priority === 'high' ? '#FEE2E2' : item.priority === 'medium' ? '#FEF3C7' : '#F0FDF4'
                }]}>
                  <Text style={[styles.priorityText, {
                    color: item.priority === 'high' ? '#EF4444' : item.priority === 'medium' ? '#D97706' : '#16A34A'
                  }]}>
                    {(item.priority || 'medium').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={14} color="#1E3A8A" />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#1E3A8A', paddingBottom: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { flex: 1, color: 'white', fontSize: 18, fontWeight: '900', marginLeft: 10 },
  livePulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4ADE80' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  filterBtnActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  filterText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  filterTextActive: { color: '#fff' },
  caseCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 14,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
  },
  cardMain: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  caseThumb: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#F1F5F9' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  caseId: { fontSize: 10, fontWeight: '900', color: '#94A3B8' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 9, fontWeight: '900' },
  caseTitle: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 2 },
  reporterName: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  caseDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: '900' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: '#1E3A8A' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#94A3B8', fontWeight: '600', fontSize: 16 },
});