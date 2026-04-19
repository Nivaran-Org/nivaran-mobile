import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      {/* Explicitly defining the dynamic route path */}
      <Stack.Screen 
        name="details/[id]" 
        options={{ 
          headerShown: true, 
          title: 'Investigation',
          headerTitleStyle: { fontWeight: '900', color: '#1E3A8A' }
        }} 
      />
    </Stack>
  );
}