import NotesScreen from '../screens/NotesScreen';
import FolderDetailScreen from '../screens/FolderDetailScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="FolderDetail" component={FolderDetailScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 