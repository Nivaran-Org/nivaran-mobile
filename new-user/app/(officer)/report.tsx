/**
 * app/(officer)/report.tsx
 * Officer Grievance Management Dashboard
 *
 * Uses the real Express + PostgreSQL backend via services/api.ts:
 *   - getOfficerComplaints()        → fetch all complaints visible to officer
 *   - updateComplaintStatus()       → PATCH status / assign
 *   - assignComplaint()             → PATCH assign officer
 *
 * Camera / gallery via expo-image-picker (same pattern as citizen report.tsx)
 * GPS via expo-location
 * Green NIVARAN theme throughout
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
  Modal, Platform, StatusBar, RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOfficerComplaints,
  updateComplaintStatus,
  assignComplaint,
  updateComplaintWithFormData,
} from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';
type Priority = 'low' | 'medium' | 'high';

type Complaint = {
  id: number;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: Priority;
  department: string;
  latitude: string | null;
  longitude: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: number | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  bg:          '#F8FAFC',
  surface:     '#FFFFFF',
  card:        '#FFFFFF',
  cardBorder:  '#E2E8F0',
  primary:     '#1E3A8A',
  primaryMid:  '#3B82F6',
  accent:      '#22C55E',
  danger:      '#EF4444',
  warning:     '#F59E0B',
  textHigh:    '#1E293B',
  textMid:     '#64748B',
  textLow:     '#94A3B8',
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  pending:     { color: C.warning,    bg: '#FFFBEB', label: 'Pending',     icon: 'time-outline'             },
  in_progress: { color: C.primaryMid, bg: '#EFF6FF', label: 'In Progress', icon: 'reload-circle-outline'    },
  resolved:    { color: C.accent,     bg: '#F0FDF4', label: 'Resolved',    icon: 'checkmark-circle-outline' },
  rejected:    { color: C.danger,     bg: '#FEF2F2', label: 'Rejected',    icon: 'close-circle-outline'     },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  low:    { color: C.textMid,  bg: '#F1F5F9' },
  medium: { color: C.warning,  bg: '#FFFBEB' },
  high:   { color: C.danger,   bg: '#FEF2F2' },
};

const STATUS_KEYS = ['pending', 'in_progress', 'resolved', 'rejected'] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const showAlert = (title: string, msg: string, onOk?: () => void) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n${msg}`); onOk?.(); }
  else Alert.alert(title, msg, [{ text: 'OK', onPress: onOk }]);
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OfficerReportScreen() {
  const { user } = useAuth();

  // list state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // filter / search
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [sortBy, setSortBy]             = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [showFilters, setShowFilters]   = useState(false);

  // selected complaint
  const [selected, setSelected] = useState<Complaint | null>(null);

  // officer action form
  const [newStatus,       setNewStatus]       = useState<string>('pending');
  const [officerNote,     setOfficerNote]     = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [resolutionPhotos, setResolutionPhotos] = useState<string[]>([]);
  const [saving, setSaving]                   = useState(false);

  // location state
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationText, setLocationText] = useState('');
  const [locLoading, setLocLoading] = useState(false);

  // modals
  const [statusModal, setStatusModal] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const res = await getOfficerComplaints();
      if (res.success) setComplaints(res.data ?? []);
      else setComplaints([]);
    } catch (e) {
      console.error('getOfficerComplaints:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // ── Open a complaint ───────────────────────────────────────────────────────

  const openComplaint = (c: Complaint) => {
    setSelected(c);
    setNewStatus(c.status);
    setOfficerNote('');
    setRejectionReason('');
    setResolutionPhotos([]);
  };

  // ── Camera / Gallery ───────────────────────────────────────────────────────

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { showAlert('Permission needed', 'Camera permission required.'); return; }
    const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!res.canceled && res.assets[0]) {
      setResolutionPhotos(p => [...p, res.assets[0].uri].slice(0, 5));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showAlert('Permission needed', 'Gallery permission required.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - resolutionPhotos.length,
      quality: 0.8,
    });
    if (!res.canceled) {
      setResolutionPhotos(p => [...p, ...res.assets.map(a => a.uri)].slice(0, 5));
    }
  };

  // ── GPS ────────────────────────────────────────────────────────────────────

  const getLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission needed', 'Location permission is required.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo[0]) {
        const parts = [geo[0].street, geo[0].city, geo[0].region].filter(Boolean);
        setLocationText(parts.join(', '));
      } else {
        setLocationText(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch (e) {
      console.error(e);
      showAlert('Error', 'Failed to get current location.');
    } finally {
      setLocLoading(false);
    }
  };

  // ── Save Update ────────────────────────────────────────────────────────────

  const handleSave = async () => {
  if (!selected) return;

  // Validation
  if (newStatus === 'rejected' && !rejectionReason.trim()) {
    showAlert('Required', 'Please enter a rejection reason.');
    return;
  }
  if (newStatus === 'resolved' && resolutionPhotos.length === 0) {
    showAlert('Photo required', 'Please upload a resolution photo.');
    return;
  }

  setSaving(true);
  try {
    const formData = new FormData();
    
    // 1. Core Data
    formData.append('status', newStatus);
    
    // Use 'remarks' to match the backend controller logic we drafted
    if (officerNote.trim()) formData.append('remarks', officerNote.trim());
    if (newStatus === 'rejected') formData.append('rejection_reason', rejectionReason.trim());

    // 2. The Photo (CRITICAL: Key must be 'rectificationImage')
    if (resolutionPhotos.length > 0) {
      const uri = resolutionPhotos[0];
      const filename = uri.split('/').pop() || 'resolution.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('rectificationImage', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type: type,
      } as any);
    }

    // 3. Optional Location
    if (location) {
      formData.append('latitude', String(location.latitude));
      formData.append('longitude', String(location.longitude));
    }

    // 4. API Call - Use the targeted POST method
    const res = await updateComplaintWithFormData(selected.id, formData);

    if (!res.success) throw new Error(res.message ?? 'Update failed');

    // Update Local State
    setComplaints(prev =>
      prev.map(c => c.id === selected.id ? { ...c, status: newStatus as ComplaintStatus } : c),
    );
    
    showAlert('Success', `Complaint updated successfully.`, () => {
      setSelected(null);
    });
  } catch (e: any) {
    showAlert('Error', e?.message ?? 'Something went wrong.');
  } finally {
    setSaving(false);
  }
};

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = {
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved:   complaints.filter(c => c.status === 'resolved').length,
    rejected:   complaints.filter(c => c.status === 'rejected').length,
  };

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = complaints
    .filter(c => filterStatus === 'all' || c.status === filterStatus)
    .filter(c =>
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(c.id).includes(searchQuery) ||
      (c.department ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      const ord: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (ord[a.priority] ?? 1) - (ord[b.priority] ?? 1);
    });

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={s.loadingText}>Loading complaints…</Text>
      </View>
    );
  }

  // ── Detail panel ───────────────────────────────────────────────────────────

  if (selected) {
    const sc = STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.pending;
    const pc = PRIORITY_CONFIG[selected.priority] ?? PRIORITY_CONFIG.medium;

    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => setSelected(null)}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>Complaint #{selected.id}</Text>
          <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
            <Text style={[s.statusPillText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Info card */}
          <View style={s.card}>
            <Text style={s.detailTitle}>{selected.title}</Text>
            <Text style={s.detailDesc}>{selected.description}</Text>

            <View style={s.tagRow}>
              <View style={[s.tag, { backgroundColor: pc.bg }]}>
                <Text style={[s.tagText, { color: pc.color }]}>{(selected.priority ?? 'medium').toUpperCase()} PRIORITY</Text>
              </View>
              <View style={[s.tag, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[s.tagText, { color: C.primaryMid }]}>{selected.department || 'Unassigned'}</Text>
              </View>
            </View>

            <View style={s.infoGrid}>
              <InfoRow label="Filed"   value={fmt(selected.created_at)} />
              <InfoRow label="Updated" value={fmt(selected.updated_at)} />
              {selected.latitude && selected.longitude && (
                <InfoRow label="Location" value={`${parseFloat(selected.latitude).toFixed(4)}°N, ${parseFloat(selected.longitude).toFixed(4)}°E`} />
              )}
            </View>
          </View>

          {/* Complaint photo */}
          {selected.photo_url && (
            <View style={s.card}>
              <Text style={s.sectionMicro}>COMPLAINT PHOTO (BEFORE)</Text>
              <Image source={{ uri: selected.photo_url.startsWith('http') ? selected.photo_url : `${BASE_URL}${selected.photo_url.startsWith('/') ? '' : '/'}${selected.photo_url}` }} style={s.evidencePhoto} resizeMode="cover" />
            </View>
          )}

          {/* Resolution photo */}
          {(selected.status === 'resolved' || selected.status === 'in_progress') && (
            (() => {
              const s: any = selected;
              const img = 
                s.rectification_image || 
                s.rectificationImage || 
                s.rectified_image || 
                s.rectifiedImage || 
                s.rectifiedImageUrl || 
                s.rectified_image_url || 
                s.resolved_photo_url || 
                s.resolved_photo || 
                s.resolution_photo || 
                s.rectification_photo || 
                s.proof_url ||
                s.rectification_image_url ||
                (Array.isArray(s.rectification_images) && s.rectification_images[0]) ||
                s.resolution?.rectification_image ||
                s.resolution?.photo_url;

              if (!img || typeof img !== 'string') return null;
              const uri = img.startsWith('http') ? img : `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
              return (
                <View style={s.card}>
                  <Text style={s.sectionMicro}>RESOLUTION PHOTO (AFTER)</Text>
                  <Image source={{ uri }} style={s.evidencePhoto} resizeMode="cover" />
                </View>
              );
            })()
          )}

          {/* Existing officer note */}
          {(selected as any).remarks && (
            <View style={s.card}>
              <Text style={s.sectionMicro}>OFFICER RESOLUTION NOTE</Text>
              <View style={s.noteBox}>
                <Text style={s.noteText}>{(selected as any).remarks}</Text>
              </View>
            </View>
          )}

          {/* ── Officer Action Panel ── */}
          <View style={s.officerPanel}>
            <View style={s.panelHeader}>
              <Ionicons name="shield-checkmark" size={18} color={C.primary} />
              <Text style={s.panelTitle}>OFFICER ACTION PANEL</Text>
            </View>

            {/* Status selector */}
            <Text style={s.panelLabel}>Update Status</Text>
            <TouchableOpacity style={s.selector} onPress={() => setStatusModal(true)}>
              <View style={[s.selectorDot, { backgroundColor: STATUS_CONFIG[newStatus]?.color ?? '#888' }]} />
              <Text style={s.selectorText}>{STATUS_CONFIG[newStatus]?.label ?? 'Select'}</Text>
              <Ionicons name="chevron-down" size={16} color={C.textLow} />
            </TouchableOpacity>

            {/* Rejection reason */}
            {newStatus === 'rejected' && (
              <>
                <Text style={s.panelLabel}>Rejection Reason *</Text>
                <TextInput
                  style={[s.panelInput, s.panelTextarea]}
                  placeholder="Explain why this complaint is rejected…"
                  placeholderTextColor={C.textLow}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </>
            )}

            {/* Officer notes */}
            <Text style={s.panelLabel}>Officer Notes / Actions Taken</Text>
            <TextInput
              style={[s.panelInput, s.panelTextarea]}
              placeholder="Describe steps taken, field observations…"
              placeholderTextColor={C.textLow}
              value={officerNote}
              onChangeText={setOfficerNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={600}
            />
            <Text style={s.charCount}>{officerNote.length}/600</Text>

            {/* GPS Location */}
            <Text style={s.panelLabel}>Your Current Location</Text>
            <TouchableOpacity 
              style={[s.locationBtn, locLoading && { opacity: 0.7 }]} 
              onPress={getLocation} 
              disabled={locLoading}
            >
              {locLoading
                ? <ActivityIndicator size="small" color={C.primary} />
                : <Ionicons name="location" size={18} color={C.primary} />
              }
              <Text style={s.locationBtnText} numberOfLines={1}>
                {locationText || 'Tap to attach your GPS location'}
              </Text>
              {location && <View style={s.locationDot} />}
            </TouchableOpacity>

            {/* Resolution photos */}
            <Text style={s.panelLabel}>
              Resolution Photos * <Text style={{ color: C.danger, fontSize: 10 }}>(Mandatory)</Text>
            </Text>
            
            <View style={s.photoRow}>
              <TouchableOpacity style={s.photoActionBtn} onPress={takePhoto}>
                <Ionicons name="camera" size={20} color={C.primary} />
                <Text style={s.photoActionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.photoActionBtn} onPress={pickImage}>
                <Ionicons name="images" size={20} color={C.primary} />
                <Text style={s.photoActionText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            <View style={s.photoGrid}>
              {resolutionPhotos.map((uri, i) => (
                <View key={uri} style={s.photoBox}>
                  <Image source={{ uri }} style={s.photoThumb} />
                  <TouchableOpacity
                    style={s.removePhoto}
                    onPress={() => setResolutionPhotos(p => p.filter((_, j) => j !== i))}
                  >
                    <Ionicons name="close-circle" size={22} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Save */}
            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.65 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={s.saveBtnText}>Save Update</Text>
                  </>
                )
              }
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Status Modal */}
        <Modal visible={statusModal} transparent animationType="slide" onRequestClose={() => setStatusModal(false)}>
          <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setStatusModal(false)}>
            <View style={s.modalSheet}>
              <View style={s.modalHandle} />
              <Text style={s.modalTitle}>Update Status</Text>
              {STATUS_KEYS.map(key => {
                const cfg = STATUS_CONFIG[key];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[s.modalOption, newStatus === key && s.modalOptionActive]}
                    onPress={() => { setNewStatus(key); setStatusModal(false); }}
                  >
                    <View style={[s.modalDot, { backgroundColor: cfg.color }]} />
                    <Text style={s.modalOptionText}>{cfg.label}</Text>
                    {newStatus === key && <Ionicons name="checkmark" size={18} color={C.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // ── Dashboard list view ────────────────────────────────────────────────────

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={s.header}>
        <Ionicons name="shield-checkmark" size={24} color="#fbbf24" />
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Officer Desk</Text>
          <Text style={s.headerSub}>Hello, {user?.name?.split(' ')[0] ?? 'Officer'}</Text>
        </View>
        <View style={s.livePill}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />
        }
        contentContainerStyle={s.page}
        keyboardShouldPersistTaps="handled"
      >
        {/* Stats */}
        <View style={s.statsRow}>
          <StatChip label="Total"    value={stats.total}      color={C.textHigh} bg={C.cardBorder} />
          <StatChip label="Pending"  value={stats.pending}    color={C.warning} bg="#FFFBEB" />
          <StatChip label="Active"   value={stats.inProgress} color={C.primaryMid} bg="#EFF6FF" />
          <StatChip label="Resolved" value={stats.resolved}   color={C.accent} bg="#F0FDF4" />
        </View>

        {/* Search bar */}
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={18} color={C.textLow} style={{ marginLeft: 12 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by title, ID, department…"
            placeholderTextColor={C.textLow}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ paddingRight: 12 }}>
              <Ionicons name="close-circle" size={18} color={C.textLow} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter toggle */}
        <TouchableOpacity style={s.filterToggle} onPress={() => setShowFilters(v => !v)}>
          <Ionicons name="options-outline" size={16} color={C.primary} />
          <Text style={s.filterToggleText}>Filter & Sort</Text>
          <View style={s.filterCount}>
            <Text style={s.filterCountText}>{filtered.length}</Text>
          </View>
          <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={14} color={C.textLow} />
        </TouchableOpacity>

        {showFilters && (
          <View style={s.filterPanel}>
            {/* Status filter */}
            <Text style={s.filterLabel}>STATUS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {['all', ...STATUS_KEYS].map(st => (
                <TouchableOpacity
                  key={st}
                  style={[s.filterChip, filterStatus === st && s.filterChipActive]}
                  onPress={() => setFilterStatus(st)}
                >
                  <Text style={[s.filterChipText, filterStatus === st && s.filterChipTextActive]}>
                    {st === 'all' ? 'All' : STATUS_CONFIG[st]?.label ?? st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sort */}
            <Text style={s.filterLabel}>SORT BY</Text>
            <View style={s.sortRow}>
              {(['newest', 'oldest', 'priority'] as const).map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[s.sortChip, sortBy === opt && s.sortChipActive]}
                  onPress={() => setSortBy(opt)}
                >
                  <Text style={[s.sortChipText, sortBy === opt && s.sortChipTextActive]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Section title */}
        <Text style={s.sectionTitle}>ALL COMPLAINTS ({filtered.length})</Text>

        {/* Empty state */}
        {filtered.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>📋</Text>
            <Text style={s.emptyTitle}>No complaints found</Text>
            <Text style={s.emptySub}>Try changing filters or pull down to refresh.</Text>
          </View>
        )}

        {/* Complaint cards */}
        {filtered.map(c => {
          const sc = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.pending;
          const pc = PRIORITY_CONFIG[c.priority] ?? PRIORITY_CONFIG.medium;
          return (
            <TouchableOpacity
              key={c.id}
              style={s.complaintCard}
              onPress={() => openComplaint(c)}
              activeOpacity={0.75}
            >
              {/* Top row */}
              <View style={s.cardTop}>
                <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                  <Ionicons name={sc.icon as any} size={11} color={sc.color} />
                  <Text style={[s.statusPillText, { color: sc.color }]}>{sc.label}</Text>
                </View>
                <View style={[s.priorityPill, { backgroundColor: pc.bg }]}>
                  <Text style={[s.priorityPillText, { color: pc.color }]}>
                    {(c.priority ?? 'medium').toUpperCase()}
                  </Text>
                </View>
                <Text style={s.timeAgo}>{timeAgo(c.created_at)}</Text>
              </View>

              {/* Title */}
              <Text style={s.cardTitle} numberOfLines={2}>{c.title}</Text>

              {/* Footer */}
              <View style={s.cardFooter}>
                <View style={s.deptRow}>
                  <Ionicons name="business-outline" size={12} color={C.textLow} />
                  <Text style={s.deptText} numberOfLines={1}>{c.department || '—'}</Text>
                </View>
                <View style={s.cardRight}>
                  <Text style={s.cardDate}>{fmt(c.created_at)}</Text>
                  <Ionicons name="chevron-forward" size={14} color={C.textLow} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatChip({ label, value, color, bg }: {
  label: string; value: number; color: string; bg: string;
}) {
  return (
    <View style={[s.statChip, { backgroundColor: bg }]}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={[s.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  loadingText: { color: C.textMid, marginTop: 12, fontSize: 14 },

  /* header */
  header: {
    backgroundColor: C.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) + 12 : 54,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent },
  liveText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },

  page: { padding: 16, paddingBottom: 60 },

  /* stats */
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statChip: {
    flex: 1, borderRadius: 14, padding: 12,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: C.cardBorder,
  },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', marginTop: 2, letterSpacing: 0.3 },

  /* search */
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1.5, borderColor: C.cardBorder,
    marginBottom: 10, gap: 6,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.textHigh, paddingVertical: 12 },

  /* filter */
  filterToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1.5, borderColor: C.cardBorder,
  },
  filterToggleText: { fontSize: 13, fontWeight: '700', color: C.primary, flex: 1 },
  filterCount: {
    backgroundColor: C.primary, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  filterCountText: { fontSize: 11, color: '#fff', fontWeight: '800' },
  filterPanel: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1.5, borderColor: C.cardBorder,
  },
  filterLabel: {
    fontSize: 10, fontWeight: '800', color: C.textLow,
    letterSpacing: 1.5, marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16,
    marginRight: 8, borderWidth: 1.5, borderColor: C.cardBorder,
    backgroundColor: '#f9fafb',
  },
  filterChipActive:     { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText:       { fontSize: 12, fontWeight: '600', color: C.textMid },
  filterChipTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortChip: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: C.cardBorder,
  },
  sortChipActive:     { backgroundColor: C.primary, borderColor: C.primary },
  sortChipText:       { fontSize: 12, fontWeight: '700', color: C.textMid },
  sortChipTextActive: { color: '#fff' },

  sectionTitle: {
    fontSize: 11, fontWeight: '800', color: C.textMid,
    letterSpacing: 1.2, marginBottom: 12,
  },

  /* complaint card */
  complaintCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: C.cardBorder,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20,
  },
  statusPillText: { fontSize: 10, fontWeight: '800' },
  priorityPill:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priorityPillText: { fontSize: 9, fontWeight: '800' },
  timeAgo:  { fontSize: 11, color: C.textLow, marginLeft: 'auto' as any },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.textHigh, marginBottom: 10, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deptRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  deptText:  { fontSize: 12, color: C.textLow, flex: 1 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDate:  { fontSize: 12, color: C.textLow },

  /* empty */
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textHigh, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: C.textLow, textAlign: 'center', lineHeight: 20 },

  /* detail */
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 56 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: C.cardBorder,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2,
  },
  detailTitle: { fontSize: 20, fontWeight: '800', color: C.textHigh, marginBottom: 8 },
  detailDesc:  { fontSize: 14, color: C.textMid, lineHeight: 22, marginBottom: 14 },
  tagRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  tag:         { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tagText:     { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  infoGrid:    { gap: 8 },
  infoRow:     { flexDirection: 'row', gap: 8 },
  infoLabel:   { fontSize: 12, color: C.textLow, fontWeight: '700', width: 72 },
  infoValue:   { fontSize: 13, color: C.textHigh, fontWeight: '600', flex: 1 },
  sectionMicro:{ fontSize: 10, fontWeight: '800', color: C.textLow, letterSpacing: 1, marginBottom: 8 },
  evidencePhoto: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#e5e7eb' },
  noteBox: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.cardBorder },
  noteText: { fontSize: 14, color: C.textMid, lineHeight: 22 },

  /* officer panel */
  officerPanel: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 20,
    borderWidth: 1.5, borderColor: C.cardBorder,
  },
  panelHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderBottomWidth: 1, borderBottomColor: C.cardBorder,
    paddingBottom: 14, marginBottom: 6,
  },
  panelTitle: { fontSize: 12, fontWeight: '800', color: C.primary, letterSpacing: 2 },
  panelLabel: {
    fontSize: 11, fontWeight: '700', color: C.textMid,
    letterSpacing: 1, marginTop: 16, marginBottom: 8,
  },
  selector: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8FAFC', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: C.cardBorder,
  },
  selectorDot:  { width: 10, height: 10, borderRadius: 5 },
  selectorText: { fontSize: 14, color: C.textHigh, fontWeight: '600', flex: 1 },
  panelInput: {
    backgroundColor: '#F8FAFC', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.textHigh,
    borderWidth: 1.5, borderColor: C.cardBorder,
  },
  panelTextarea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
  charCount:     { fontSize: 11, color: C.textLow, textAlign: 'right', marginTop: 4 },

  /* location */
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8FAFC', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: C.cardBorder,
  },
  locationBtnText: { flex: 1, fontSize: 13, color: C.primary, fontWeight: '600' },
  locationDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },

  /* photo grid */
  photoRow:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  photoActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#F8FAFC',
    borderRadius: 10, paddingVertical: 12,
    borderWidth: 1.5, borderColor: C.cardBorder,
  },
  photoActionText: { fontSize: 12, color: C.primary, fontWeight: '700' },

  photoGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  photoBox:     { position: 'relative' },
  photoThumb:   { width: 82, height: 82, borderRadius: 10, backgroundColor: '#F1F5F9' },
  removePhoto:  { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12 },
  addPhotoBtn: {
    width: 82, height: 82, borderRadius: 10,
    borderWidth: 2, borderColor: 'rgba(251,191,36,0.4)', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  addPhotoText: { fontSize: 10, color: '#fbbf24', fontWeight: '700', marginTop: 4 },

  saveBtn: {
    backgroundColor: C.primary, borderRadius: 12, paddingVertical: 16, marginTop: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: C.primary, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  /* modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 14,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: C.cardBorder, borderRadius: 2,
    alignSelf: 'center', marginBottom: 18,
  },
  modalTitle:       { fontSize: 16, fontWeight: '800', color: C.textHigh, marginBottom: 16 },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12,
  },
  modalOptionActive: { backgroundColor: '#EFF6FF' },
  modalDot:         { width: 10, height: 10, borderRadius: 5 },
  modalOptionText:  { fontSize: 15, color: C.textHigh, fontWeight: '600', flex: 1 },
});