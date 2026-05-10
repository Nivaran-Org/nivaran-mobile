import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────────────────
export type ComplaintStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ComplaintCategory = 'pothole' | 'garbage' | 'water' | 'electricity' | 'roads' | 'sanitation' | 'safety' | 'other';

export type Complaint = {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string; // ISO string
  updatedAt: string;
  location: { latitude: number; longitude: number; address: string } | null;
  photoUri: string | null;
  aiRouting: string;
  complaintId: string; // e.g. GRV-1001
  assignedTo: string | null;
  statusHistory: { status: string; date: string; note: string }[];
};

export type UserProfile = {
  name: string;
  phone: string;
  email: string;
  address: string;
  bio: string;
  avatarUri: string | null;
  memberSince: string;
  language: string;
  notificationsEnabled: boolean;
};

export type NotificationItem = {
  id: string;
  type: 'update' | 'announcement' | 'tip' | 'resolved';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  complaintId?: string;
};

// ─── Storage Keys ────────────────────────────────────────────────────
const KEYS = {
  COMPLAINTS: '@nivaran_complaints',
  PROFILE: '@nivaran_profile',
  NOTIFICATIONS: '@nivaran_notifications',
  THEME: '@nivaran_theme',
  IS_LOGGED_IN: '@nivaran_logged_in',
  DEMO_SEEDED: '@nivaran_demo_seeded',
};

