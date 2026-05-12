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
import { Shield, ArrowRight, Eye, EyeOff } from 'lucide-react-native';

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
  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const blob1 = useRef(new Animated.Value(0)).current;
  const blob2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
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
      const success = await signIn(email.trim(), password);
      if (success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch {
      Alert.alert('Error', 'Connection failed. Check your network.');
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
    <View style={styles.container}>
      <View style={styles.bgGradient} />
      <View style={styles.bgGradient2} />

      <Animated.View style={[styles.blob, styles.blob1, { transform: [{ translateY: blob1Translate }] }]} />
      <Animated.View style={[styles.blob, styles.blob2, { transform: [{ translateY: blob2Translate }] }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoAnim }], opacity: logoAnim }]}>
            <View style={styles.logoIcon}>
              <Shield size={36} color="#fff" />
            </View>
            <Text style={styles.title}>NIVARAN</Text>
            <Text style={styles.subtitle}>AI-Powered Civic Complaint Management</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View style={[styles.card, { transform: [{ translateY: cardAnim }], opacity: cardOpacity }]}>

            {/* Mode Toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'login' && styles.toggleBtnActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'register' && styles.toggleBtnActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.toggleText, mode === 'register' && styles.toggleTextActive]}>Register</Text>
              </TouchableOpacity>
            </View>

            {mode === 'login' ? (
              <>
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Text style={styles.cardSubtitle}>Sign in to your citizen account</Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                      {showPassword
                        ? <EyeOff size={20} color="#94A3B8" />
                        : <Eye size={20} color="#94A3B8" />
                      }
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
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
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Create Account</Text>
                <Text style={styles.cardSubtitle}>Register as a citizen to file complaints</Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your full name"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={regEmail}
                    onChangeText={setRegEmail}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Min. 6 characters"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showRegPassword}
                      value={regPassword}
                      onChangeText={setRegPassword}
                    />
                    <TouchableOpacity onPress={() => setShowRegPassword(p => !p)} style={styles.eyeBtn}>
                      {showRegPassword
                        ? <EyeOff size={20} color="#94A3B8" />
                        : <Eye size={20} color="#94A3B8" />
                      }
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonText}>Create Account</Text>
                      <ArrowRight size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          <Text style={styles.footerText}>Empowering citizens for a better tomorrow</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E40AF' },
  bgGradient: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: height * 0.55, backgroundColor: '#2563EB',
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
  },
  bgGradient2: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: height * 0.35, backgroundColor: '#1D4ED8',
    borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
  },
  blob: { position: 'absolute', borderRadius: 100, opacity: 0.15 },
  blob1: { width: 200, height: 200, backgroundColor: '#60A5FA', top: -50, right: -60 },
  blob2: { width: 150, height: 150, backgroundColor: '#93C5FD', top: height * 0.3, left: -40 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', letterSpacing: 3 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8, textAlign: 'center' },
  card: {
    width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF',
    borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 12,
  },
  toggleRow: {
    flexDirection: 'row', backgroundColor: '#F1F5F9',
    borderRadius: 12, padding: 4, marginBottom: 24,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: '#2563EB' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  toggleTextActive: { color: '#fff' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 20, lineHeight: 20 },
  inputWrapper: { marginBottom: 14 },
  label: {
    fontSize: 12, fontWeight: '600', color: '#475569',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#0F172A',
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  button: {
    backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerText: {
    marginTop: 32, fontSize: 13,
    color: 'rgba(255,255,255,0.5)', textAlign: 'center',
  },
});