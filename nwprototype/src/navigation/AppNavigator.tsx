import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Screens
import HomeScreen from '../screens/HomeScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import DrawingScreen from '../screens/DrawingScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import DocumentUploadScreen from '../screens/DocumentUploadScreen';
import DocumentViewScreen from '../screens/DocumentViewScreen';
import ShareNoteScreen from '../screens/ShareNoteScreen';
import SharedNotesScreen from '../screens/SharedNotesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'NoteWiz' }}
        />
        <Stack.Screen
          name="NoteDetail"
          component={NoteDetailScreen}
          options={{ title: 'Not Detayı' }}
        />
        <Stack.Screen
          name="Drawing"
          component={DrawingScreen}
          options={{ title: 'Çizim' }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{ title: 'Görev Detayı' }}
        />
        <Stack.Screen
          name="DocumentUpload"
          component={DocumentUploadScreen}
          options={{ title: 'Doküman Yükle' }}
        />
        <Stack.Screen
          name="DocumentView"
          component={DocumentViewScreen}
          options={{ title: 'Doküman Görüntüle' }}
        />
        <Stack.Screen
          name="ShareNote"
          component={ShareNoteScreen}
          options={{ title: 'Not Paylaş' }}
        />
        <Stack.Screen
          name="SharedNotes"
          component={SharedNotesScreen}
          options={{ title: 'Paylaşılan Notlar' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 