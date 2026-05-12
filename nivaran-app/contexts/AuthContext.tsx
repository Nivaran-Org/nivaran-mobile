import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import {
  User,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  ApplicationVerifier,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export type UserRole = 'user' | 'officer' | 'admin';

type AuthContextType = {
  user: User | null;
  userRole: UserRole | null;
  isRoleLoading: boolean;
  signIn: (phoneNumber: string, verificationCode?: string, appVerifier?: ApplicationVerifier) => Promise<void>;
  signOutUser: () => Promise<void>;
  verificationId: string | null;
  setVerificationId: (id: string | null) => void;
};

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null as User | null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [verificationId, setVerificationId] = useState(null as string | null);

  // Fetch user role from Firestore
  const fetchUserRole = async (firebaseUser: User): Promise<UserRole> => {
    try {
      // Try to find user document by UID
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role === 'admin' || data.role === 'officer' || data.role === 'user') {
          return data.role as UserRole;
        }
      }

      // Fallback: check by phone number
      if (firebaseUser.phoneNumber) {
        const phoneDoc = await getDoc(doc(db, 'users_by_phone', firebaseUser.phoneNumber));
        if (phoneDoc.exists()) {
          const data = phoneDoc.data();
          if (data.role === 'admin' || data.role === 'officer' || data.role === 'user') {
            return data.role as UserRole;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }

    // Default to 'user' (citizen) role
    return 'user';
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsRoleLoading(true);
        const role = await fetchUserRole(firebaseUser);
        setUserRole(role);
        setIsRoleLoading(false);
      } else {
        setUserRole(null);
        setIsRoleLoading(false);
      }
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
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isRoleLoading,
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
