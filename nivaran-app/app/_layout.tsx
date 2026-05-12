import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(user)" />
        <Stack.Screen name="(officer)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </AuthProvider>
  );
}
