<<<<<<< HEAD
import NotesScreen from '../screens/NotesScreen';
import FolderDetailScreen from '../screens/FolderDetailScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
=======
import FoldersScreen from '../screens/FoldersScreen';
import NotesScreen from '../screens/NotesScreen';
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

const AppNavigator = () => {
  return (
    <Stack.Navigator>
<<<<<<< HEAD
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="FolderDetail" component={FolderDetailScreen} />
=======
      <Stack.Screen name="Folders" component={FoldersScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    </Stack.Navigator>
  );
};

export default AppNavigator; 