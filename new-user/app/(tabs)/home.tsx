import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { DemoStorage, Complaint, ComplaintCategory } from '../../services/DemoStorage';
import {
  Plus, AlertTriangle, CheckCircle, Clock, TrendingUp,
  MapPin, ChevronRight, Search, Filter, X, Trash2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORY_ICONS: Record<ComplaintCategory, string> = {
  pothole: '🕳️',
  garbage: '🗑️',
  water: '💧',
  electricity: '💡',
  roads: '🛣️',
  sanitation: '🚿',
  safety: '🐕',
  other: '📋',
};

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  pothole: 'POTHOLE',
  garbage: 'SANITATION',
  water: 'WATER',
  electricity: 'ELECTRICITY',
  roads: 'ROADS',
  sanitation: 'SANITATION',
  safety: 'SAFETY',
  other: 'OTHER',
};

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchComplaints();
    Animated.spring(headerAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await DemoStorage.getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  }, []);

  const deleteComplaint = async (id: string) => {
    Alert.alert('Delete Complaint', 'Are you sure you want to delete this complaint?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await DemoStorage.deleteComplaint(id);
          setSelectedComplaint(null);
          fetchComplaints();
        }
      },
    ]);
  };

  // Stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const filteredComplaints = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.pending;
      case 'in-progress': return theme.inProgress;
      case 'resolved': return theme.resolved;
      default: return theme.textTertiary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getCategoryColor = (cat: ComplaintCategory) => {
    const map: Record<string, string> = {
      pothole: '#EF4444', garbage: '#10B981', water: '#3B82F6',
      electricity: '#F59E0B', roads: '#8B5CF6', sanitation: '#14B8A6',
      safety: '#F97316', other: '#6B7280',
    };
    return map[cat] || '#6B7280';
  };

  const renderStatCard = (label: string, value: number, color: string, icon: React.ReactNode) => (
    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );

  const renderComplaintCard = ({ item, index }: { item: Complaint; index: number }) => {
    const catColor = getCategoryColor(item.category);
    return (
      <TouchableOpacity
        style={[styles.complaintCard, { backgroundColor: theme.surface }]}
        onPress={() => setSelectedComplaint(item)}
        activeOpacity={0.7}
      >
        <View style={styles.complaintHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor + '18', borderColor: catColor + '30' }]}>
            <Text style={[styles.categoryBadgeText, { color: catColor }]}>
              {CATEGORY_LABELS[item.category]}
            </Text>
          </View>
          <Text style={[styles.timeAgo, { color: theme.textTertiary }]}>
            {getTimeAgo(item.createdAt)}
          </Text>
        </View>

        <Text style={[styles.complaintTitle, { color: theme.text }]}>{item.title}</Text>

        {item.location && (
          <View style={styles.locationRow}>
            <MapPin size={13} color={theme.textTertiary} />
            <Text style={[styles.locationText, { color: theme.textTertiary }]}>
              {item.location.address}
            </Text>
          </View>
        )}

        <View style={styles.complaintFooter}>
          <Text style={[styles.complaintId, { color: theme.textTertiary }]}>
            ID: #{item.complaintId}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ scale: headerAnim }] }]}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.displayName || 'Citizen'} 👋</Text>
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE SYSTEM</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.headerAvatar}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.avatarText}>
                {(user?.displayName || 'C')[0].toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <FlatList
        data={filteredComplaints}
        keyExtractor={(item) => item.id}
        renderItem={renderComplaintCard}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {renderStatCard('TOTAL', stats.total, '#3B82F6',
                <TrendingUp size={20} color="#3B82F6" />
              )}
              {renderStatCard('PENDING', stats.pending, '#F59E0B',
                <Clock size={20} color="#F59E0B" />
              )}
              {renderStatCard('IN PROGRESS', stats.inProgress, '#3B82F6',
                <AlertTriangle size={20} color="#3B82F6" />
              )}
              {renderStatCard('RESOLVED', stats.resolved, '#10B981',
                <CheckCircle size={20} color="#10B981" />
              )}
            </View>

            {/* Filter Row */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                MY COMPLAINTS
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {['all', 'pending', 'in-progress', 'resolved'].map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: filter === f ? theme.primary : theme.surface,
                        borderColor: filter === f ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setFilter(f)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      { color: filter === f ? '#fff' : theme.textSecondary },
                    ]}>
                      {f === 'all' ? 'All' : getStatusLabel(f)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>No complaints found</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap the + button to report a civic issue
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/report')}
        activeOpacity={0.85}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* Complaint Detail Modal */}
      <Modal
        visible={!!selectedComplaint}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedComplaint(null)}
      >
        {selectedComplaint && (
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderGradient}>
                <TouchableOpacity onPress={() => setSelectedComplaint(null)} style={styles.modalClose}>
                  <X size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>{selectedComplaint.complaintId}</Text>
                <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(selectedComplaint.status) }]}>
                  <Text style={styles.statusBadgeLargeText}>
                    {getStatusLabel(selectedComplaint.status)}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedComplaint.title}
              </Text>

              {/* Category & Priority */}
              <View style={styles.modalTagRow}>
                <View style={[styles.categoryBadge, {
                  backgroundColor: getCategoryColor(selectedComplaint.category) + '18',
                  borderColor: getCategoryColor(selectedComplaint.category) + '30',
                }]}>
                  <Text style={[styles.categoryBadgeText, { color: getCategoryColor(selectedComplaint.category) }]}>
                    {CATEGORY_ICONS[selectedComplaint.category]} {CATEGORY_LABELS[selectedComplaint.category]}
                  </Text>
                </View>
                <View style={[styles.priorityBadge, {
                  backgroundColor: selectedComplaint.priority === 'urgent' ? '#FEF2F2' : '#FFF7ED',
                  borderColor: selectedComplaint.priority === 'urgent' ? '#FECACA' : '#FED7AA',
                }]}>
                  <Text style={[styles.priorityBadgeText, {
                    color: selectedComplaint.priority === 'urgent' ? '#DC2626' : '#EA580C',
                  }]}>
                    {selectedComplaint.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={[styles.modalSection, { backgroundColor: theme.surface }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.textSecondary }]}>Description</Text>
                <Text style={[styles.modalDescription, { color: theme.text }]}>
                  {selectedComplaint.description}
                </Text>
              </View>

              {/* Location */}
              {selectedComplaint.location && (
                <View style={[styles.modalSection, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.textSecondary }]}>Location</Text>
                  <View style={styles.locationDetailRow}>
                    <MapPin size={16} color={theme.primary} />
                    <Text style={[styles.locationDetailText, { color: theme.text }]}>
                      {selectedComplaint.location.address}
                    </Text>
                  </View>
                  <Text style={[styles.coordsText, { color: theme.textTertiary }]}>
                    {selectedComplaint.location.latitude.toFixed(4)}°N, {selectedComplaint.location.longitude.toFixed(4)}°E
                  </Text>
                </View>
              )}

              {/* AI Routing */}
              {selectedComplaint.aiRouting && (
                <View style={[styles.modalSection, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={[styles.modalSectionTitle, { color: '#2563EB' }]}>🤖 AI Routing</Text>
                  <Text style={{ color: '#1E40AF', fontSize: 15, fontWeight: '500' }}>
                    {selectedComplaint.aiRouting}
                  </Text>
                </View>
              )}

              {/* Assigned To */}
              {selectedComplaint.assignedTo && (
                <View style={[styles.modalSection, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.textSecondary }]}>Assigned Officer</Text>
                  <View style={styles.assignedRow}>
                    <View style={styles.officerAvatar}>
                      <Text style={styles.officerAvatarText}>
                        {selectedComplaint.assignedTo[0]}
                      </Text>
                    </View>
                    <Text style={[styles.officerName, { color: theme.text }]}>
                      {selectedComplaint.assignedTo}
                    </Text>
                  </View>
                </View>
              )}

              {/* Status Timeline */}
              <View style={[styles.modalSection, { backgroundColor: theme.surface }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.textSecondary }]}>Status Timeline</Text>
                {selectedComplaint.statusHistory.map((entry, idx) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        { backgroundColor: idx === selectedComplaint.statusHistory.length - 1 ? theme.primary : theme.border },
                      ]} />
                      {idx < selectedComplaint.statusHistory.length - 1 && (
                        <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineStatus, { color: theme.text }]}>
                        {getStatusLabel(entry.status)}
                      </Text>
                      <Text style={[styles.timelineNote, { color: theme.textSecondary }]}>
                        {entry.note}
                      </Text>
                      <Text style={[styles.timelineDate, { color: theme.textTertiary }]}>
                        {new Date(entry.date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Delete Button */}
              {selectedComplaint.status === 'pending' && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteComplaint(selectedComplaint.id)}
                >
                  <Trash2 size={18} color="#EF4444" />
                  <Text style={styles.deleteButtonText}>Delete Complaint</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Header
  header: {},
  headerGradient: {
    backgroundColor: '#2563EB',
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    width: (width - 42) / 2,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  // Filter
  filterSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Complaint cards
  list: {
    paddingBottom: 100,
  },
  complaintCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeAgo: {
    fontSize: 12,
  },
  complaintTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintId: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#2563EB',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {},
  modalHeaderGradient: {
    backgroundColor: '#2563EB',
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statusBadgeLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeLargeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalSection: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  locationDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationDetailText: {
    fontSize: 15,
    fontWeight: '500',
  },
  coordsText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 22,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  officerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officerAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  officerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Timeline
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
    marginBottom: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
    paddingLeft: 8,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineNote: {
    fontSize: 13,
    marginTop: 2,
  },
  timelineDate: {
    fontSize: 11,
    marginTop: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});