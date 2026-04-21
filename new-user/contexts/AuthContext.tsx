import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import {
  User,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  ApplicationVerifier,
} from 'firebase/auth';

type AuthContextType = {
  user: User | null;
  signIn: (phoneNumber: string, verificationCode?: string, appVerifier?: ApplicationVerifier) => Promise<void>;
  signOutUser: () => Promise<void>;
  verificationId: string | null;
  setVerificationId: (id: string | null) => void;
};

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null as User | null);
  const [verificationId, setVerificationId] = useState(null as string | null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const signIn = async (
    phoneNumber: string,
    verificationCode?: string,
    appVerifier?: ApplicationVerifier
  ) => {
    if (verificationCode && verificationId) {
      // Verify the OTP code
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await signInWithCredential(auth, credential);
    } else {
      // Request OTP — appVerifier (reCAPTCHA) is required
      if (!appVerifier) {
        throw new Error('reCAPTCHA verifier is required to send OTP');
      }
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setVerificationId(confirmation.verificationId);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOutUser,
        verificationId,
        setVerificationId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);