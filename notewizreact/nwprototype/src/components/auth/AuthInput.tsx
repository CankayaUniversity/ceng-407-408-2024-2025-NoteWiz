// src/components/auth/AuthInput.tsx
import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface AuthInputProps extends TextInputProps {
  icon: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ icon, ...props }) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={20} color="#666" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
});