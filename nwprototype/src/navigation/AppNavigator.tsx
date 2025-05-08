import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import NotesScreen from '../screens/NotesScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import DocumentUploadScreen from '../screens/DocumentUploadScreen';
import DocumentViewScreen from '../screens/DocumentViewScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen 
        name="DocumentUpload" 
        component={DocumentUploadScreen}
        options={{
          title: 'Doküman Yükle',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="DocumentView" 
        component={DocumentViewScreen}
        options={({ route }) => ({
          title: route.params.title,
        })}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 