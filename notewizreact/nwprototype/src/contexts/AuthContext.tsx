// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/newApi';
import { User } from '../types/user';
import NetInfo from '@react-native-community/netinfo';
import CryptoJS from 'crypto-js';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOffline: boolean;
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
  isOffline: false,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  getUserInfo: async () => {},
});

// Şifre hash'leme fonksiyonu
const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Check auth status when app starts
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    checkAuthStatus();
    return () => unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Checking auth status...');
      const token = await AsyncStorage.getItem('userToken');
      const cachedUser = await AsyncStorage.getItem('cachedUser');
      
      console.log('📦 Auth status check:', {
        hasToken: !!token,
        hasCachedUser: !!cachedUser,
        isOffline: isOffline
      });

      if (token && !isOffline) {
        console.log('🟢 Online with token, fetching user info...');
        await getUserInfo();
        setIsAuthenticated(true);
      } else if (cachedUser && isOffline) {
        console.log('🔴 Offline with cached user, restoring session...');
        const userObj = JSON.parse(cachedUser);
        console.log('👤 Restoring cached user:', userObj.email);
        setUser(userObj);
        setIsAuthenticated(true);
      } else {
        console.log('❌ No valid session found');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth status check error:', error);
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
      if (isOffline) {
        console.log('🔴 Attempting offline login...');
        // Offline login: check cached credentials
        const cachedUser = await AsyncStorage.getItem('cachedUser');
        const cachedPasswordHash = await AsyncStorage.getItem('cachedPasswordHash');
        
        console.log('📦 Cached user data:', cachedUser ? 'Found' : 'Not found');
        console.log('🔑 Cached password hash:', cachedPasswordHash);
        
        if (cachedUser && cachedPasswordHash) {
          const userObj = JSON.parse(cachedUser);
          console.log('👤 Attempting to match with cached user:', userObj.email);
          
          const inputPasswordHash = hashPassword(password);
          const isPasswordMatch = inputPasswordHash === cachedPasswordHash;
          
          console.log('🔐 Password hash comparison:', {
            emailMatch: userObj.email === email,
            passwordHashMatch: isPasswordMatch,
            inputHash: inputPasswordHash,
            cachedHash: cachedPasswordHash
          });
          
          if (userObj.email === email && isPasswordMatch) {
            console.log('✅ Offline login successful!');
            setUser(userObj);
            setIsAuthenticated(true);
            return true;
          } else {
            console.log('❌ Credentials mismatch:', {
              emailMatch: userObj.email === email,
              passwordMatch: isPasswordMatch,
              inputHash: inputPasswordHash,
              cachedHash: cachedPasswordHash
            });
          }
        }
        throw new Error('Offline login failed: No cached credentials or mismatch.');
      } else {
        console.log('🟢 Attempting online login...');
        // Online login
        const response = await authService.login(email, password);
        if (response && response.token) {
          console.log('✅ Online login successful, caching credentials...');
          await AsyncStorage.setItem('userToken', response.token);
          
          if (rememberMe) {
            await AsyncStorage.setItem('email', email);
            console.log('📧 Email cached for remember me');
          } else {
            await AsyncStorage.removeItem('email');
          }
          
          // Get user info and wait for it to complete
          console.log('👤 Fetching user info...');
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
            
            console.log('💾 Caching user data for offline use:', {
              id: user.id,
              email: user.email,
              username: user.username
            });
            
            // Cache user data and password hash
            await AsyncStorage.setItem('cachedUser', JSON.stringify(user));
            const passwordHash = hashPassword(password);
            await AsyncStorage.setItem('cachedPasswordHash', passwordHash);
            console.log('✅ Offline credentials cached successfully:', {
              passwordHash: passwordHash
            });
            
            setUser(user);
            setIsAuthenticated(true);
            return true;
          } else {
            console.log('❌ Failed to get user info after login');
            throw new Error('Could not retrieve user information');
          }
        } else {
          console.log('❌ Online login failed: No token received');
          throw new Error('Login failed');
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
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
      await AsyncStorage.removeItem('cachedUser');
      await AsyncStorage.removeItem('cachedPasswordHash');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('cachedUser');
      await AsyncStorage.removeItem('cachedPasswordHash');
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
    isOffline,
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
