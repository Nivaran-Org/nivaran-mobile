import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.18.7:5000';

type User = {
  uid: string;
  phoneNumber: string;
  displayName: string;
  email: string;
  id: number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (emailOrPhone: string, password?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  verificationId: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (token && userData) {
        const parsed = JSON.parse(userData);
        setUser({
          uid: String(parsed.id),
          phoneNumber: '',
          displayName: parsed.name,
          email: parsed.email,
          id: parsed.id,
        });
      }
    } catch (e) {
      console.error('Session check error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // signIn handles both step1 (send OTP = just set verificationId)
  // and step2 (verify = real login with email+password)
  const signIn = async (emailOrPhone: string, password?: string) => {
    if (!password) {
      // Step 1: simulate OTP send — just store email and set verificationId
      await AsyncStorage.setItem('pending_email', emailOrPhone);
      setVerificationId('pending');
      return;
    }

    // Step 2: real login
    const email = await AsyncStorage.getItem('pending_email') || emailOrPhone;
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success) {
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser({
        uid: String(data.user.id),
        phoneNumber: emailOrPhone,
        displayName: data.user.name,
        email: data.user.email,
        id: data.user.id,
      });
      setVerificationId(null);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Registration failed');
  };

  const signOutUser = async () => {
    await AsyncStorage.multiRemove(['token', 'user', 'pending_email']);
    setUser(null);
    setVerificationId(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOutUser, verificationId, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);