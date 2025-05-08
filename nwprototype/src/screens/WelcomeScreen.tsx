// src/screens/WelcomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { NotesIcon } from '../components/icons/index.tsx';
import { BlurView } from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGetStarted = () => {
    navigation.navigate('Auth');
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#4C6EF5', '#364FC7', '#2B3B99']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Dekoratif arka plan şekilleri */}
      <Animated.View 
        entering={FadeInDown.duration(1000)}
        style={styles.decorativeShape1} 
      />
      <Animated.View 
        entering={FadeInDown.delay(200).duration(1000)}
        style={styles.decorativeShape2} 
      />

      {/* Logo ve başlık bölümü */}
      <Animated.View 
        entering={FadeInUp.delay(500).springify()}
        style={styles.contentContainer}
      >
        <View style={styles.logoContainer}>
          <NotesIcon size={80} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>NoteWiz</Text>
        <Text style={styles.subtitle}>
          Your creative space for{'\n'}capturing thoughts and ideas
        </Text>

        {/* Başlama butonu */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={20}
          />
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        {/* Alternatif giriş butonu */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('TabNavigator')}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeShape1: {
    position: 'absolute',
    top: -height * 0.2,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ rotate: '45deg' }],
  },
  decorativeShape2: {
    position: 'absolute',
    bottom: -height * 0.1,
    left: -width * 0.3,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default WelcomeScreen;