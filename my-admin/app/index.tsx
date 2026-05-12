import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  SafeAreaView, Animated, Dimensions, StatusBar, 
  TextInput, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://192.168.18.7:5000';

export default function AdminAuth() {
  const router = useRouter();
  
  const [step, setStep] = useState<'home' | 'login'>('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animateFade = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { 
      toValue: 1, 
      duration: 800, 
      useNativeDriver: true 
    }).start();
  };

  const goToLogin = () => {
    setStep('login');
    animateFade();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.user.role === 'admin') {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        router.replace('/(tabs)');
      } else if (data.success && data.user.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Cannot connect to server. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://seeklogo.com/images/S/swachh-bharat-mission-logo-7928236314-seeklogo.com.png' }} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.sloganHindi}>एक कदम स्वच्छता की ओर</Text>
      </View>

      <Animated.View style={[styles.mainContent, { opacity: step === 'login' ? fadeAnim : 1 }]}>
        
        {step === 'home' ? (
          <>
            <Text style={styles.brandTitle}>NIVARAN</Text>
            <Text style={styles.brandSub}>Official Admin Portal</Text>

            <View style={styles.gridContainer}>
              <View style={styles.row}>
                <CategoryBox icon="🚻" label="Toilet"     color="#22D3EE" onPress={goToLogin} />
                <CategoryBox icon="🗑️" label="Trash"      color="#10B981" onPress={goToLogin} />
                <CategoryBox icon="📝" label="Complaint"  color="#F97316" onPress={goToLogin} />
              </View>
              <View style={styles.row}>
                <CategoryBox icon="🏗️" label="Dump"       color="#F59E0B" onPress={goToLogin} />
                <CategoryBox icon="💧" label="Sewerage"   color="#3B82F6" onPress={goToLogin} />
                <CategoryBox icon="🚛" label="Collection" color="#4ADE80" onPress={goToLogin} />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.authCard}>
            <TouchableOpacity 
              onPress={() => { setStep('home'); setError(''); }} 
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>← Back to Home</Text>
            </TouchableOpacity>
            
            <Text style={styles.authTitle}>Admin Login</Text>
            <Text style={styles.authSub}>Enter your admin credentials</Text>

            <TextInput
              style={styles.input}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading 
                ? <ActivityIndicator color="#fff" /> 
                : <Text style={styles.primaryBtnText}>Login</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.govtHindi}>आवासन और शहरी कार्य मंत्रालय</Text>
        <Text style={styles.govtEnglish}>MINISTRY OF HOUSING AND URBAN AFFAIRS</Text>
      </View>
    </SafeAreaView>
  );
}

const CategoryBox = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.catBox} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
    </View>
    <Text style={[styles.catLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F0F7F0' },
  header:         { alignItems: 'center', marginTop: 30 },
  logo:           { width: 150, height: 60 },
  sloganHindi:    { fontSize: 11, fontWeight: '700', color: '#64748B' },

  mainContent:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  brandTitle:     { fontSize: 48, fontWeight: '900', color: '#004A7C' },
  brandSub:       { fontSize: 14, color: '#64748B', marginBottom: 30 },

  gridContainer:  { width: '100%', gap: 15 },
  row:            { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  catBox:         { width: '31%', backgroundColor: '#fff', padding: 12, borderRadius: 20, alignItems: 'center', elevation: 3 },
  iconCircle:     { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catLabel:       { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },

  authCard:       { width: '100%', backgroundColor: '#fff', borderRadius: 25, padding: 25, elevation: 8 },
  backBtn:        { marginBottom: 15 },
  backBtnText:    { color: '#004A7C', fontWeight: 'bold' },
  authTitle:      { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  authSub:        { fontSize: 13, color: '#64748B', marginBottom: 20 },
  input:          { borderBottomWidth: 2, borderBottomColor: '#004A7C', fontSize: 16, paddingVertical: 10, marginBottom: 20 },
  errorText:      { color: '#EF4444', fontSize: 12, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  primaryBtn:     { backgroundColor: '#004A7C', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  footer:         { alignItems: 'center', paddingBottom: 25 },
  govtHindi:      { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  govtEnglish:    { fontSize: 9, color: '#1E293B' },
});