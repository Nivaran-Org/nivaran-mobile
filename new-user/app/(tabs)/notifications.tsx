import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DemoStorage, NotificationItem } from '../../services/DemoStorage';
import {
  Bell, CheckCircle, AlertTriangle, Lightbulb, Megaphone,
  CheckCheck, Trash2,
} from 'lucide-react-native';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadNotifications();
    Animated.spring(headerAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, []);

  const loadNotifications = async () => {
    const data = await DemoStorage.getNotifications();
    setNotifications(data);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  const markAsRead = async (id: string) => {
    await DemoStorage.markNotificationRead(id);
    loadNotifications();
  };

  const markAllRead = async () => {
    await DemoStorage.markAllNotificationsRead();
    loadNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'update': return <AlertTriangle size={20} color="#3B82F6" />;
      case 'resolved': return <CheckCircle size={20} color="#10B981" />;
      case 'announcement': return <Megaphone size={20} color="#8B5CF6" />;
      case 'tip': return <Lightbulb size={20} color="#F59E0B" />;
    }
  };

  const getNotifColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'update': return '#DBEAFE';
      case 'resolved': return '#D1FAE5';
      case 'announcement': return '#EDE9FE';
      case 'tip': return '#FEF3C7';
    }
  };

  const getNotifBorderColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'update': return '#93C5FD';
      case 'resolved': return '#6EE7B7';
      case 'announcement': return '#C4B5FD';
      case 'tip': return '#FCD34D';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const renderNotification = ({ item, index }: { item: NotificationItem; index: number }) => (
    <TouchableOpacity
      style={[
        styles.notifCard,
        {
          backgroundColor: item.read ? theme.surface : getNotifColor(item.type),
          borderColor: item.read ? theme.border : getNotifBorderColor(item.type),
        },
      ]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.notifIconContainer, { backgroundColor: item.read ? theme.borderLight : '#fff' }]}>
        {getNotifIcon(item.type)}
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, { color: theme.text, fontWeight: item.read ? '500' : '700' }]}>
            {item.title}
          </Text>
          <Text style={[styles.notifTime, { color: theme.textTertiary }]}>
            {getTimeAgo(item.timestamp)}
          </Text>
        </View>
        <Text style={[styles.notifMessage, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ scale: headerAnim }] }]}>
        <View style={styles.headerGradient}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllRead}>
              <CheckCheck size={16} color="#fff" />
              <Text style={styles.markAllText}>Read All</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>No notifications</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              You're all caught up!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  headerGradient: {
    backgroundColor: '#2563EB',
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  notifCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  notifIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
    position: 'relative',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 11,
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
