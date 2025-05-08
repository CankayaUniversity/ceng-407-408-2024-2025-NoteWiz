// src/components/auth/AnimatedLogo.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { NotesIcon } from '../icons/index.tsx';

export const AnimatedLogo = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    rotation.value = withSequence(
      withTiming(360, { duration: 1000 }),
      withSpring(0)
    );
    
    scale.value = withSequence(
      withSpring(1.2),
      withDelay(100, withSpring(1))
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrapper, animatedStyle]}>
        <View style={styles.logoBackground}>
          <NotesIcon size={40} color="#4C6EF5" />
        </View>
      </Animated.View>
      <View style={styles.shadow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoBackground: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 110, 245, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    position: 'absolute',
    bottom: -10,
    width: 60,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    transform: [{ scaleX: 0.7 }],
    opacity: 0.5,
  },
});