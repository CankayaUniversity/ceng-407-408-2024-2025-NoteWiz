// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { authService } from '../services/api';
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
        // Set token to axios headers before making API calls
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user info if token exists
        await getUserInfo();
        setIsAuthenticated(true);
      } else {
        // No token found, set authenticated to false
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      // Clean up on error
      await AsyncStorage.removeItem('userToken');
      axios.defaults.headers.common['Authorization'] = '';
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user information
  const getUserInfo = async () => {
    try {
      // Get user data from auth service
      const userData = await authService.getCurrentUser();
      
      if (userData) {
        // Create user object from response
        const user: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          isAdmin: userData.isAdmin,
          createdAt: userData.createdAt
        };
        
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Could not retrieve user information');
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      // Clean up on error
      await AsyncStorage.removeItem('userToken');
      axios.defaults.headers.common['Authorization'] = '';
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Login process
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log("Login data:", { email, password });
      // Use auth service to login
      const response = await authService.login(email, password);
      
      if (response && response.token) {
        // Set authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        
        // Save token to AsyncStorage
        await AsyncStorage.setItem('userToken', response.token);
        
        // Save email if rememberMe is true
        if (rememberMe) {
          await AsyncStorage.setItem('email', email);
        } else {
          await AsyncStorage.removeItem('email');
        }

        // Get user info
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
      // Use auth service to register
      const userData = {
        email,
        password,
        fullName,
        username: email.split('@')[0], // Simple username creation
        color: "#FFFFFF" // Default color
      };
      
      if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(userData.color)) {
        userData.color = "#FFFFFF";
      }
      
      const response = await authService.register(userData);
      
      if (response) {
        // Registration successful, now login
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
      // Use auth service to logout
      await authService.logout();
      
      // Remove token from AsyncStorage
      await AsyncStorage.removeItem('userToken');
      
      // Remove authorization header
      axios.defaults.headers.common['Authorization'] = '';
      
      // Clear user data
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clean state even if there's an error
      await AsyncStorage.removeItem('userToken');
      axios.defaults.headers.common['Authorization'] = '';
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide context values
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

// Kullanımı kolaylaştırmak için hook
export const useAuth = () => useContext(AuthContext);
