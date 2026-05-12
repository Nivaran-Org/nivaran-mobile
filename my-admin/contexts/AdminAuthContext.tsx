import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isLoggedIn: boolean;
  phoneNumber: string;
  isVerified: boolean;
  setPhoneNumber: (phone: string) => void;
  verifyOTP: (code: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const verifyOTP = (code: string): boolean => {
    // Mock OTP verification - code should be "123456"
    if (code === '123456') {
      setIsLoggedIn(true);
      setIsVerified(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsVerified(false);
    setPhoneNumber('');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isLoggedIn,
        phoneNumber,
        isVerified,
        setPhoneNumber,
        verifyOTP,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
