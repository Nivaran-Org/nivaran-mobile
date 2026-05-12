import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import { Shield, Phone, Lock, ArrowRight, Zap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, verificationId, user, isLoading } = useAuth();
  const { theme } = useTheme();

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const blob1 = useRef(new Animated.Value(0)).current;
  const blob2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(logoAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();

    // Floating blob animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(blob1, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(blob2, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (user && !isLoading) {
      router.replace('/(tabs)/home');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: '#1E40AF' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const handleSendCode = async () => {
    if (!phoneNumber || !phoneNumber.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await signIn(phoneNumber); // stores email, sets verificationId
      setIsCodeSent(true);
    } catch (error: any) {
      Alert.alert('Error', 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    setLoading(true);
    try {
      await signIn(phoneNumber, verificationCode);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setPhoneNumber('nitin@test.com');
    try {
      await signIn('nitin@test.com');
      await signIn('nitin@test.com', 'test1234');
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const blob1Translate = blob1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });
  const blob2Translate = blob2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.bgGradient} />
      <View style={styles.bgGradient2} />

      {/* Floating blobs */}
      <Animated.View
        style={[
          styles.blob,
          styles.blob1,
          { transform: [{ translateY: blob1Translate }] },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blob2,
          { transform: [{ translateY: blob2Translate }] },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoAnim }],
              opacity: logoAnim,
            },
          ]}
        >
          <View style={styles.logoIcon}>
            <Shield size={36} color="#fff" />
          </View>
          <Text style={styles.title}>NIVARAN</Text>
          <Text style={styles.subtitle}>AI-Powered Civic Complaint Management</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateY: cardAnim }],
              opacity: cardOpacity,
            },
          ]}
        >
          {!isCodeSent ? (
            <>
              <Text style={styles.cardTitle}>Welcome, Citizen</Text>
              <Text style={styles.cardSubtitle}>Enter your email address to continue</Text>

              <View style={styles.inputContainer}>
                <View style={styles.prefixContainer}>
                  <Text style={styles.prefix}>✉️</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Continue</Text>
                    <ArrowRight size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.demoButton}
                onPress={handleDemoLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Zap size={18} color="#2563EB" />
                <Text style={styles.demoButtonText}>Quick Demo Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Enter Password</Text>
              <Text style={styles.cardSubtitle}>
                Enter your password for {phoneNumber}
              </Text>
              <Text style={styles.demoHint}>
                💡 Demo mode: use password <Text style={{ fontWeight: '700' }}>test1234</Text>
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.prefixContainer}>
                  <Lock size={18} color="#64748B" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Login</Text>
                    <ArrowRight size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => {
                  setIsCodeSent(false);
                  setVerificationCode('');
                }}
              >
                <Text style={styles.resendText}>← Change email</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        <Text style={styles.footerText}>
          Empowering citizens for a better tomorrow
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    backgroundColor: '#2563EB',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  bgGradient2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: '#1D4ED8',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  blob: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.15,
  },
  blob1: {
    width: 200,
    height: 200,
    backgroundColor: '#60A5FA',
    top: -50,
    right: -60,
  },
  blob2: {
    width: 150,
    height: 150,
    backgroundColor: '#93C5FD',
    top: height * 0.3,
    left: -40,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 20,
  },
  demoHint: {
    fontSize: 13,
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    textAlign: 'center',
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  prefixContainer: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  prefix: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    backgroundColor: '#F0F7FF',
  },
  demoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    marginTop: 32,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});