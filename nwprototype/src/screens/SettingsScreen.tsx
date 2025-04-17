// src/screens/SettingsScreen.tsx
import React, { FC } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import {
  SettingsIcon,
  StarIcon,
  CloudIcon,
  TimeIcon,
  IconProps,
} from '../components/icons';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItemProps {
  icon: FC<IconProps>;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingsScreen: FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [isDarkMode, setIsDarkMode] = React.useState(theme === 'dark');

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              Alert.alert('Error', 'An error occurred while signing out.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    toggleTheme();
  };

  const MenuItem: FC<MenuItemProps> = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemLeft}>
          <View style={styles.iconContainer}>
            <Icon size={24} color="#4C6EF5" />
          </View>
          <View style={styles.menuItemTextContainer}>
            <Text style={styles.menuItemTitle}>{title}</Text>
            {subtitle && (
              <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
        {rightElement && (
          <View style={styles.menuItemRight}>
            {rightElement}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#1a1a1a' : '#FFFFFF'}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.emailText}>{user?.email}</Text>
          <Text style={styles.nameText}>{user?.fullName || 'NoteWiz User'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          
          <MenuItem
            icon={SettingsIcon}
            title="Profile Settings"
            subtitle="Edit your personal information"
            onPress={() => {}}
            rightElement={null}
          />

          <MenuItem
            icon={StarIcon}
            title="Upgrade to Premium"
            subtitle="Access more features"
            onPress={() => {}}
            rightElement={null}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>
          
          <MenuItem
            icon={TimeIcon}
            title="Auto Backup"
            subtitle="Automatically backup your notes"
            onPress={() => {}}
            rightElement={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#767577', true: '#4c6ef5' }}
                thumbColor={true ? '#ffffff' : '#f4f3f4'}
              />
            }
          />

          <MenuItem
            icon={CloudIcon}
            title="Dark Mode"
            subtitle="Change app appearance"
            onPress={() => {}}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: '#767577', true: '#4c6ef5' }}
                thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
              />
            }
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>NoteWiz v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4C6EF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 24,
    letterSpacing: 0.5,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  menuItemRight: {
    marginLeft: 12,
  },
  logoutButton: {
    margin: 16,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default SettingsScreen;