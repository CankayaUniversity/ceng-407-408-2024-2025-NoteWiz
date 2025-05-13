// src/components/home/StatCard.tsx
import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface StatCardProps {
  icon: ReactNode;
  number: number;
  label: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, number, label, delay = 0 }) => {
  return (
    <Animated.View 
      entering={FadeInRight.delay(delay)}
      style={styles.statCard}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(76, 110, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  number: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666666',
  },
});