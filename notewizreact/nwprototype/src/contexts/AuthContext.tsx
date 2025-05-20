// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/newApi';
import { User } from '../types/user';
<<<<<<< HEAD
=======
import { offlineStorage } from '../services/offlineStorage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import EventEmitter from '../utils/EventEmitter';
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

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
<<<<<<< HEAD
=======
  const isConnected = useNetworkStatus();

  // 401 sonrası otomatik logout
  useEffect(() => {
    const handleUnauthorized = async () => {
      await logout();
    };
    EventEmitter.on('unauthorized', handleUnauthorized);
    return () => {
      EventEmitter.off('unauthorized', handleUnauthorized);
    };
  }, []);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

  // Check auth status when app starts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
<<<<<<< HEAD
      if (token) {
        await getUserInfo();
        setIsAuthenticated(true);
      } else {
=======
      console.log('[Auth] checkAuthStatus: token', token);
      if (token) {
        // Token varsa önce offline user'ı kontrol et
        const offlineUser = await offlineStorage.getUserData();
        console.log('[Auth] checkAuthStatus: offlineUser', offlineUser);
        
        if (offlineUser) {
          setUser(offlineUser);
          setIsAuthenticated(true);
          console.log('[Auth] isAuthenticated set to TRUE (offline user)');
          console.log('[Auth] checkAuthStatus: Set authenticated from offline user');
        }

        // Online ise user bilgilerini güncelle
        if (isConnected) {
          console.log('[Auth] checkAuthStatus: Connected, getting user info');
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
              console.log('[Auth] isAuthenticated set to TRUE (online user)');
              console.log('[Auth] checkAuthStatus: Set authenticated from online user');
            }
          } catch (error: any) {
            console.error('[Auth] Error getting user info:', error);
            // 401 hatası alındıysa ve offline user varsa, yeni login yap
            if (error.response?.status === 401 && offlineUser) {
              try {
                // Offline user bilgileriyle yeni login dene
                const response = await authService.login(offlineUser.email, '');
                if (response && response.token) {
                  await AsyncStorage.setItem('userToken', response.token);
                  console.log('[Auth] New login successful');
                  // Yeni token ile tekrar user bilgilerini al
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
                    console.log('[Auth] isAuthenticated set to TRUE (after new login)');
                    console.log('[Auth] Set authenticated after new login');
                  }
                }
              } catch (loginError) {
                console.error('[Auth] New login failed:', loginError);
                // Login başarısız olursa ve offline user varsa authenticated kal
                if (!offlineUser) {
                  await AsyncStorage.removeItem('userToken');
                  setUser(null);
                  setIsAuthenticated(false);
                  console.log('[Auth] isAuthenticated set to FALSE (login failure)');
                  console.log('[Auth] Set not authenticated due to login failure and no offline user');
                }
              }
            } else if (!offlineUser) {
              await AsyncStorage.removeItem('userToken');
              setUser(null);
              setIsAuthenticated(false);
              console.log('[Auth] isAuthenticated set to FALSE (error and no offline user)');
              console.log('[Auth] Set not authenticated due to error and no offline user');
            }
          }
        }
      } else {
        console.log('[Auth] isAuthenticated set to FALSE (no token)');
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
<<<<<<< HEAD
      console.error('Auth status check error:', error);
=======
      console.error('[Auth] isAuthenticated set to FALSE (auth status check error)');
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
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
<<<<<<< HEAD
      
=======
      console.log('[Auth] getUserInfo: userData', userData);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
      if (userData) {
        const user: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          isAdmin: userData.isAdmin || false,
          createdAt: userData.createdAt || new Date().toISOString()
        };
<<<<<<< HEAD
        
        setUser(user);
        setIsAuthenticated(true);
=======
        setUser(user);
        setIsAuthenticated(true);
        console.log('[Auth] getUserInfo: Set authenticated');
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
      } else {
        throw new Error('Could not retrieve user information');
      }
    } catch (error) {
<<<<<<< HEAD
      console.error('Error getting user info:', error);
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      setIsAuthenticated(false);
=======
      console.error('[Auth] Error getting user info:', error);
      // getUserInfo'da hata olsa bile, eğer offline user varsa authenticated kal
      const offlineUser = await offlineStorage.getUserData();
      if (!offlineUser) {
        await AsyncStorage.removeItem('userToken');
        setUser(null);
        setIsAuthenticated(false);
        console.log('[Auth] getUserInfo: Set not authenticated due to error and no offline user');
      }
      throw error;
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    }
  };

  // Login process
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    try {
<<<<<<< HEAD
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
=======
      if (isConnected) {
        const response = await authService.login(email, password);
        console.log('[Auth] login: response', response);
        if (response && response.token) {
          await AsyncStorage.setItem('userToken', response.token);
          console.log('[Auth] login: token saved', response.token);
          if (rememberMe) {
            await AsyncStorage.setItem('email', email);
          } else {
            await AsyncStorage.removeItem('email');
          }
          // Kullanıcı bilgilerini offline storage'a kaydet
          await offlineStorage.saveUserData(response.user);
          await getUserInfo();
          setIsAuthenticated(true);
          return true;
        }
      } else {
        // Offline modda giriş
        const offlineUser = await offlineStorage.getUserData();
        console.log('[Auth] login: offlineUser', offlineUser);
        if (offlineUser && offlineUser.email === email) {
          setUser(offlineUser);
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('[Auth] Login error:', error);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
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
<<<<<<< HEAD
    } catch (error) {
      console.error('Logout error:', error);
=======
      console.log('[Auth] logout: token removed, user logged out');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
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
