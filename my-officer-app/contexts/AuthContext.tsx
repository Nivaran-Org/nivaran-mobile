// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Officer {
  id: string;
  badgeId: string;
  email: string;
  displayName: string;
  department: string;
  zone: string;
  role: 'officer' | 'admin';
}

interface AuthContextType {
  user: Officer | null;
  signInUser: (emailOrBadge: string, password: string) => boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Demo officer accounts ──────────────────────────────────────────────────────
const DEMO_OFFICERS: (Officer & { password: string; email: string; badgeId: string })[] = [
  {
    id: 'u1',
    badgeId: 'OFF-001',
    email: 'officer@nivaran.gov.in',
    password: '1234',
    displayName: 'Inspector Harpreet Kaur',
    department: 'Public Works',
    zone: 'Zone A – Central',
    role: 'officer',
  },
  {
    id: 'u2',
    badgeId: 'OFF-002',
    email: 'admin@nivaran.gov.in',
    password: '1234',
    displayName: 'Superintendent Gurjeet Singh',
    department: 'Administration',
    zone: 'All Zones',
    role: 'admin',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Officer | null>(null);

  /**
   * Accepts either:
   *  - email + password  (my-officer-app index.tsx login form)
   *  - badgeId + password  (original app/index.tsx biometric flow)
   */
  const signInUser = (emailOrBadge: string, password: string): boolean => {
    const found = DEMO_OFFICERS.find(
      (o) =>
        (o.email.toLowerCase() === emailOrBadge.toLowerCase() ||
          o.badgeId.toLowerCase() === emailOrBadge.toLowerCase()) &&
        o.password === password,
    );
    if (found) {
      const { password: _pw, ...officer } = found;
      setUser(officer);
      return true;
    }
    return false;
  };

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signInUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}