import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check local storage on initial load
    const storedAuth = localStorage.getItem('schoolhub_admin');
    if (storedAuth === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const login = (pinCode) => {
    // Hardcoded PIN for now as per plan
    if (pinCode === '2026') {
      setIsAdmin(true);
      localStorage.setItem('schoolhub_admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('schoolhub_admin');
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};
