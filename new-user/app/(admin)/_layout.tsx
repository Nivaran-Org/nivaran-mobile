import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'admin') return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#1E3A8A',
      tabBarInactiveTintColor: '#94A3B8',
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '800',
      },
    }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="notification" 
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }} 
      />
      
      {/* Hidden Screens */}
      <Tabs.Screen name="screens/new-cases" options={{ href: null }} />
      <Tabs.Screen name="screens/active-cases" options={{ href: null }} />
      <Tabs.Screen name="screens/resolved-cases" options={{ href: null }} />
      <Tabs.Screen name="screens/overdue" options={{ href: null }} />
      <Tabs.Screen name="screens/case-details" options={{ href: null }} />
      <Tabs.Screen name="screens/staff-history" options={{ href: null }} />
      <Tabs.Screen name="screens/staff-online" options={{ href: null }} />
      <Tabs.Screen name="details" options={{ href: null }} />
      <Tabs.Screen name="grievance" options={{ href: null }} />
    </Tabs>
  );
}