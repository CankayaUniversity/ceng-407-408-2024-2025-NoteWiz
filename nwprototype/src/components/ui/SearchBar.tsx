import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { SearchIcon } from '../icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color={COLORS.text.secondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.tertiary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  icon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    padding: 0,
  },
});
