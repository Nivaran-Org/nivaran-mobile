import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  SafeAreaView, Animated, Dimensions, StatusBar, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SwachhataFullAuth() {
  const router = useRouter();
  
  // States
  const [step, setStep] = useState<'home' | 'phone' | 'otp'>('home');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [step]);

  const handlePhoneSubmit = () => {
    if (phoneNumber.length < 10) {
      setError('Enter a valid 10-digit number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      setError('');
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        router.replace('/(tabs)');
      }, 1000);
    } else {
      setError('Wrong OTP. Please try again.');
      setOtp('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* ─── GOVT HEADER ─── */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://seeklogo.com/images/S/swachh-bharat-mission-logo-7928236314-seeklogo.com.png' }} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.sloganHindi}>एक कदम स्वच्छता की ओर</Text>
      </View>

      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        
        {step === 'home' ? (
          <>
            <Text style={styles.brandTitle}>NIVARAN</Text>
            <Text style={styles.brandSub}>Official Admin Portal</Text>

            {/* 6 BUTTON GRID AS REQUESTED */}
            <View style={styles.gridContainer}>
              <View style={styles.row}>
                <CategoryBox icon="🚻" label="Toilet" color="#22D3EE" onPress={() => setStep('phone')} />
                <CategoryBox icon="🗑️" label="Trash" color="#10B981" onPress={() => setStep('phone')} />
                <CategoryBox icon="📝" label="Complaint" color="#F97316" onPress={() => setStep('phone')} />
              </View>
              <View style={styles.row}>
                <CategoryBox icon="🏗️" label="Dump" color="#F59E0B" onPress={() => setStep('phone')} />
                <CategoryBox icon="💧" label="Sewerage" color="#3B82F6" onPress={() => setStep('phone')} />
                <CategoryBox icon="🚛" label="Collection" color="#4ADE80" onPress={() => setStep('phone')} />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.authCard}>
            <TouchableOpacity onPress={() => setStep('home')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back to Home</Text>
            </TouchableOpacity>
            
            <Text style={styles.authTitle}>{step === 'phone' ? 'Mobile Login' : 'Verify OTP'}</Text>
            <Text style={styles.authSub}>
              {step === 'phone' ? 'Enter registered mobile number' : `Enter code sent to +91 ${phoneNumber}`}
            </Text>

            {step === 'phone' ? (
              <TextInput
                style={styles.input}
                placeholder="9876543210"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(t) => {setPhoneNumber(t); setError('');}}
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Enter OTP (123456)"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={(t) => {setOtp(t); setError('');}}
              />
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={step === 'phone' ? handlePhoneSubmit : handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Continue</Text>}
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

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
    <Text style={[styles.catLabel, { color: color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7F0' },
  header: { alignItems: 'center', marginTop: 30 },
  logo: { width: 150, height: 60 },
  sloganHindi: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  brandTitle: { fontSize: 48, fontWeight: '900', color: '#004A7C' },
  brandSub: { fontSize: 14, color: '#64748B', marginBottom: 30 },

  gridContainer: { width: '100%', gap: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  catBox: { width: '31%', backgroundColor: '#fff', padding: 12, borderRadius: 20, alignItems: 'center', elevation: 3 },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catLabel: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },

  authCard: { width: '100%', backgroundColor: '#fff', borderRadius: 25, padding: 25, elevation: 8 },
  backBtn: { marginBottom: 15 },
  backBtnText: { color: '#004A7C', fontWeight: 'bold' },
  authTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  authSub: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  input: { borderBottomWidth: 2, borderBottomColor: '#004A7C', fontSize: 22, paddingVertical: 10, marginBottom: 10, textAlign: 'center' },
  errorText: { color: '#EF4444', fontSize: 12, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  primaryBtn: { backgroundColor: '#004A7C', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  footer: { alignItems: 'center', paddingBottom: 25 },
  govtHindi: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  govtEnglish: { fontSize: 9, color: '#1E293B' },
});