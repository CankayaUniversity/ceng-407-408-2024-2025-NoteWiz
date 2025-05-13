// src/components/notes/FolderNavigation.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { FolderIcon } from '../icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface Folder {
  id: string;
  title: string;
  parentFolderId: string | null;
}

interface FolderNavigationProps {
  folders: Folder[];
  currentFolderId: string | null;
  onFolderPress: (folderId: string | null) => void;
}

const FolderNavigation: React.FC<FolderNavigationProps> = ({
  folders,
  currentFolderId,
  onFolderPress
}) => {
  // Build breadcrumb path
  const getBreadcrumbPath = () => {
    const breadcrumbs: Folder[] = [];
    
    // If we're in the root directory, return empty path
    if (!currentFolderId) {
      return breadcrumbs;
    }
    
    // Find current folder
    let currentFolder = folders.find(f => f.id === currentFolderId);
    
    // If folder not found, return empty path
    if (!currentFolder) {
      return breadcrumbs;
    }
    
    // Add current folder to breadcrumbs
    breadcrumbs.unshift(currentFolder);
    
    // Traverse up the folder hierarchy
    while (currentFolder?.parentFolderId) {
      const parentFolder = folders.find(f => f.id === currentFolder?.parentFolderId);
      if (parentFolder) {
        breadcrumbs.unshift(parentFolder);
        currentFolder = parentFolder;
      } else {
        break;
      }
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbPath();
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Root folder (Home) */}
        <TouchableOpacity
          style={[
            styles.breadcrumbItem,
            !currentFolderId && styles.activeBreadcrumb
          ]}
          onPress={() => onFolderPress(null)}
        >
          <FolderIcon 
            size={16} 
            color={!currentFolderId ? COLORS.primary.main : COLORS.text.secondary} 
          />
          <Text style={[
            styles.breadcrumbText,
            !currentFolderId && styles.activeBreadcrumbText
          ]}>
            Home
          </Text>
        </TouchableOpacity>
        
        {/* Folder path */}
        {breadcrumbs.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <Text style={styles.separator}>/</Text>
            <TouchableOpacity
              style={[
                styles.breadcrumbItem,
                index === breadcrumbs.length - 1 && styles.activeBreadcrumb
              ]}
              onPress={() => onFolderPress(folder.id)}
            >
              <Text style={[
                styles.breadcrumbText,
                index === breadcrumbs.length - 1 && styles.activeBreadcrumbText
              ]}>
                {folder.title}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeBreadcrumb: {
    backgroundColor: COLORS.primary.light + '20',
  },
  breadcrumbText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  activeBreadcrumbText: {
    color: COLORS.primary.main,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  separator: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginHorizontal: 4,
  },
});

export default FolderNavigation;