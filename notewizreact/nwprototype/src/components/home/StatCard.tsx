// src/components/home/StatCard.tsx
import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useWindowDimensions } from 'react-native';

interface StatCardProps {
  icon: ReactNode;
  number: number;
  label: string;
  delay?: number;
  isLast?: boolean;
  width?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, number, label, delay = 0, isLast = false, width }) => {
  return (
    <Animated.View 
      entering={FadeInRight.delay(delay)}
      style={[styles.statCard, !isLast && { marginRight: 20 }, width ? { width } : {}]}
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
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginRight: 20,
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 110, 245, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  number: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: '#666666',
  },
});