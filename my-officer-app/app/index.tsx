import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // <--- Critical: ../ goes from app -> root
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { signInUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const success = signInUser(email, password);
    if (success) {
      router.replace('/(tabs)/home');
    } else {
      Alert.alert('Login Failed', 'Invalid credentials. Use officer@nivaran.gov.in / 1234');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={60} color="#FFD700" />
        <Text style={styles.title}>NIVARAN OFFICER</Text>
      </View>

      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Email or Badge ID" 
          placeholderTextColor="#607D8B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          placeholderTextColor="#607D8B"
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Authorize Access</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A2342', justifyContent: 'center', padding: 30 },
  header: { alignItems: 'center', marginBottom: 50 },
  title: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 10, letterSpacing: 2 },
  form: { gap: 15 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', padding: 15, borderRadius: 12, color: 'white' },
  button: { backgroundColor: '#FFD700', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#0A2342', fontWeight: '800', fontSize: 16 }
});