import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function AdminLayout() {
  const { user, userRole, isRoleLoading } = useAuth();

  if (!user) {
    return <Redirect href="/" />;
  }

  if (isRoleLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  // Redirect if wrong role
  if (userRole === 'user') return <Redirect href="/(user)/home" />;
  if (userRole === 'officer') return <Redirect href="/(officer)/home" />;

  // Expo Router auto-discovers all nested routes — no need to explicitly list them
  return <Stack screenOptions={{ headerShown: false }} />;
}
