// src/components/ui/FABMenu.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { 
  CreateIcon, 
  CloseIcon,
  DocumentIcon,
  PdfIcon,
  FolderIcon,
  ImageIcon 
} from '../icons';
import { COLORS, SHADOWS, SPACING } from '../../constants/theme';

interface FABMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onCreateNote: () => void;
  onCreatePdf: () => void;
  onCreateFolder: () => void;
  onImportFile: () => void;
}

const { width } = Dimensions.get('window');

const FABMenu: React.FC<FABMenuProps> = ({
  isOpen,
  onToggle,
  onCreateNote,
  onCreatePdf,
  onCreateFolder,
  onImportFile
}) => {
  // Animation values
  const scaleAnimation = React.useRef(new Animated.Value(0)).current;
  const opacityAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, scaleAnimation, opacityAnimation]);

  // Menu item animation styles
  const getItemAnimationStyle = (index: number) => {
    return {
      opacity: opacityAnimation,
      transform: [
        { scale: scaleAnimation },
        {
          translateY: opacityAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    };
  };

  return (
    <>
      {/* Main FAB Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          isOpen && styles.fabActive
        ]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        {isOpen ? (
          <CloseIcon size={24} color="#FFFFFF" />
        ) : (
          <CreateIcon size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* Background Overlay when menu is open */}
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onToggle}
        />
      )}

      {/* Menu Items */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            opacity: opacityAnimation,
            transform: [{ translateY: isOpen ? 0 : 20 }],
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <Animated.View style={[styles.menuItemContainer, getItemAnimationStyle(0)]}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={onCreateNote}
            disabled={!isOpen}
          >
            <View style={[styles.fabMenuIcon, { backgroundColor: '#4C6EF5' }]}>
              <DocumentIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.fabMenuText}>New Note</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.menuItemContainer, getItemAnimationStyle(1)]}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={onCreatePdf}
            disabled={!isOpen}
          >
            <View style={[styles.fabMenuIcon, { backgroundColor: '#FA5252' }]}>
              <PdfIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.fabMenuText}>New PDF</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.menuItemContainer, getItemAnimationStyle(2)]}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={onCreateFolder}
            disabled={!isOpen}
          >
            <View style={[styles.fabMenuIcon, { backgroundColor: '#40C057' }]}>
              <FolderIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.fabMenuText}>New Folder</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.menuItemContainer, getItemAnimationStyle(3)]}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={onImportFile}
            disabled={!isOpen}
          >
            <View style={[styles.fabMenuIcon, { backgroundColor: '#FD7E14' }]}>
              <ImageIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.fabMenuText}>Import File</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    zIndex: 1000,
  },
  fabActive: {
    backgroundColor: COLORS.primary.dark,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  menuContainer: {
    position: 'absolute',
    bottom: SPACING.xl + 70,
    right: SPACING.xl,
    zIndex: 1000,
  },
  menuItemContainer: {
    marginBottom: 12,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.paper,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...SHADOWS.md,
  },
  fabMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fabMenuText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
});

export default FABMenu;