import { Stack } from 'expo-router';
import { AdminAuthProvider } from '../contexts/AdminAuthContext';

export default function RootLayout() {
  return (
    <AdminAuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AdminAuthProvider>
  );
}