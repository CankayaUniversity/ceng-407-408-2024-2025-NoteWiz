import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform } from 'react-native';
import { COLORS, SHADOWS } from './src/constants/theme';
import notifee from '@notifee/react-native';
import { NoteProvider } from './src/contexts/NoteContext';
import ApiDiagnostic from './src/components/debug/ApiDiagnostic';
import { DocumentProvider } from './src/contexts/DocumentContext';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import NotesScreen from './src/screens/NotesScreen';
import StatsScreen from './src/screens/StatsScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DrawingScreen from './src/screens/DrawingScreen';
import TasksScreen from './src/screens/TasksScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import DocumentUploadScreen from './src/screens/DocumentUploadScreen';

// Types
import { RootStackParamList, MainTabParamList } from './src/types/navigation';

// Icons
import {
  HomeIcon,
  NotesIcon,
  SettingsIcon,
  StarIcon,
  TaskIcon,
  CalendarIcon,
} from './src/components/icons';

// Contexts
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { CategoriesProvider } from './src/contexts/CategoriesContext';
import { TasksProvider } from './src/contexts/TasksContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
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
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ayarlar' }} />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkNotificationPermission = async () => {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus) {
        console.log('Bildirim izinleri alındı');
      } else {
        console.log('Bildirim izinleri reddedildi');
      }
    };

    checkNotificationPermission();
    setIsLoading(false);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <CategoriesProvider>
              <NoteProvider>
                <TasksProvider>
                  <DocumentProvider>
                    <NavigationContainer>
                      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                        <Stack.Screen name="Auth" component={AuthScreen} />
                        <Stack.Screen name="MainApp" component={TabNavigator} />
                        <Stack.Screen
                          name="NoteDetail"
                          component={NoteDetailScreen}
                          options={{
                            headerShown: true,
                            presentation: 'modal',
                            animation: 'slide_from_bottom',
                            headerTitle: '',
                            headerShadowVisible: false,
                            headerStyle: {
                              backgroundColor: COLORS.background.default,
                            },
                            headerTintColor: COLORS.primary.main,
                          }}
                        />
                        <Stack.Screen
                          name="DocumentUpload"
                          component={DocumentUploadScreen}
                          options={{
                            headerShown: true,
                            presentation: 'modal',
                            animation: 'slide_from_bottom',
                            headerTitle: 'Dosya Yükle',
                            headerShadowVisible: false,
                            headerStyle: {
                              backgroundColor: COLORS.background.default,
                            },
                            headerTintColor: COLORS.primary.main,
                          }}
                        />
                        <Stack.Screen
                          name="Drawing"
                          component={DrawingScreen}
                          options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
                        />
                        <Stack.Screen
                          name="TaskDetail"
                          component={TaskDetailScreen}
                          options={{
                            headerShown: true,
                            presentation: 'modal',
                            animation: 'slide_from_bottom',
                            headerTitle: '',
                            headerShadowVisible: false,
                            headerStyle: {
                              backgroundColor: COLORS.background.default,
                            },
                            headerTintColor: COLORS.primary.main,
                          }}
                        />
                        <Stack.Screen
                          name="Calendar"
                          component={CalendarScreen}
                          options={{
                            headerShown: true,
                            headerTitle: 'Takvim',
                            headerStyle: {
                              backgroundColor: COLORS.background.default,
                            },
                            headerTintColor: COLORS.primary.main,
                          }}
                        />
                        <Stack.Screen
                          name="Diagnostic"
                          component={ApiDiagnostic}
                          options={{
                            headerShown: true,
                            headerTitle: 'API Tanılama',
                            headerStyle: {
                              backgroundColor: COLORS.background.default,
                            },
                            headerTintColor: COLORS.primary.main,
                          }}
                        />
                      </Stack.Navigator>
                    </NavigationContainer>
                  </DocumentProvider>
                </TasksProvider>
              </NoteProvider>
            </CategoriesProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
