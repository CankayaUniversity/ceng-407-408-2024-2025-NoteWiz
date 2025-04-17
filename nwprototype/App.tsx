// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform } from 'react-native';
import { COLORS, SHADOWS } from './src/constants/theme';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import NotesScreen from './src/screens/NotesScreen';
import StatsScreen from './src/screens/StatsScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DrawingScreen from './src/screens/DrawingScreen';

// Types
import { RootStackParamList, MainTabParamList } from './src/types/navigation';

// Icons
import {
 HomeIcon,
 NotesIcon,
 SettingsIcon,
 StarIcon,
} from './src/components/icons';

// Contexts
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { CategoriesProvider } from './src/contexts/CategoriesContext';
import { NotesProvider } from './src/contexts/NotesContext';

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
           case 'Stats':
             return <StarIcon size={24} color={color} />;
           case 'Settings':
             return <SettingsIcon size={24} color={color} />;
           default:
             return null;
         }
       },
       tabBarActiveTintColor: COLORS.primary.main,
       tabBarInactiveTintColor: COLORS.neutral[400],
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
     <Tab.Screen 
       name="Home" 
       component={HomeScreen}
       options={{
         title: 'Home',
       }}
     />
     <Tab.Screen 
       name="Notes" 
       component={NotesScreen}
       options={{
         title: 'Notes',
       }}
     />
     <Tab.Screen 
       name="Stats" 
       component={StatsScreen}
       options={{
         title: 'Stats',
       }}
     />
     <Tab.Screen 
       name="Settings" 
       component={SettingsScreen}
       options={{
         title: 'Settings',
       }}
     />
   </Tab.Navigator>
 );
};

const App = () => {
 return (
   <SafeAreaProvider>
     <StatusBar
       translucent
       backgroundColor="transparent"
       barStyle="light-content"
     />
     <ThemeProvider>
       <AuthProvider>
         <CategoriesProvider>
           <NotesProvider>
             <NavigationContainer>
               <Stack.Navigator
                 screenOptions={{
                   headerShown: false,
                   animation: 'slide_from_right',
                 }}
               >
                 <Stack.Screen 
                   name="Welcome" 
                   component={WelcomeScreen}
                 />
                 <Stack.Screen 
                   name="Auth" 
                   component={AuthScreen}
                 />
                 <Stack.Screen 
                   name="MainApp" 
                   component={TabNavigator}
                 />
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
                   name="Drawing" 
                   component={DrawingScreen}
                   options={{ 
                     presentation: 'fullScreenModal',
                     animation: 'fade_from_bottom',
                   }}
                 />
               </Stack.Navigator>
             </NavigationContainer>
           </NotesProvider>
         </CategoriesProvider>
       </AuthProvider>
     </ThemeProvider>
   </SafeAreaProvider>
 );
};

export default App;