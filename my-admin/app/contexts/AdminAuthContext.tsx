import React, { createContext, useContext, useState } from 'react';

// This handles the "AdminAuthContext" that your _layout is looking for
const AdminAuthContext = createContext({
  isAdmin: true,
});

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin] = useState(true); // Hardcoded to true for your development

  return (
    <AdminAuthContext.Provider value={{ isAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
export default AdminAuthProvider;