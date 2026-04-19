import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#1E3A8A',
      headerShown: false 
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tab1"
        options={{
          title: 'Complaints',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
        }}
      />
      {/* These hide unused files from the bottom bar so they don't crash */}
      <Tabs.Screen name="tab2" options={{ href: null }} />
      <Tabs.Screen name="tab3" options={{ href: null }} />
    </Tabs>
  );
}