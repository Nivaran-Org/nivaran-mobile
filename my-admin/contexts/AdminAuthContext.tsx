import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.18.7:5000';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  displayName?: string;
  department?: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  signInAdmin: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);

  const signInAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.user.role === 'admin') {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('admin', JSON.stringify(data.user));
        setAdmin({
          ...data.user,
          displayName: data.user.name,
          department: 'Administration',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Admin login failed:', err);
      return false;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('admin');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, signInAdmin, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}