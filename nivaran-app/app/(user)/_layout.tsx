import { Tabs } from 'expo-router';
import { Home, FileText, User } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function UserTabLayout() {
  const { user, userRole, isRoleLoading } = useAuth();

  if (!user) {
    return <Redirect href="/" />;
  }

  if (isRoleLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Redirect if wrong role
  if (userRole === 'admin') return <Redirect href="/(admin)/(tabs)/" />;
  if (userRole === 'officer') return <Redirect href="/(officer)/home" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report Issue',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
