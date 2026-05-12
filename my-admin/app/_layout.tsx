import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // On native, no DOM timing issues — ready immediately
      setIsReady(true);
      return;
    }

    // On web, the "Cannot read properties of null (reading 'dispatchEvent')"
    // error happens because Expo Router's internal History object is null
    // at the moment the first navigation event fires.
    //
    // Root cause: window.history.pushState internally calls dispatchEvent
    // on a reference that Expo Router hasn't fully initialized yet.
    // Simply waiting for a timeout isn't reliable — instead we POLL
    // until window.history is confirmed non-null and fully ready,
    // then set isReady. This guarantees the Stack never mounts
    // until the browser History API is safe to use.
    const checkReady = () => {
      if (
        typeof window !== 'undefined' &&
        window.history &&
        typeof window.history.pushState === 'function'
      ) {
        setIsReady(true);
      } else {
        // History not ready yet — check again next frame
        requestAnimationFrame(checkReady);
      }
    };

    // Start checking on next frame (not synchronously, to let
    // the browser finish its initial layout pass first)
    requestAnimationFrame(checkReady);
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1E3A8A',
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  // On web: skip SafeAreaProvider (its NativeSafeAreaProvider portal node
  // causes the removeChild DOM crash on navigation) and disable animations
  // (slide animations keep two screen trees alive simultaneously, causing
  // React fiber to lose track of DOM node parents).
  if (Platform.OS === 'web') {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      />
    );
  }

  // On native: keep SafeAreaProvider for correct notch/home indicator insets
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
}