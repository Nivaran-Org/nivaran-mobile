import { Stack } from 'expo-router';
// Import both providers from your root contexts folder
import { AuthProvider } from '../contexts/AuthContext';
import { ComplaintsProvider } from '../contexts/ComplaintsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ComplaintsProvider> 
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Login' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ComplaintsProvider>
    </AuthProvider>
  );
}