import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, SHADOWS } from '../constants/theme';
import HomeScreen from '../screens/HomeScreen';
import NotesScreen from '../screens/NotesScreen';
import TasksScreen from '../screens/TasksScreen';
import CalendarScreen from '../screens/CalendarScreen';
import StatsScreen from '../screens/StatsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { HomeIcon, NotesIcon, SettingsIcon, StarIcon, TaskIcon, CalendarIcon } from '../components/icons';
import { MainTabParamList } from '../types/navigation';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'Home':
              return <HomeIcon size={24} color={color} />;
            case 'Notes':
              return <NotesIcon size={24} color={color} />;
            case 'Tasks':
              return <TaskIcon size={24} color={color} />;
            case 'Calendar':
              return <CalendarIcon size={24} color={color} />;
            case 'Stats':
              return <StarIcon size={24} color={color} />;
            case 'Settings':
              return <SettingsIcon size={24} color={color} />;
            case 'AIChat':
              return <HomeIcon size={24} color={color} />;
            case 'Folders':
              return <MaterialIcons name="folder" size={24} color={color} />;
            default:
              return <HomeIcon size={24} color={color} />;
          }
        },
        tabBarActiveTintColor: COLORS.primary.main,
        tabBarInactiveTintColor: COLORS.text.secondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background.paper,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          height: 64,
          borderRadius: 32,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
          paddingTop: 12,
          ...SHADOWS.lg
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="Notes" component={NotesScreen} options={{ title: 'Notlar' }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Görevler' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Takvim' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'İstatistik' }} />
      <Tab.Screen name="AIChat" component={AIChatScreen} options={{ title: 'AI Sohbet' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ayarlar' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator; 