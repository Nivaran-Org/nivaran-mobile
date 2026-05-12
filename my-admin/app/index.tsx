/**
 * FILE: app/index.tsx
 *
 * This is the ENTRY POINT of the app.
 * It shows an animated splash screen (tricolor inspired, like the Swachhata ref),
 * then automatically navigates to the main tabs layout.
 *
 * FOLDER STRUCTURE ASSUMED:
 *   app/
 *     index.tsx          ← THIS FILE (splash)
 *     (tabs)/
 *       _layout.tsx      ← Tab bar layout
 *       index.tsx        ← Dashboard (home tab)
 *       notifications.tsx
 *       profile.tsx
 *     screens/
 *       new-cases.tsx
 *       case-details.tsx
 *       ...
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // ── Animation values ────────────────────────────────────────────────────────
  const topStripeAnim   = useRef(new Animated.Value(-height * 0.35)).current; // saffron stripe slides in from top
  const botStripeAnim   = useRef(new Animated.Value(height * 0.35)).current;  // green stripe slides in from bottom
  const logoFade        = useRef(new Animated.Value(0)).current;
  const logoScale       = useRef(new Animated.Value(0.5)).current;
  const taglineFade     = useRef(new Animated.Value(0)).current;
  const taglineSlide    = useRef(new Animated.Value(30)).current;
  const ashokFade       = useRef(new Animated.Value(0)).current;
  const ashokSpin       = useRef(new Animated.Value(0)).current;
  const exitFade        = useRef(new Animated.Value(1)).current; // whole screen fades out

  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    // ── Step 1: Tricolor stripes slide in ─────────────────────────────────
    Animated.parallel([
      Animated.timing(topStripeAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(botStripeAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {

      // ── Step 2: Ashoka-style chakra fades + spins in ───────────────────
      Animated.parallel([
        Animated.timing(ashokFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(ashokSpin, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // ── Step 3: Logo pops in ───────────────────────────────────────────
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // ── Step 4: Tagline slides up ──────────────────────────────────────
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(taglineFade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(taglineSlide, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      }, 400);

      // ── Step 5: Full screen fades out → navigate ───────────────────────
      setTimeout(() => {
        Animated.timing(exitFade, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }).start(() => {
          router.replace('/(tabs)');
        });
      }, 2800);
    });
  }, []);

  const chakraSpin = ashokSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.root, { opacity: exitFade }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* ── White middle background ── */}
      <View style={styles.whiteMiddle} />

      {/* ── Saffron stripe (top) ── */}
      <Animated.View
        style={[styles.saffronStripe, { transform: [{ translateY: topStripeAnim }] }]}
      />

      {/* ── Green stripe (bottom) ── */}
      <Animated.View
        style={[styles.greenStripe, { transform: [{ translateY: botStripeAnim }] }]}
      />

      {/* ── Navy overlay center card ── */}
      <View style={styles.centerCard}>

        {/* Ministry badge row */}
        <Animated.View style={[styles.ministryRow, { opacity: logoFade }]}>
          <View style={styles.emblemBox}>
            <Text style={styles.emblemIcon}>🏛️</Text>
          </View>
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.ministryLine1}>GOVERNMENT OF INDIA</Text>
            <Text style={styles.ministryLine2}>Ministry of Urban Development</Text>
          </View>
        </Animated.View>

        {/* Ashoka Chakra (spinning) */}
        <Animated.View style={[styles.chakraWrap, { opacity: ashokFade }]}>
          <Animated.Text style={[styles.chakra, { transform: [{ rotate: chakraSpin }] }]}>
            ☸
          </Animated.Text>
        </Animated.View>

        {/* Brand name */}
        <Animated.View style={{
          opacity: logoFade,
          transform: [{ scale: logoScale }],
          alignItems: 'center',
        }}>
          <Text style={styles.brandEN}>NIVARAN</Text>
          <Text style={styles.brandHI}>निवारण पोर्टल</Text>
        </Animated.View>

        {/* Tricolor divider */}
        <Animated.View style={[styles.tricolorBar, { opacity: logoFade }]}>
          <View style={[styles.triSlice, { backgroundColor: '#FF9933' }]} />
          <View style={[styles.triSlice, { backgroundColor: '#FFFFFF' }]} />
          <View style={[styles.triSlice, { backgroundColor: '#138808' }]} />
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, {
          opacity: taglineFade,
          transform: [{ translateY: taglineSlide }],
        }]}>
          आपकी शिकायतों का त्वरित समाधान
        </Animated.Text>
        <Animated.Text style={[styles.taglineEN, {
          opacity: taglineFade,
          transform: [{ translateY: taglineSlide }],
        }]}>
          Swift Resolution of Your Grievances
        </Animated.Text>

      </View>

      {/* ── Bottom watermark ── */}
      <Animated.Text style={[styles.watermark, { opacity: taglineFade }]}>
        स्वच्छता • पारदर्शिता • जवाबदेही
      </Animated.Text>
    </Animated.View>
  );
}

const STRIPE_H = height * 0.28;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tricolor stripes
  whiteMiddle: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F8F8',
    top: STRIPE_H,
    bottom: STRIPE_H,
  },
  saffronStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: STRIPE_H,
    backgroundColor: '#FF9933',
  },
  greenStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: STRIPE_H,
    backgroundColor: '#138808',
  },

  // Center card
  centerCard: {
    width: width * 0.82,
    backgroundColor: '#1E3A8A',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },

  // Ministry
  ministryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    paddingBottom: 16,
    width: '100%',
  },
  emblemBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemIcon: { fontSize: 22 },
  ministryLine1: { color: '#93C5FD', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  ministryLine2: { color: 'white', fontSize: 11, fontWeight: '700', marginTop: 1 },

  // Chakra
  chakraWrap: { marginBottom: 8 },
  chakra: { fontSize: 52, color: '#3B82F6' },

  // Brand
  brandEN: {
    color: 'white',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 6,
    textShadowColor: 'rgba(59,130,246,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  brandHI: {
    color: '#BFDBFE',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: -4,
    marginBottom: 16,
  },

  // Tricolor bar
  tricolorBar: {
    flexDirection: 'row',
    height: 5,
    width: '70%',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  triSlice: { flex: 1 },

  // Tagline
  tagline: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  taglineEN: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Watermark
  watermark: {
    position: 'absolute',
    bottom: STRIPE_H + 14,
    color: '#1E3A8A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});