// ─── Demo Seed Data ──────────────────────────────────────────────────
const DEMO_COMPLAINTS: Complaint[] = [
  {
    id: '1',
    title: 'Deep Pothole on GT Road',
    description: 'Large pothole near the main crossing causing accidents. Multiple vehicles damaged in the past week. Needs urgent repair.',
    category: 'pothole',
    priority: 'urgent',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    location: { latitude: 31.3260, longitude: 75.5762, address: 'GT Road, Near Central Market' },
    photoUri: null,
    aiRouting: 'Roads & Infrastructure Department',
    complaintId: 'GRV-1001',
    assignedTo: 'R. Sharma',
    statusHistory: [
      { status: 'pending', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), note: 'Complaint registered' },
      { status: 'in-progress', date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), note: 'Assigned to R. Sharma' },
    ],
  },
  {
    id: '2',
    title: 'Illegal Waste Dumping',
    description: 'Large pile of garbage dumped near residential area in Model Town. Foul smell and health hazard for residents.',
    category: 'garbage',
    priority: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    location: { latitude: 31.3300, longitude: 75.5800, address: 'Model Town, Jalandhar' },
    photoUri: null,
    aiRouting: 'Sanitation Department',
    complaintId: 'GRV-1024',
    assignedTo: null,
    statusHistory: [
      { status: 'pending', date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), note: 'Complaint registered' },
    ],
  },
  {
    id: '3',
    title: 'Water Pipeline Leakage',
    description: 'Major water pipeline burst on Railway Road. Water wasting continuously for 3 days. Residents facing water shortage.',
    category: 'water',
    priority: 'high',
    status: 'resolved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    location: { latitude: 31.3210, longitude: 75.5720, address: 'Railway Road, Block B' },
    photoUri: null,
    aiRouting: 'Water Supply Department',
    complaintId: 'GRV-1015',
    assignedTo: 'S. Amrit',
    statusHistory: [
      { status: 'pending', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), note: 'Complaint registered' },
      { status: 'in-progress', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), note: 'Assigned to S. Amrit' },
      { status: 'resolved', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'Pipeline repaired successfully' },
    ],
  },
  {
    id: '4',
    title: 'Street Light Failure',
    description: 'Multiple street lights not working on entire stretch of Mall Road. Area completely dark at night, safety concern.',
    category: 'electricity',
    priority: 'medium',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    location: { latitude: 31.3280, longitude: 75.5740, address: 'Mall Road, Sector 5' },
    photoUri: null,
    aiRouting: 'Electricity Department',
    complaintId: 'GRV-1018',
    assignedTo: 'M. Pathak',
    statusHistory: [
      { status: 'pending', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), note: 'Complaint registered' },
      { status: 'in-progress', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'Assigned to M. Pathak' },
    ],
  },
  {
    id: '5',
    title: 'Stray Animal Menace',
    description: 'Pack of stray dogs near children\'s park in Rama Mandi. Children and elderly residents are scared to use the park.',
    category: 'safety',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    location: { latitude: 31.3350, longitude: 75.5850, address: 'Rama Mandi, Near Park' },
    photoUri: null,
    aiRouting: 'Animal Control Department',
    complaintId: 'GRV-1026',
    assignedTo: null,
    statusHistory: [
      { status: 'pending', date: new Date(Date.now() - 45 * 60 * 1000).toISOString(), note: 'Complaint registered' },
    ],
  },
  {
    id: '6',
    title: 'Broken Road Divider',
    description: 'Road divider broken and scattered on Bypass Road. Causing traffic confusion and near-miss accidents.',
    category: 'roads',
    priority: 'high',
    status: 'resolved',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: { latitude: 31.3150, longitude: 75.5680, address: 'Bypass Road, Near Toll' },
    photoUri: null,
    aiRouting: 'Roads & Infrastructure Department',
    complaintId: 'GRV-1008',
    assignedTo: 'K. Verma',
    statusHistory: [
      { status: 'pending', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), note: 'Complaint registered' },
      { status: 'in-progress', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), note: 'Assigned to K. Verma' },
      { status: 'resolved', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), note: 'Divider repaired and painted' },
    ],
  },
  {
    id: '7',
    title: 'Overflowing Drain',
    description: 'Storm drain overflowing near Guru Nanak Colony. Dirty water entering houses. Immediate action needed.',
    category: 'sanitation',
    priority: 'urgent',
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    location: { latitude: 31.3400, longitude: 75.5900, address: 'Guru Nanak Colony, Sector 2' },
    photoUri: null,
    aiRouting: 'Sanitation Department',
    complaintId: 'GRV-1025',
    assignedTo: null,
    statusHistory: [
      { status: 'pending', date: new Date(Date.now() - 12 * 60 * 1000).toISOString(), note: 'Complaint registered' },
    ],
  },
  {
    id: '8',
    title: 'Damaged Footpath',
    description: 'Footpath tiles broken near bus stand. Pedestrians are tripping, especially elderly citizens and those with disabilities.',
    category: 'roads',
    priority: 'low',
    status: 'resolved',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: { latitude: 31.3180, longitude: 75.5700, address: 'Bus Stand Road' },
    photoUri: null,
    aiRouting: 'Roads & Infrastructure Department',
    complaintId: 'GRV-1002',
    assignedTo: 'P. Singh',
    statusHistory: [
      { status: 'pending', date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), note: 'Complaint registered' },
      { status: 'in-progress', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), note: 'Assigned to P. Singh' },
      { status: 'resolved', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), note: 'New tiles laid' },
    ],
  },
];

