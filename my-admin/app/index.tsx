import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  SafeAreaView, Animated, Dimensions, StatusBar, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const { width } = Dimensions.get('window');

export default function AdminLoginScreen() {
  const router = useRouter();
  const { signInAdmin, admin } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (admin) {
      router.replace('/(tabs)');
    }
  }, [admin]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const success = await signInAdmin(email.trim(), password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Invalid credentials or insufficient privileges.');
      }
    } catch (err) {
      setError('Connection failed. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Govt Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://seeklogo.com/images/S/swachh-bharat-mission-logo-7928236314-seeklogo.com.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.sloganHindi}>एक कदम स्वच्छता की ओर</Text>
      </View>

      <Animated.View style={[styles.mainContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.brandTitle}>NIVARAN</Text>
        <Text style={styles.brandSub}>Official Admin Portal</Text>

        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Admin Login</Text>
          <Text style={styles.authSub}>Sign in with your registered credentials</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@nivaran.gov.in"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
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
                onChangeText={(t) => { setPassword(t); setError(''); }}
              />
              <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Authorize Access</Text>
            }
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Govt Footer */}
      <View style={styles.footer}>
        <Text style={styles.govtHindi}>आवासन और शहरी कार्य मंत्रालय</Text>
        <Text style={styles.govtEnglish}>MINISTRY OF HOUSING AND URBAN AFFAIRS</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7F0' },
  header: { alignItems: 'center', marginTop: 30 },
  logo: { width: 150, height: 60 },
  sloganHindi: { fontSize: 11, fontWeight: '700', color: '#64748B', marginTop: 4 },

  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  brandTitle: { fontSize: 48, fontWeight: '900', color: '#004A7C' },
  brandSub: { fontSize: 14, color: '#64748B', marginBottom: 30 },

  authCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  authTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  authSub: { fontSize: 13, color: '#64748B', marginBottom: 24 },

  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 18 },

  errorText: { color: '#EF4444', fontSize: 12, textAlign: 'center', marginBottom: 12, fontWeight: '600' },

  primaryBtn: {
    backgroundColor: '#004A7C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  footer: { alignItems: 'center', paddingBottom: 25 },
  govtHindi: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  govtEnglish: { fontSize: 9, color: '#1E293B' },
});