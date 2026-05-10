import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoStorage } from '../services/DemoStorage';

type DemoUser = {
  uid: string;
  phoneNumber: string;
  displayName: string;
};

type AuthContextType = {
  user: DemoUser | null;
  isLoading: boolean;
  signIn: (phoneNumber: string, verificationCode?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  verificationId: string | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      await DemoStorage.seedIfNeeded();
      const loggedIn = await DemoStorage.isLoggedIn();
      if (loggedIn) {
        const profile = await DemoStorage.getProfile();
        setUser({
          uid: 'demo-user-001',
          phoneNumber: profile.phone,
          displayName: profile.name,
        });
      }
    } catch (e) {
      console.error('Session check error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (phoneNumber: string, verificationCode?: string) => {
    if (verificationCode && verificationId) {
      // Step 2: Verify OTP — any 6-digit code works in demo mode
      if (verificationCode.length === 6) {
        const profile = await DemoStorage.getProfile();
        await DemoStorage.setLoggedIn(true);
        setUser({
          uid: 'demo-user-001',
          phoneNumber: `+91${phoneNumber}`,
          displayName: profile.name,
        });
        setVerificationId(null);
      } else {
        throw new Error('Invalid OTP');
      }
    } else {
      // Step 1: Send OTP — simulate sending
      await new Promise(resolve => setTimeout(resolve, 1200)); // simulate network delay
      setVerificationId('demo-verification-id');
    }
  };

  const signOutUser = async () => {
    await DemoStorage.setLoggedIn(false);
    setUser(null);
    setVerificationId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOutUser,
        verificationId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);