import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminTabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#1E3A8A',
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: { height: 60, paddingBottom: 10 },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Operations',
          tabBarIcon: ({ color }) => <Ionicons name="construct-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'National',
          tabBarIcon: ({ color }) => <Ionicons name="globe-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
