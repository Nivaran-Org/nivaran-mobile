import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Home, FileText, User } from 'lucide-react-native';

export default function OfficerLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'officer') return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#1d4ed8',
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#dbeafe' },
      headerShown: false,
    }}>
      <Tabs.Screen name="home"    options={{ title: 'Complaints', tabBarIcon: ({ color }) => <Home size={22} color={color} /> }} />
      <Tabs.Screen name="report"  options={{ title: 'Update',     tabBarIcon: ({ color }) => <FileText size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile',    tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tabs>
  );
}