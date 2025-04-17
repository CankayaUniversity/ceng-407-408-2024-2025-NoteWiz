import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { useCategories } from '../../contexts/CategoriesContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'All' && styles.categoryButtonActive,
          ]}
          onPress={() => onSelectCategory('All')}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === 'All' && styles.categoryTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                isActive && styles.categoryButtonActive,
                category.color ? { backgroundColor: `${category.color}20` } : null,
              ]}
              onPress={() => onSelectCategory(category.id)}
            >
              <View style={styles.categoryContent}>
                {category.color && (
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: category.color },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  loadingContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background.paper,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  categoryTextActive: {
    color: COLORS.text.inverted,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
});
