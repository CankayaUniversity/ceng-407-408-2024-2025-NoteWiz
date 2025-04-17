// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
 id: string;
 email: string;
 fullName: string;
} | null;

type AuthContextType = {
 user: User;
 isLoading: boolean;
 login: (email: string, password: string, rememberMe: boolean, showLoading?: boolean) => Promise<void>;
 signup: (email: string, password: string, fullName: string) => Promise<void>;
 logout: () => Promise<void>;
 resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@auth_credentials';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
 const [user, setUser] = useState<User>(null);
 const [isLoading, setIsLoading] = useState(true);

 // Kayıtlı kimlik bilgilerini kontrol et
 useEffect(() => {
   const loadStoredCredentials = async () => {
     try {
       const storedCredentials = await AsyncStorage.getItem(STORAGE_KEY);
       if (storedCredentials) {
         const { email, password } = JSON.parse(storedCredentials);
         await login(email, password, true, false); // silent login
       }
     } catch (error) {
       console.error('Error loading stored credentials:', error);
     } finally {
       setIsLoading(false);
     }
   };

   loadStoredCredentials();
 }, []);

 // Firebase Auth durumunu dinle
 useEffect(() => {
   const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
     if (firebaseUser) {
       try {
         const userDoc = await firestore()
           .collection('users')
           .doc(firebaseUser.uid)
           .get();

         if (userDoc.exists) {
           const userData = userDoc.data();
           setUser({
             id: firebaseUser.uid,
             email: firebaseUser.email || '',
             fullName: userData?.fullName || '',
           });
         } else {
           const userData = {
             email: firebaseUser.email,
             fullName: firebaseUser.displayName || '',
             createdAt: firestore.FieldValue.serverTimestamp(),
           };
           await firestore()
             .collection('users')
             .doc(firebaseUser.uid)
             .set(userData);
           
           setUser({
             id: firebaseUser.uid,
             email: firebaseUser.email || '',
             fullName: firebaseUser.displayName || '',
           });
         }
       } catch (error) {
         console.error('Error fetching user data:', error);
         setUser(null);
       }
     } else {
       setUser(null);
     }
     setIsLoading(false);
   });

   return () => unsubscribe();
 }, []);

 const login = async (
   email: string, 
   password: string, 
   rememberMe: boolean,
   showLoading: boolean = true
 ) => {
   try {
     if (showLoading) setIsLoading(true);

     const userCredential = await auth().signInWithEmailAndPassword(email, password);
     const userDoc = await firestore()
       .collection('users')
       .doc(userCredential.user.uid)
       .get();

     if (userDoc.exists) {
       const userData = userDoc.data();
       setUser({
         id: userCredential.user.uid,
         email: userCredential.user.email || '',
         fullName: userData?.fullName || '',
       });

       // Eğer "Remember Me" seçiliyse kimlik bilgilerini kaydet
       if (rememberMe) {
         await AsyncStorage.setItem(
           STORAGE_KEY,
           JSON.stringify({ email, password })
         );
       }
     }
   } catch (error: any) {
     console.error('Login error:', error);
     throw error;
   } finally {
     if (showLoading) setIsLoading(false);
   }
 };

 const signup = async (email: string, password: string, fullName: string) => {
   try {
     const userCredential = await auth().createUserWithEmailAndPassword(email, password);
     
     // Firebase Authentication'da displayName'i güncelle
     await userCredential.user.updateProfile({
       displayName: fullName,
     });
     
     // Firestore'a kullanıcı bilgilerini kaydet
     await firestore()
       .collection('users')
       .doc(userCredential.user.uid)
       .set({
         email,
         fullName,
         createdAt: firestore.FieldValue.serverTimestamp(),
       });

     setUser({
       id: userCredential.user.uid,
       email: userCredential.user.email || '',
       fullName,
     });
   } catch (error: any) {
     console.error('Signup error:', error);
     throw error;
   }
 };

 const logout = async () => {
   try {
     await auth().signOut();
     setUser(null);
     // Kayıtlı kimlik bilgilerini temizle
     await AsyncStorage.removeItem(STORAGE_KEY);
   } catch (error: any) {
     console.error('Logout error:', error);
     throw error;
   }
 };

 const resetPassword = async (email: string) => {
   try {
     await auth().sendPasswordResetEmail(email);
   } catch (error: any) {
     console.error('Reset password error:', error);
     throw error;
   }
 };

 return (
   <AuthContext.Provider 
     value={{ 
       user, 
       isLoading,
       login, 
       signup, 
       logout,
       resetPassword,
     }}
   >
     {children}
   </AuthContext.Provider>
 );
};

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (context === undefined) {
   throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};