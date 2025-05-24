// src/screens/AuthScreen.tsx - .NET API Güncellemesi
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/AntDesign';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { AuthInput } from '../components/auth/AuthInput';
import { AnimatedLogo } from '../components/auth/AnimatedLogo';
import DocumentUploadScreen from '../screens/DocumentUploadScreen';

const { width, height } = Dimensions.get('window');

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, isOffline } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Animasyon değerleri
  const formPosition = useSharedValue(0);
  const logoScale = useSharedValue(1);

  useEffect(() => {
    formPosition.value = withSpring(1);
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 400 }),
      withDelay(200, withTiming(1, { duration: 300 }))
    );
  }, []);

  const formStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(formPosition.value * -20),
      },
    ],
    opacity: formPosition.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const handleAuth = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isLogin) {
        console.log('🔑 Login attempt:', { email, isOffline });
        const success = await login(email, password, rememberMe);
        if (success) {
          console.log('✅ Login successful, navigating to MainApp');
          navigation.replace('MainApp');
        } else if (isOffline) {
          console.log('❌ Offline login failed');
          Alert.alert('Offline Login', 'Offline giriş başarısız. Lütfen doğru e-posta ve şifreyi girin veya internete bağlanın.');
        }
      } else {
        console.log('📝 Signup attempt:', { email, fullName });
        const success = await signup(email, password, fullName);
        if (success) {
          console.log('✅ Signup successful');
          Alert.alert(
            'Başarılı',
            'Hesabınız başarıyla oluşturuldu!',
            [{ text: 'Tamam', onPress: () => navigation.replace('MainApp') }]
          );
        }
      }
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data) {
        errorMessage = error.response.data;
      }

      Alert.alert(
        'Hata',
        errorMessage,
        [{ text: 'Tamam', style: 'cancel' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    // E-posta kontrolü
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
      return false;
    }

    // Şifre kontrolü
    if (!password) {
      Alert.alert('Hata', 'Lütfen şifrenizi girin.');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return false;
    }

    // Kayıt için isim kontrolü
    if (!isLogin && !fullName.trim()) {
      Alert.alert('Hata', 'Lütfen adınızı ve soyadınızı girin.');
      return false;
    }

    return true;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4C6EF5" />
      
      <LinearGradient
        colors={['#4C6EF5', '#3b5bdb', '#364fc7']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100%',
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centeredContainer}>
          <View style={styles.logoContainer}>
            <AnimatedLogo />
            <Text style={styles.appName}>NoteWiz</Text>
            <Text style={styles.tagline}>Your thoughts, beautifully organized</Text>
          </View>
          {isOffline && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>Çevrimdışısınız. Sadece önceden giriş yapmış kullanıcılar giriş yapabilir.</Text>
            </View>
          )}
          <Animated.View 
            entering={FadeInUp.duration(1000).springify()} 
            style={[styles.formContainer, formStyle]}
          >
            {!isLogin && (
              <AuthInput
                icon="user"
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            )}
            <AuthInput
              icon="mail"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AuthInput
              icon="lock"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {isLogin && (
              <View style={styles.rememberContainer}>
                <TouchableOpacity
                  style={styles.rememberButton}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked
                  ]} />
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword" as never)}>
                  <Text style={{ color: '#4C6EF5', textAlign: 'right', marginTop: 12 }}>Şifremi Unuttum?</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[styles.authButton, isLoading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// NOT: Style değişiklikleri yok, mevcut stil kullanılabilir
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4C6EF5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4C6EF5',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#4C6EF5',
  },
  rememberText: {
    fontSize: 14,
    color: '#666666',
  },
  forgotText: {
    fontSize: 14,
    color: '#4C6EF5',
    fontWeight: '600',
  },
  authButton: {
    backgroundColor: '#4C6EF5',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#4C6EF5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    color: '#666666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  switchButton: {
    alignItems: 'center',
  },
  switchText: {
    color: '#4C6EF5',
    fontSize: 14,
    fontWeight: '600',
  },
  offlineBanner: {
    backgroundColor: '#ffb300',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    width: '100%',
  },
});

export default AuthScreen;