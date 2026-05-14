import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : 'http://172.23.96.36:5000';
  
type User = {
  id: number;
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'officer' | 'admin';
  displayName: string;
  phoneNumber: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOutUser: () => Promise<void>;
  BASE_URL: string;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser  = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        setToken(storedToken);
        setUser({
          ...parsed,
          uid: String(parsed.id),
          displayName: parsed.name,
          phoneNumber: '',
        });
      }
    } catch (e) {
      console.error('Session check error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('Attempting login to:', `${BASE_URL}/api/auth/login`);
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', JSON.stringify(data));

    if (data.success) {
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser({
        ...data.user,
        uid: String(data.user.id),
        displayName: data.user.name,
        phoneNumber: '',
      });
      return true;
    }
    return false;
  } catch (e) {
    console.error('Login error:', e);
    return false;
  }
};

  const signUp = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message || '' };
    } catch (e) {
      return { success: false, message: 'Connection failed. Check your network.' };
    }
  };

  const signOutUser = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOutUser, BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);