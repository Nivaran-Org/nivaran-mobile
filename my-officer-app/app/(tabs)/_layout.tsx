import { Tabs, Redirect } from 'expo-router';
import { LayoutDashboard, FileText, UserCircle2 } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext'; // <--- Two levels up
import { View, StyleSheet, Platform } from 'react-native';

export default function TabLayout() {
  const { user } = useAuth();

  // If no user is logged in, boot them back to the login page (index.tsx)
  if (!user) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#607D8B',
        tabBarStyle: {
          backgroundColor: '#0A2342',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
        },
        headerStyle: { backgroundColor: '#0A2342' },
        headerTintColor: '#FFD700',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Grievance',
          tabBarIcon: ({ color }) => <FileText size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserCircle2 size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}