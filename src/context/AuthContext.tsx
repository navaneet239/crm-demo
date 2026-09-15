import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout, switchRole as authSwitchRole } from '../services/authService';
import { Role, User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  changeRole: (role: Role) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Failed to load user', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const user = await authLogin(email, pass);
      setCurrentUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authLogout();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const changeRole = async (role: Role) => {
    setIsLoading(true);
    try {
      const updated = await authSwitchRole(role);
      setCurrentUser(updated);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        logout,
        changeRole,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
