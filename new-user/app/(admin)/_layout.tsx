import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Bell, User } from 'lucide-react-native';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'admin') return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#7c3aed',
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#ede9fe' },
      headerShown: false,
    }}>
      <Tabs.Screen name="dashboard"    options={{ title: 'Dashboard',     tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} /> }} />
      <Tabs.Screen name="notification" options={{ title: 'Notifications', tabBarIcon: ({ color }) => <Bell size={22} color={color} /> }} />
      <Tabs.Screen name="profile"      options={{ title: 'Profile',       tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tabs>
  );
}