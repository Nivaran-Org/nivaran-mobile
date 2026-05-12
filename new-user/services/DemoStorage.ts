import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.18.7:5000';
const AI_URL = 'http://192.168.18.7:8000';

// ─── Types (keep same so home.tsx doesn't break) ─────────────────────
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
  createdAt: string;
  updatedAt: string;
  location: { latitude: number; longitude: number; address: string } | null;
  photoUri: string | null;
  aiRouting: string;
  complaintId: string;
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

// ─── Helper ──────────────────────────────────────────────────────────
const getHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Map backend complaint to frontend Complaint type
const mapComplaint = (c: any): Complaint => ({
  id: String(c.id),
  title: c.title,
  description: c.description,
  category: 'other' as ComplaintCategory,
  priority: (c.priority || 'medium') as ComplaintPriority,
  status: c.status === 'in progress' ? 'in-progress' : c.status as ComplaintStatus,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
  location: c.latitude ? {
    latitude: parseFloat(c.latitude),
    longitude: parseFloat(c.longitude),
    address: `${c.latitude}, ${c.longitude}`,
  } : null,
  photoUri: c.photo_url || null,
  aiRouting: c.department
    ? `${c.department} (${(c.ai_confidence * 100).toFixed(1)}% confidence)`
    : 'Pending AI routing',
  complaintId: `GRV-${c.id}`,
  assignedTo: c.assigned_to ? `Officer #${c.assigned_to}` : null,
  statusHistory: [
    { status: 'pending', date: c.created_at, note: 'Complaint registered' },
    ...(c.status !== 'pending' ? [{ status: c.status, date: c.updated_at, note: `Status updated to ${c.status}` }] : []),
  ],
});

// ─── Storage Service ─────────────────────────────────────────────────
export const DemoStorage = {

  async seedIfNeeded(): Promise<void> {
    // No seeding needed — data comes from backend
    return;
  },

  // ── Complaints ──
  async getComplaints(): Promise<Complaint[]> {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE_URL}/api/complaints`, { headers });
      const data = await res.json();
      if (data.success) return data.data.map(mapComplaint);
      return [];
    } catch (e) {
      console.error('Fetch complaints error:', e);
      return [];
    }
  },

  async addComplaint(complaint: Omit<Complaint, 'id' | 'complaintId'>): Promise<Complaint> {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/complaints`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: complaint.title,
        description: complaint.description,
        latitude: complaint.location?.latitude || null,
        longitude: complaint.location?.longitude || null,
        photo_url: complaint.photoUri || null,
      }),
    });
    const data = await res.json();
    if (data.success) return mapComplaint(data.data);
    throw new Error(data.message || 'Failed to submit complaint');
  },

  async deleteComplaint(id: string): Promise<void> {
    // Backend doesn't have delete yet — remove locally for now
    console.log('Delete not implemented in backend yet:', id);
  },

  // ── Profile ──
  async getProfile(): Promise<UserProfile> {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const u = JSON.parse(userData);
        return {
          name: u.name,
          phone: '',
          email: u.email,
          address: '',
          bio: 'Active citizen committed to making our city better 🏙️',
          avatarUri: null,
          memberSince: u.created_at || new Date().toISOString(),
          language: 'English',
          notificationsEnabled: true,
        };
      }
    } catch (e) {}
    return {
      name: 'Citizen',
      phone: '',
      email: '',
      address: '',
      bio: '',
      avatarUri: null,
      memberSince: new Date().toISOString(),
      language: 'English',
      notificationsEnabled: true,
    };
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getProfile();
    return { ...profile, ...updates };
  },

  // ── Notifications (keep local for now) ──
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const data = await AsyncStorage.getItem('@nivaran_notifications');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  async markNotificationRead(id: string): Promise<void> {
    const notifications = await this.getNotifications();
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifications[idx].read = true;
      await AsyncStorage.setItem('@nivaran_notifications', JSON.stringify(notifications));
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    const notifications = await this.getNotifications();
    notifications.forEach(n => n.read = true);
    await AsyncStorage.setItem('@nivaran_notifications', JSON.stringify(notifications));
  },

  // ── Theme ──
  async getTheme(): Promise<'light' | 'dark'> {
    try {
      const theme = await AsyncStorage.getItem('@nivaran_theme');
      return (theme as 'light' | 'dark') || 'light';
    } catch { return 'light'; }
  },

  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    await AsyncStorage.setItem('@nivaran_theme', theme);
  },

  // ── Auth ──
  async setLoggedIn(value: boolean): Promise<void> {
    await AsyncStorage.setItem('@nivaran_logged_in', value ? 'true' : 'false');
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },

  async resetAllData(): Promise<void> {
    await AsyncStorage.clear();
  },
};