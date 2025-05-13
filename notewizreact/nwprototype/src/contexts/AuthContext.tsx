// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/newApi';
import { User } from '../types/user';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  getUserInfo: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check auth status when app starts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        await getUserInfo();
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user information
  const getUserInfo = async () => {
    try {
      const userData = await authService.getCurrentUser();
      
      if (userData) {
        const user: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          isAdmin: userData.isAdmin || false,
          createdAt: userData.createdAt || new Date().toISOString()
        };
        
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Could not retrieve user information');
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Login process
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      
      if (response && response.token) {
        await AsyncStorage.setItem('userToken', response.token);
        
        if (rememberMe) {
          await AsyncStorage.setItem('email', email);
        } else {
          await AsyncStorage.removeItem('email');
        }

        await getUserInfo();
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register process
  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userData = {
        email,
        password,
        fullName,
        username: email.split('@')[0]
      };
      
      const response = await authService.register(userData);
      
      if (response) {
        return await login(email, password);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout process
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    getUserInfo
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
