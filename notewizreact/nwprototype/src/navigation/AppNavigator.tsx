import FoldersScreen from '../screens/FoldersScreen';
import NotesScreen from '../screens/NotesScreen';

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Folders" component={FoldersScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 