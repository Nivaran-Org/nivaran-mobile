import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ComplaintsProvider } from '../contexts/ComplaintsContext';

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ComplaintsProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(officer)" />
            <Stack.Screen name="(admin)" />
          </Stack>
        </ComplaintsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}