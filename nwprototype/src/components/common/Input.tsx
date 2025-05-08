import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, typography } from '../../constants/theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: object;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled,
          multiline && styles.inputMultiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.disabled}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.main,
    borderRadius: 8,
    padding: 10,
    fontSize: typography.sizes.md,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.paper,
  },
  inputError: {
    borderColor: COLORS.error.main,
  },
  inputDisabled: {
    backgroundColor: COLORS.background.paper,
    opacity: 0.5,
  },
  inputMultiline: {
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.error.main,
    fontSize: typography.sizes.xs,
    marginTop: 4,
  },
});

export default Input; 