const DEMO_PROFILE: UserProfile = {
  name: 'Souvik',
  phone: '+91 98765 43210',
  email: 'souvik@example.com',
  address: 'Model Town, Jalandhar, Punjab',
  bio: 'Active citizen committed to making our city better 🏙️',
  avatarUri: null,
  memberSince: '2026-01-15',
  language: 'English',
  notificationsEnabled: true,
};

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'update',
    title: 'Complaint Update',
    message: 'Your pothole complaint (GRV-1001) has been assigned to R. Sharma',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    read: false,
    complaintId: 'GRV-1001',
  },
  {
    id: 'n2',
    type: 'resolved',
    title: 'Issue Resolved! 🎉',
    message: 'Water Pipeline Leakage (GRV-1015) has been successfully resolved',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    complaintId: 'GRV-1015',
  },
  {
    id: 'n3',
    type: 'announcement',
    title: 'System Maintenance',
    message: 'NIVARAN will undergo scheduled maintenance on May 5th from 2-4 AM',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'n4',
    type: 'tip',
    title: 'Quick Tip 💡',
    message: 'Add photos to your complaints for faster resolution! Complaints with images are resolved 40% faster.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'n5',
    type: 'update',
    title: 'Complaint Update',
    message: 'Street Light Failure (GRV-1018) is now being worked on by M. Pathak',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    complaintId: 'GRV-1018',
  },
  {
    id: 'n6',
    type: 'resolved',
    title: 'Issue Resolved! 🎉',
    message: 'Broken Road Divider (GRV-1008) has been repaired and painted',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    complaintId: 'GRV-1008',
  },
  {
    id: 'n7',
    type: 'announcement',
    title: 'New Feature: AI Routing',
    message: 'NIVARAN now uses AI to automatically route your complaints to the right department!',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

// ─── Storage Service ─────────────────────────────────────────────────
export const DemoStorage = {
  // ── Seed demo data ──
  async seedIfNeeded(): Promise<void> {
    try {
      const seeded = await AsyncStorage.getItem(KEYS.DEMO_SEEDED);
      if (seeded) return;
      await AsyncStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(DEMO_COMPLAINTS));
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(DEMO_PROFILE));
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(DEMO_NOTIFICATIONS));
      await AsyncStorage.setItem(KEYS.DEMO_SEEDED, 'true');
    } catch (e) {
      console.error('Seed error:', e);
    }
  },

  // ── Complaints ──
  async getComplaints(): Promise<Complaint[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.COMPLAINTS);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  async addComplaint(complaint: Omit<Complaint, 'id' | 'complaintId'>): Promise<Complaint> {
    const complaints = await this.getComplaints();
    const newId = String(Date.now());
    const seqNum = 1027 + complaints.length;
    const newComplaint: Complaint = {
      ...complaint,
      id: newId,
      complaintId: `GRV-${seqNum}`,
    };
    complaints.unshift(newComplaint);
    await AsyncStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(complaints));

    // Also add a notification
    const notifications = await this.getNotifications();
    notifications.unshift({
      id: `n${Date.now()}`,
      type: 'update',
      title: 'Complaint Registered',
      message: `Your complaint "${newComplaint.title}" (${newComplaint.complaintId}) has been registered`,
      timestamp: new Date().toISOString(),
      read: false,
      complaintId: newComplaint.complaintId,
    });
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));

    return newComplaint;
  },

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<void> {
    const complaints = await this.getComplaints();
    const idx = complaints.findIndex(c => c.id === id);
    if (idx !== -1) {
      complaints[idx] = { ...complaints[idx], ...updates, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(complaints));
    }
  },

  async deleteComplaint(id: string): Promise<void> {
    const complaints = await this.getComplaints();
    const filtered = complaints.filter(c => c.id !== id);
    await AsyncStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(filtered));
  },

  // ── Profile ──
  async getProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : DEMO_PROFILE;
    } catch { return DEMO_PROFILE; }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getProfile();
    const updated = { ...profile, ...updates };
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  // ── Notifications ──
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  async markNotificationRead(id: string): Promise<void> {
    const notifications = await this.getNotifications();
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifications[idx].read = true;
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    const notifications = await this.getNotifications();
    notifications.forEach(n => n.read = true);
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  // ── Theme ──
  async getTheme(): Promise<'light' | 'dark'> {
    try {
      const theme = await AsyncStorage.getItem(KEYS.THEME);
      return (theme as 'light' | 'dark') || 'light';
    } catch { return 'light'; }
  },

  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    await AsyncStorage.setItem(KEYS.THEME, theme);
  },

  // ── Auth ──
  async setLoggedIn(value: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.IS_LOGGED_IN, value ? 'true' : 'false');
  },

  async isLoggedIn(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.IS_LOGGED_IN);
    return val === 'true';
  },

  // ── Reset ──
  async resetAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.COMPLAINTS, KEYS.PROFILE, KEYS.NOTIFICATIONS,
      KEYS.THEME, KEYS.IS_LOGGED_IN, KEYS.DEMO_SEEDED,
    ]);
  },
};
