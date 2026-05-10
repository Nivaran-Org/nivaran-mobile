import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  Animated,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { DemoStorage, UserProfile } from '../../services/DemoStorage';
import { router } from 'expo-router';
import {
  User, Mail, MapPin, Phone, Edit3, Save, Moon, Sun,
  Bell, Globe, Shield, Info, Star, ChevronRight,
  LogOut, Trash2, Camera, Award, CheckCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, signOutUser } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfile();
    loadStats();
    Animated.spring(headerAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, []);

  const loadProfile = async () => {
    const p = await DemoStorage.getProfile();
    setProfile(p);
    setEditForm(p);
    setLoading(false);
  };

  const loadStats = async () => {
    const complaints = await DemoStorage.getComplaints();
    setStats({
      total: complaints.length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      pending: complaints.filter(c => c.status === 'pending').length,
    });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const updated = await DemoStorage.updateProfile(editForm);
      setProfile(updated);
      setEditing(false);
      Alert.alert('✅ Saved', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const updated = await DemoStorage.updateProfile({ avatarUri: result.assets[0].uri });
      setProfile(updated);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOutUser();
          router.replace('/');
        },
      },
    ]);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all complaints, profile data, and notifications. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await DemoStorage.resetAllData();
            await signOutUser();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (loading || !profile) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const resolvedRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ scale: headerAnim }] }]}>
          <View style={styles.headerGradient}>
            <Text style={styles.headerTitle}>My Profile</Text>

            {/* Avatar */}
            <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar} activeOpacity={0.8}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>
                  {profile.name[0]?.toUpperCase() || 'C'}
                </Text>
              </View>
              <View style={styles.cameraBadge}>
                <Camera size={12} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profilePhone}>{profile.phone}</Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.resolved}</Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{resolvedRate}%</Text>
                <Text style={styles.statLabel}>Success</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Member Badge */}
        <View style={[styles.memberBadge, { backgroundColor: theme.surface }]}>
          <Award size={18} color="#F59E0B" />
          <Text style={[styles.memberBadgeText, { color: theme.text }]}>
            Active Citizen since {new Date(profile.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PERSONAL INFORMATION</Text>
            <TouchableOpacity onPress={() => editing ? saveProfile() : setEditing(true)} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : editing ? (
                <View style={styles.saveButton}>
                  <Save size={14} color="#fff" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </View>
              ) : (
                <View style={styles.editButton}>
                  <Edit3 size={14} color={theme.primary} />
                  <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <ProfileField
              icon={<User size={18} color={theme.primary} />}
              label="Full Name"
              value={editing ? editForm.name || '' : profile.name}
              editing={editing}
              onChangeText={(t) => setEditForm(prev => ({ ...prev, name: t }))}
              theme={theme}
            />
            <View style={[styles.fieldDivider, { backgroundColor: theme.borderLight }]} />
            <ProfileField
              icon={<Mail size={18} color={theme.primary} />}
              label="Email"
              value={editing ? editForm.email || '' : profile.email}
              editing={editing}
              onChangeText={(t) => setEditForm(prev => ({ ...prev, email: t }))}
              theme={theme}
              keyboardType="email-address"
            />
            <View style={[styles.fieldDivider, { backgroundColor: theme.borderLight }]} />
            <ProfileField
              icon={<Phone size={18} color={theme.primary} />}
              label="Phone"
              value={profile.phone}
              editing={false}
              theme={theme}
            />
            <View style={[styles.fieldDivider, { backgroundColor: theme.borderLight }]} />
            <ProfileField
              icon={<MapPin size={18} color={theme.primary} />}
              label="Address"
              value={editing ? editForm.address || '' : profile.address}
              editing={editing}
              onChangeText={(t) => setEditForm(prev => ({ ...prev, address: t }))}
              theme={theme}
            />
          </View>

          {/* Bio */}
          <View style={[styles.bioCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.bioLabel, { color: theme.textSecondary }]}>Bio</Text>
            {editing ? (
              <TextInput
                style={[styles.bioInput, { color: theme.text, borderColor: theme.inputBorder }]}
                value={editForm.bio || ''}
                onChangeText={(t) => setEditForm(prev => ({ ...prev, bio: t }))}
                multiline
                numberOfLines={3}
                placeholderTextColor={theme.textTertiary}
              />
            ) : (
              <Text style={[styles.bioText, { color: theme.text }]}>{profile.bio}</Text>
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginBottom: 12 }]}>
            SETTINGS
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
            {/* Theme Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                {isDark ? <Moon size={20} color="#FBBF24" /> : <Sun size={20} color="#F59E0B" />}
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingDesc, { color: theme.textTertiary }]}>
                    {isDark ? 'Dark theme active' : 'Light theme active'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={isDark ? '#2563EB' : '#F3F4F6'}
              />
            </View>

            <View style={[styles.fieldDivider, { backgroundColor: theme.borderLight }]} />

            {/* Notifications */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell size={20} color="#10B981" />
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
                  <Text style={[styles.settingDesc, { color: theme.textTertiary }]}>
                    Push notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={profile.notificationsEnabled}
                onValueChange={async (v) => {
                  const updated = await DemoStorage.updateProfile({ notificationsEnabled: v });
                  setProfile(updated);
                }}
                trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                thumbColor={profile.notificationsEnabled ? '#10B981' : '#F3F4F6'}
              />
            </View>

            <View style={[styles.fieldDivider, { backgroundColor: theme.borderLight }]} />

            {/* Language */}
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.6}>
              <View style={styles.settingLeft}>
                <Globe size={20} color="#8B5CF6" />
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Language</Text>
                  <Text style={[styles.settingDesc, { color: theme.textTertiary }]}>
                    {profile.language}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginBottom: 12 }]}>
            ABOUT
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.6}>
              <View style={styles.settingLeft}>
                <Shield size={20} color="#2563EB" />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Privacy Policy</Text>
              </View>
              <ChevronRight size={20} color={theme.textTertiary} />
            </TouchableOpacity>

            <View style={[styles.fieldDivider, { backgroundColor: theme.borderLight }]} />

            <TouchableOpacity style={styles.settingRow} activeOpacity={0.6}>
              <View style={styles.settingLeft}>
                <Info size={20} color="#6B7280" />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Terms of Service</Text>
              </View>
              <ChevronRight size={20} color={theme.textTertiary} />
            </TouchableOpacity>

            <View style={[styles.fieldDivider, { backgroundColor: theme.borderLight }]} />

            <TouchableOpacity style={styles.settingRow} activeOpacity={0.6}>
              <View style={styles.settingLeft}>
                <Star size={20} color="#F59E0B" />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Rate App</Text>
              </View>
              <ChevronRight size={20} color={theme.textTertiary} />
            </TouchableOpacity>

            <View style={[styles.fieldDivider, { backgroundColor: theme.borderLight }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Info size={20} color={theme.textTertiary} />
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>App Version</Text>
                  <Text style={[styles.settingDesc, { color: theme.textTertiary }]}>v1.0.0 (Demo)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.section, { paddingBottom: 40 }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={handleResetData}
            activeOpacity={0.8}
          >
            <Trash2 size={18} color="#94A3B8" />
            <Text style={styles.resetText}>Reset Demo Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Reusable profile field component
function ProfileField({
  icon, label, value, editing, onChangeText, theme, keyboardType
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChangeText?: (t: string) => void;
  theme: any;
  keyboardType?: string;
}) {
  return (
    <View style={styles.fieldRow}>
      <View style={[styles.fieldIcon, { backgroundColor: theme.primaryLight }]}>{icon}</View>
      <View style={styles.fieldContent}>
        <Text style={[styles.fieldLabel, { color: theme.textTertiary }]}>{label}</Text>
        {editing && onChangeText ? (
          <TextInput
            style={[styles.fieldInput, { color: theme.text, borderColor: theme.inputBorder }]}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor={theme.textTertiary}
            keyboardType={keyboardType as any}
          />
        ) : (
          <Text style={[styles.fieldValue, { color: theme.text }]}>{value}</Text>
        )}
      </View>
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
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '85%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  // Member badge
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  memberBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Sections
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Info card
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: '500',
    borderBottomWidth: 1,
    paddingVertical: 2,
  },
  fieldDivider: {
    height: 1,
    marginLeft: 62,
  },
  // Bio
  bioCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bioLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bioInput: {
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  // Settings
  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  // Actions
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'transparent',
  },
  resetText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});