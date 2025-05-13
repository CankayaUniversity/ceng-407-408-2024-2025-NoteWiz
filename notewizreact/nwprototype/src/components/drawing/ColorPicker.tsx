// src/components/drawing/ColorPicker.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

// Renk paleti - başlıca renkler ve tonları
const COLOR_GROUPS = {
  'Basics': ['#000000', '#FFFFFF', '#808080', '#C0C0C0'],
  'Primary': ['#4C6EF5', '#228BE6', '#15AABF', '#12B886'],
  'Warm': ['#FF3B30', '#FF9500', '#FFCC00', '#FF6B6B'],
  'Cool': ['#5856D6', '#007AFF', '#64D2FF', '#5F3DC4'],
  'Nature': ['#40C057', '#82C91E', '#FAB005', '#FD7E14'],
  'Vibrant': ['#BE4BDB', '#E64980', '#F783AC', '#845EF7']
};

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onSelectColor,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = (color: string) => {
    scale.value = withSpring(0.95);
    onSelectColor(color);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const renderColorGroup = (groupName: string, colors: string[]) => {
    return (
      <Animated.View
        key={groupName}
        entering={FadeInRight.delay(200)}
        style={styles.groupContainer}
      >
        <Text style={styles.groupTitle}>{groupName}</Text>
        <View style={styles.colorGrid}>
          {colors.map((color, index) => (
            <TouchableOpacity
              key={color}
              onPressIn={() => handlePressIn(color)}
              onPressOut={handlePressOut}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                color === '#FFFFFF' && styles.whiteColorButton,
                color === selectedColor && styles.selectedColorButton,
              ]}
              activeOpacity={0.7}
            >
              {color === selectedColor && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Colors</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.entries(COLOR_GROUPS).map(([groupName, colors]) =>
          renderColorGroup(groupName, colors)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  whiteColorButton: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedColorButton: {
    borderWidth: 3,
    borderColor: '#4C6EF5',
    transform: [{ scale: 1.1 }],
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default ColorPicker;