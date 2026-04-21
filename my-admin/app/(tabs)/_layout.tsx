import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#1E3A8A', // Royal Blue
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: { height: 60, paddingBottom: 10 },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Operations',
          tabBarIcon: ({ color }) => <Ionicons name="Construct-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Incentives',
          tabBarIcon: ({ color }) => <Ionicons name="gift-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="legal"
        options={{
          title: 'Legal',
          tabBarIcon: ({ color }) => <Ionicons name="shield-half-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}