import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Linking, ActivityIndicator, Platform, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, MapPin, Brain, Calendar,
  AlertTriangle, CheckCircle, Clock, XCircle, User,
} from 'lucide-react-native';
import { getComplaints } from '../../services/api';

type Complaint = {
  id: number;
  title: string;
  description: string;
  photo_url: string | null;
  latitude: string | null;
  longitude: string | null;
  department: string;
  ai_confidence: number;
  ai_status: string;
  assigned_to: number | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
};

const STATUS_STEPS = ['pending', 'in_progress', 'resolved'] as const;

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:     { label: 'Pending',     color: '#b45309', bg: '#fef3c7', icon: Clock },
  in_progress: { label: 'In Progress', color: '#1d4ed8', bg: '#dbeafe', icon: AlertTriangle },
  resolved:    { label: 'Resolved',    color: '#15803d', bg: '#dcfce7', icon: CheckCircle },
  rejected:    { label: 'Rejected',    color: '#b91c1c', bg: '#fee2e2', icon: XCircle },
};

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Low Priority',    color: '#6b7280', bg: '#f3f4f6' },
  medium: { label: 'Medium Priority', color: '#d97706', bg: '#fef3c7' },
  high:   { label: 'High Priority',   color: '#dc2626', bg: '#fee2e2' },
};

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ComplaintDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      const res = await getComplaints();
      // getComplaints returns { success, data } — must unwrap .data before searching
      const list: Complaint[] = res?.data ?? [];
      const found = list.find(c => String(c.id) === String(id));
      setComplaint(found ?? null);
    } catch (e) {
      console.error('ComplaintDetail load:', e);
    } finally {
      setLoading(false);
    }
  };

  const openMap = () => {
    if (!complaint?.latitude || !complaint?.longitude) return;
    const url = Platform.select({
      ios:     `maps:0,0?q=${complaint.latitude},${complaint.longitude}`,
      android: `geo:${complaint.latitude},${complaint.longitude}?q=${complaint.latitude},${complaint.longitude}`,
      default: `https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  /* ── loading ── */
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  /* ── not found ── */
  if (!complaint) {
    return (
      <View style={s.center}>
        <XCircle size={48} color="#fca5a5" />
        <Text style={s.notFoundTitle}>Complaint Not Found</Text>
        <TouchableOpacity style={s.goBackBtn} onPress={() => router.back()}>
          <Text style={s.goBackText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const st          = STATUS_META[complaint.status]   ?? STATUS_META.pending;
  const pr          = PRIORITY_META[complaint.priority] ?? PRIORITY_META.medium;
  const currentStep = STATUS_STEPS.indexOf(complaint.status as any);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>Complaint #{complaint.id}</Text>
        <View style={[s.headerBadge, { backgroundColor: st.bg }]}>
          <Text style={[s.headerBadgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Photo ── */}
        {complaint.photo_url ? (
          <Image source={{ uri: complaint.photo_url }} style={s.photo} resizeMode="cover" />
        ) : (
          <View style={s.photoPlaceholder}>
            <Text style={s.photoPlaceholderText}>📷  No Photo Attached</Text>
          </View>
        )}

        {/* ── Title + description ── */}
        <View style={s.card}>
          <Text style={s.title}>{complaint.title}</Text>
          <Text style={s.description}>{complaint.description}</Text>
          <View style={s.badgeRow}>
            <View style={[s.badge, { backgroundColor: pr.bg }]}>
              <AlertTriangle size={11} color={pr.color} />
              <Text style={[s.badgeText, { color: pr.color }]}>{pr.label}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: '#f0fdf4' }]}>
              <Calendar size={11} color="#16a34a" />
              <Text style={[s.badgeText, { color: '#16a34a' }]}>{formatDate(complaint.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* ── AI Routing ── */}
        {(complaint.department || complaint.ai_confidence != null) && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Brain size={16} color="#7c3aed" />
              <Text style={s.cardTitle}>AI Routing Analysis</Text>
            </View>

            {complaint.department && (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Department</Text>
                <Text style={s.infoValue}>{complaint.department}</Text>
              </View>
            )}

            {complaint.ai_confidence != null && (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Confidence</Text>
                <View style={s.confidenceBar}>
                  <View style={[
                    s.confidenceFill,
                    {
                      width: `${Math.round(complaint.ai_confidence * 100)}%` as any,
                      backgroundColor: complaint.ai_confidence > 0.75 ? '#16a34a'
                        : complaint.ai_confidence > 0.5 ? '#d97706' : '#dc2626',
                    },
                  ]} />
                </View>
                <Text style={s.confidenceText}>
                  {(complaint.ai_confidence * 100).toFixed(1)}%
                </Text>
              </View>
            )}

            {complaint.ai_status && (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>AI Status</Text>
                <Text style={[s.infoValue, { color: '#7c3aed' }]}>{complaint.ai_status}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Location ── */}
        {complaint.latitude && complaint.longitude && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <MapPin size={16} color="#16a34a" />
              <Text style={s.cardTitle}>Location</Text>
            </View>
            <Text style={s.coordText}>
              {parseFloat(complaint.latitude).toFixed(6)}°N,{'  '}
              {parseFloat(complaint.longitude).toFixed(6)}°E
            </Text>
            <TouchableOpacity style={s.mapBtn} onPress={openMap}>
              <MapPin size={14} color="#fff" />
              <Text style={s.mapBtnText}>View on Map</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Assignment ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <User size={16} color="#1d4ed8" />
            <Text style={s.cardTitle}>Assignment</Text>
          </View>
          {complaint.assigned_to ? (
            <Text style={s.infoValue}>Assigned to Officer #{complaint.assigned_to}</Text>
          ) : (
            <Text style={[s.infoValue, { color: '#9ca3af' }]}>Not yet assigned</Text>
          )}
        </View>

        {/* ── Status Timeline ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Clock size={16} color="#374151" />
            <Text style={s.cardTitle}>Status Timeline</Text>
          </View>

          {complaint.status === 'rejected' ? (
            <View style={s.timelineRow}>
              <View style={s.timelineLeft}>
                <View style={[s.timelineDot, { backgroundColor: '#dc2626' }]} />
              </View>
              <View style={s.timelineContent}>
                <Text style={[s.timelineLabel, { color: '#dc2626' }]}>Rejected</Text>
                <Text style={s.timelineDate}>{formatDate(complaint.updated_at)}</Text>
              </View>
            </View>
          ) : (
            STATUS_STEPS.map((step, i) => {
              const done   = i <= currentStep;
              const active = i === currentStep;
              const meta   = STATUS_META[step];
              return (
                <View key={step} style={s.timelineRow}>
                  <View style={s.timelineLeft}>
                    <View style={[s.timelineDot, { backgroundColor: done ? meta.color : '#e5e7eb' }]}>
                      {active && <View style={s.timelinePulse} />}
                    </View>
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={[s.timelineLine, {
                        backgroundColor: done && i < currentStep ? meta.color : '#e5e7eb',
                      }]} />
                    )}
                  </View>
                  <View style={s.timelineContent}>
                    <Text style={[s.timelineLabel, { color: done ? meta.color : '#9ca3af' }]}>
                      {meta.label}
                    </Text>
                    {active && (
                      <Text style={s.timelineDate}>{formatDate(complaint.updated_at)}</Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <Text style={s.lastUpdated}>Last updated: {formatDate(complaint.updated_at)}</Text>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f0fdf4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 32 },

  notFoundTitle: { fontSize: 18, fontWeight: '800', color: '#374151', marginTop: 14 },
  goBackBtn:     { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#dcfce7', borderRadius: 12 },
  goBackText:    { color: '#15803d', fontWeight: '700', fontSize: 15 },

  /* header */
  header: {
    backgroundColor: '#15803d',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 28) + 12,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle:     { flex: 1, fontSize: 17, fontWeight: '800', color: '#fff' },
  headerBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  headerBadgeText: { fontSize: 11, fontWeight: '800' },

  /* scroll */
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 56 },

  /* photo */
  photo:               { width: '100%', height: 220 },
  photoPlaceholder:    { width: '100%', height: 80, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  photoPlaceholderText:{ color: '#9ca3af', fontSize: 13, fontWeight: '600' },

  /* cards */
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: '#d1fae5',
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle:  { fontSize: 12, fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6 },

  /* title card */
  title:       { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 10 },
  description: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 14 },
  badgeRow:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText:   { fontSize: 11, fontWeight: '700' },

  /* info rows */
  infoRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  infoLabel:       { fontSize: 12, color: '#9ca3af', fontWeight: '700', width: 90 },
  infoValue:       { fontSize: 13, color: '#111827', fontWeight: '700', flex: 1 },
  confidenceBar:   { flex: 1, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  confidenceFill:  { height: '100%', borderRadius: 3 },
  confidenceText:  { fontSize: 12, fontWeight: '800', color: '#374151', width: 42, textAlign: 'right' },

  /* location */
  coordText: {
    fontSize: 13, color: '#374151', fontWeight: '600',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  mapBtn: {
    backgroundColor: '#16a34a', flexDirection: 'row', alignItems: 'center',
    gap: 8, justifyContent: 'center', paddingVertical: 12, borderRadius: 10,
  },
  mapBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  /* timeline */
  timelineRow:    { flexDirection: 'row', gap: 12, marginBottom: 4 },
  timelineLeft:   { alignItems: 'center', width: 22 },
  timelineDot: {
    width: 14, height: 14, borderRadius: 7,
    position: 'relative', justifyContent: 'center', alignItems: 'center',
  },
  timelinePulse: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(22,163,74,0.2)',
    position: 'absolute',
  },
  timelineLine:    { width: 2, flex: 1, minHeight: 24, marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineLabel:   { fontSize: 14, fontWeight: '800' },
  timelineDate:    { fontSize: 11, color: '#9ca3af', marginTop: 3 },

  lastUpdated: { textAlign: 'center', color: '#9ca3af', fontSize: 11, fontWeight: '600', marginTop: 20 },
});