import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function OTPScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { verifyOTP, phoneNumber } = useAdminAuth();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid', 'Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (verifyOTP(otp)) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Invalid Code', 'The code you entered is incorrect. Try again.');
        shake();
        setOtp('');
      }
      setLoading(false);
    }, 1000);
  };

  const handleResendOTP = () => {
    Alert.alert('Success', 'OTP resent to your phone number');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="#1E3A8A" />
          </TouchableOpacity>
          <View style={styles.headerIcon}>
            <Ionicons name="checkmark-circle" size={60} color="#10B981" />
          </View>
          <Text style={styles.appName}>Verify Code</Text>
        </View>

        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: opacityAnim,
              transform: [
                { translateY: slideAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.description}>
            We sent a code to {phoneNumber ? `+91${phoneNumber}` : 'your phone'}
          </Text>

          <View style={styles.codeContainer}>
            <TextInput
              style={styles.codeInput}
              placeholder="000000"
              placeholderTextColor="#D1D5DB"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              editable={!loading}
              textAlign="center"
            />
            <View style={styles.codeDisplay}>
              {Array.from({ length: 6 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeBox,
                    otp[index] && styles.codeBoxFilled,
                  ]}
                >
                  <Text style={styles.codeDigit}>{otp[index] || ''}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.buttonText}>Verifying...</Text>
            ) : (
              <>
                <Text style={styles.buttonText}>Verify Code</Text>
                <Ionicons name="checkmark" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="bulb" size={18} color="#F59E0B" />
            <Text style={styles.infoText}>Test code: 123456</Text>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginBottom: 10,
  },
  headerIcon: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E3A8A',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      },
      default: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 30,
  },
  codeContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  codeInput: {
    position: 'absolute',
    width: '100%',
    height: 60,
    opacity: 0,
    fontSize: 20,
    fontWeight: '700',
  },
  codeDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  codeBox: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  codeBoxFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
      },
      default: {
        elevation: 5,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
});
