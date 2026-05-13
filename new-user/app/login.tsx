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
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user, isLoading } = useAuth();

  // Animations
  const logoAnim    = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const blob1       = useRef(new Animated.Value(0)).current;
  const blob2       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(cardAnim,    { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();

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

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please enter both email and password');
    return;
  }
  setLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json();

    if (data.success) {
      const userData = { ...data.user, displayName: data.user.name };
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Call signIn to update AuthContext state properly
      await signIn(email.trim(), password);

      // Small delay to let React state propagate
      await new Promise(resolve => setTimeout(resolve, 100));

      if (data.user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else if (data.user.role === 'officer') {
        router.replace('/(officer)');
      } else {
        router.replace('/(tabs)/home');
      }
    } else {
      Alert.alert('Login Failed', data.message || 'Invalid credentials.');
    }
  } catch (e) {
    console.error('Login error:', e);
    Alert.alert('Error', 'Connection failed.');
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async () => {
    if (!name || !regEmail || !regPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (regPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(name.trim(), regEmail.trim(), regPassword);
      if (result.success) {
        Alert.alert('Success', 'Account created! Please log in.', [
          { text: 'OK', onPress: () => setMode('login') },
        ]);
        setRegEmail('');
        setRegPassword('');
        setConfirmPassword('');
        setName('');
      } else {
        Alert.alert('Registration Failed', result.message);
      }
    } catch {
      Alert.alert('Error', 'Connection failed. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  const blob1Translate = blob1.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });
  const blob2Translate = blob2.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });

  return (
    <View style={s.container}>
      {/* Background layers */}
      <View style={s.bgTop} />
      <View style={s.bgMid} />

      {/* Decorative blobs */}
      <Animated.View style={[s.blob, s.blob1, { transform: [{ translateY: blob1Translate }] }]} />
      <Animated.View style={[s.blob, s.blob2, { transform: [{ translateY: blob2Translate }] }]} />

      {/* Ashoka chakra watermark */}
      <Text style={s.chakraWatermark}>☸</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.keyboardView}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View style={[s.logoContainer, { transform: [{ scale: logoAnim }], opacity: logoAnim }]}>
            <View style={s.chakraCircle}>
              <Text style={s.chakraEmoji}>☸</Text>
            </View>
            <Text style={s.title}>NIVARAN</Text>
            <Text style={s.taglineHindi}>सुनाइए • सुलझाइए • संतुष्टिए</Text>
            <Text style={s.subtitle}>AI-Powered Civic Grievance Redressal</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View style={[s.card, { transform: [{ translateY: cardAnim }], opacity: cardOpacity }]}>

            {/* Mode Toggle */}
            <View style={s.toggleRow}>
              <TouchableOpacity
                style={[s.toggleBtn, mode === 'login' && s.toggleBtnActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[s.toggleText, mode === 'login' && s.toggleTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.toggleBtn, mode === 'register' && s.toggleBtnActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[s.toggleText, mode === 'register' && s.toggleTextActive]}>Register</Text>
              </TouchableOpacity>
            </View>

            {mode === 'login' ? (
              <>
                <Text style={s.cardTitle}>Welcome Back</Text>
                <Text style={s.title}>Login</Text>

                <View style={s.inputWrapper}>
                  <Text style={s.label}>Email Address</Text>
                  <TextInput
                    style={s.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={s.inputWrapper}>
                  <Text style={s.label}>Password</Text>
                  <View style={s.passwordRow}>
                    <TextInput
                      style={[s.input, { flex: 1 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={s.eyeBtn}>
                      {showPassword
                        ? <EyeOff size={20} color="#9ca3af" />
                        : <Eye size={20} color="#9ca3af" />
                      }
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[s.button, loading && s.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={s.buttonContent}>
                      <Text style={s.buttonText}>Login to NIVARAN</Text>
                      <ArrowRight size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={s.cardTitle}>Create Account</Text>
                <Text style={s.cardSubtitle}>Register as a citizen to file complaints</Text>

                <View style={s.inputWrapper}>
                  <Text style={s.label}>Full Name</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Your full name"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={s.inputWrapper}>
                  <Text style={s.label}>Email Address</Text>
                  <TextInput
                    style={s.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={regEmail}
                    onChangeText={setRegEmail}
                  />
                </View>

                <View style={s.inputWrapper}>
                  <Text style={s.label}>Password</Text>
                  <View style={s.passwordRow}>
                    <TextInput
                      style={[s.input, { flex: 1 }]}
                      placeholder="Min. 6 characters"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showRegPassword}
                      value={regPassword}
                      onChangeText={setRegPassword}
                    />
                    <TouchableOpacity onPress={() => setShowRegPassword(p => !p)} style={s.eyeBtn}>
                      {showRegPassword
                        ? <EyeOff size={20} color="#9ca3af" />
                        : <Eye size={20} color="#9ca3af" />
                      }
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={s.inputWrapper}>
                  <Text style={s.label}>Confirm Password</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Re-enter password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                <TouchableOpacity
                  style={[s.button, loading && s.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={s.buttonContent}>
                      <Text style={s.buttonText}>Create Account</Text>
                      <ArrowRight size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Govt disclaimer */}
            <Text style={s.disclaimer}>
              Official Government Portal · Secure & Confidential
            </Text>
          </Animated.View>

          <Text style={s.footerText}>
            ☸  Ministry of Housing and Urban Affairs{'\n'}
            Government of India
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#14532d' },

  // Background
  bgTop:            { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.55, backgroundColor: '#15803d', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  bgMid:            { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.35, backgroundColor: '#166534', borderBottomLeftRadius: 60, borderBottomRightRadius: 60 },

  // Blobs
  blob:             { position: 'absolute', borderRadius: 100, opacity: 0.12 },
  blob1:            { width: 220, height: 220, backgroundColor: '#4ade80', top: -60, right: -70 },
  blob2:            { width: 160, height: 160, backgroundColor: '#86efac', top: height * 0.28, left: -50 },

  // Watermark
  chakraWatermark:  { position: 'absolute', top: height * 0.05, left: 20, fontSize: 120, color: 'rgba(255,255,255,0.04)', zIndex: 0 },

  keyboardView:     { flex: 1 },
  scrollContent:    { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40 },

  // Logo
  logoContainer:    { alignItems: 'center', marginBottom: 28 },
  chakraCircle:     { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  chakraEmoji:      { fontSize: 38, color: '#fbbf24' },
  title:            { fontSize: 38, fontWeight: '900', color: '#ffffff', letterSpacing: 4, marginBottom: 4 },
  taglineHindi:     { fontSize: 12, color: '#bbf7d0', fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  subtitle:         { fontSize: 13, color: 'rgba(255,255,255,0.65)', textAlign: 'center' },

  // Card
  card:             { width: '100%', maxWidth: 400, backgroundColor: '#ffffff', borderRadius: 24, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12 },

  // Toggle
  toggleRow:        { flexDirection: 'row', backgroundColor: '#f0fdf4', borderRadius: 12, padding: 4, marginBottom: 24 },
  toggleBtn:        { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive:  { backgroundColor: '#16a34a' },
  toggleText:       { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  toggleTextActive: { color: '#fff' },

  cardTitle:        { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  cardSubtitle:     { fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 20 },

  inputWrapper:     { marginBottom: 14 },
  label:            { fontSize: 11, fontWeight: '800', color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  input:            { backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#111827' },
  passwordRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:           { padding: 10 },

  button:           { backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  buttonDisabled:   { opacity: 0.7 },
  buttonContent:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText:       { color: '#fff', fontSize: 16, fontWeight: '800' },

  disclaimer:       { textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 20, fontWeight: '600' },

  footerText:       { marginTop: 28, fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 20 },
});