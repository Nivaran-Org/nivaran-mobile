import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    // Animation: Fade in and Scale up
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, { duration: 1000 });

    const timeout = setTimeout(() => {
      router.replace('/tab1');
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Text style={styles.title}>NIVARAN</Text>
        <Text style={styles.subtitle}>Officer Redressal Portal</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Dark professional theme
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4D96FF',
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 2,
  },
});