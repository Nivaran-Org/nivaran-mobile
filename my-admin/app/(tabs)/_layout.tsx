/**
 * FILE: app/(tabs)/_layout.tsx
 *
 * This file configures the BOTTOM TAB BAR for the entire app.
 * All screens inside app/(tabs)/ automatically appear as tabs here.
 *
 * Tabs defined:
 *   1. index         → Dashboard (home)
 *   2. notifications → Alerts / Notifications
 *   3. profile       → Admin Profile
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E3A8A',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 80 : 65,
          paddingBottom: Platform.OS === 'ios' ? 22 : 10,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#1E3A8A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: '#60A5FA',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
      }}
    >
      {/* ── Tab 1: Dashboard ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? {
              backgroundColor: 'rgba(96,165,250,0.15)',
              borderRadius: 10,
              padding: 4,
            } : {}}>
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* ── Tab 2: Notifications / Alerts ── */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarBadge: 3,                // remove or make dynamic once connected
          tabBarBadgeStyle: {
            backgroundColor: '#EF4444',
            fontSize: 10,
            fontWeight: '900',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? {
              backgroundColor: 'rgba(96,165,250,0.15)',
              borderRadius: 10,
              padding: 4,
            } : {}}>
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* ── Tab 3: Profile ── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? {
              backgroundColor: 'rgba(96,165,250,0.15)',
              borderRadius: 10,
              padding: 4,
            } : {}}>
              <Ionicons
                name={focused ? 'person-circle' : 'person-circle-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}