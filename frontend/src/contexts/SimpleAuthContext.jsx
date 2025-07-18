import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and auto-login for demo
    const timer = setTimeout(() => {
      setUser({
        uid: 'demo-user',
        email: 'demo@example.com',
        displayName: 'Demo User'
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      uid: 'demo-user',
      email: email,
      displayName: 'Demo User'
    });
    setLoading(false);
  };

  const register = async (userName, email, password) => {
    setLoading(true);
    // Simulate registration delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      uid: 'demo-user',
      email: email,
      displayName: userName
    });
    setLoading(false);
  };

  const logout = async () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};