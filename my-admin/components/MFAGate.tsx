import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

export default function MFAGate({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return Alert.alert("MFA Error", "Biometric hardware not found or not enrolled.");
    }

    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to Access National Portal',
      });

      if (result.success) {
        onAuthenticate();
      } else {
        Alert.alert("Denied", "Identity verification failed.");
      }
    } catch (e) {
      Alert.alert("Error", "Biometric authentication failed.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="shield-checkmark" size={60} color="#1E3A8A" />
        <Text style={styles.title}>Admin Verification</Text>
        <Text style={styles.subText}>Please scan your fingerprint to proceed to the Intelligence Hub.</Text>
        <TouchableOpacity style={styles.btn} onPress={handleBiometricAuth}>
          {isAuthenticating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Authorize Access</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E3A8A', justifyContent: 'center', padding: 25 },
  card: { backgroundColor: '#fff', borderRadius: 25, padding: 30, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#1E3A8A', marginTop: 15 },
  subText: { textAlign: 'center', color: '#64748B', marginVertical: 20, lineHeight: 20 },
  btn: { backgroundColor: '#1E3A8A', padding: 18, borderRadius: 15, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800' }
});