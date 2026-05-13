import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, RefreshControl, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getComplaints, escalateComplaint } from '../../../services/api';

const showAlert = (title: string, msg: string, onOk?: () => void) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n\n${msg}`); onOk?.(); }
  else Alert.alert(title, msg, [{ text: 'OK', onPress: onOk }]);
};

export default function Overdue() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [escalating, setEscalating] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await getComplaints();
      if (res.success) {
        const now = new Date().getTime();
        // Overdue = pending or in_progress for more than 48 hours
        const overdue = res.data.filter((c: any) => {
          if (c.status === 'resolved' || c.status === 'rejected') return false;
          const created = new Date(c.created_at).getTime();
          const hoursOld = (now - created) / (1000 * 60 * 60);
          return hoursOld > 48;
        });
        setComplaints(overdue);
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

  const handleEscalate = async (id: number, title: string) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Escalate overdue case #${id}?\n\nThis sends urgent email to nitinmishra85666@gmail.com`)
      : await new Promise(resolve =>
          Alert.alert('Escalate', `Send urgent notice for "${title}"?`, [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Escalate', style: 'destructive', onPress: () => resolve(true) },
          ])
        );

    if (!confirmed) return;
    setEscalating(id);
    try {
      const res = await escalateComplaint(id);
      if (res.success) {
        showAlert('✅ Escalated', `Urgent notice sent for Case #${id}`);
      } else {
        showAlert('Failed', res.message || 'Could not escalate.');
      }
    } catch (e) {
      showAlert('Error', 'Network error.');
    } finally {
      setEscalating(null);
    }
  };

  const getHoursOverdue = (createdAt: string) => {
    const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
    if (hours > 72) return `${Math.floor(hours / 24)} days overdue`;
    return `${hours}h overdue`;
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#EF4444" /></View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.headerTitle}>SLA Breached ({complaints.length})</Text>
              <Text style={styles.headerSub}>Cases overdue by more than 48 hours</Text>
            </View>
            <Ionicons name="warning" size={24} color="#FECACA" />
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={complaints}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#86EFAC" />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptyText}>No overdue cases at the moment</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.overdueCard}
            onPress={() => router.push(`/(admin)/screens/case-details?id=${item.id}`)}
          >
            <View style={styles.statusStrip} />
            <View style={styles.cardBody}>
              <View style={styles.topLine}>
                <Text style={styles.delayLabel}>{getHoursOverdue(item.created_at)}</Text>
                <View style={[styles.priorityBadge, {
                  backgroundColor: item.priority === 'high' ? '#FEE2E2' : '#FEF3C7'
                }]}>
                  <Text style={[styles.priorityText, {
                    color: item.priority === 'high' ? '#EF4444' : '#D97706'
                  }]}>
                    {(item.priority || 'MEDIUM').toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.caseTitle}>{item.title}</Text>
              <Text style={styles.caseDesc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="business-outline" size={12} color="#94A3B8" />
                  <Text style={styles.metaText}>{item.department || 'Unassigned'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={12} color="#94A3B8" />
                  <Text style={styles.metaText}>
                    {item.assigned_to ? `Officer #${item.assigned_to}` : 'Unassigned'}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                  <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString('en-IN')}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.escalateBtn, escalating === item.id && { opacity: 0.7 }]}
                onPress={() => handleEscalate(item.id, item.title)}
                disabled={escalating === item.id}
              >
                {escalating === item.id
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <>
                      <Ionicons name="notifications-active" size={16} color="white" />
                      <Text style={styles.escalateText}>Send Urgent Notice</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#EF4444',
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    elevation: 10,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  overdueCard: {
    backgroundColor: 'white', borderRadius: 20, marginBottom: 14,
    flexDirection: 'row', overflow: 'hidden',
    elevation: 4, shadowColor: '#EF4444', shadowOpacity: 0.1, shadowRadius: 8,
  },
  statusStrip: { width: 6, backgroundColor: '#EF4444' },
  cardBody: { flex: 1, padding: 16 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  delayLabel: { color: '#EF4444', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '800' },
  caseTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  caseDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  escalateBtn: {
    backgroundColor: '#1E293B', flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    padding: 12, borderRadius: 12, gap: 8,
  },
  escalateText: { color: 'white', fontWeight: '800', fontSize: 13 },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#16A34A', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#94A3B8', marginTop: 6 },
});