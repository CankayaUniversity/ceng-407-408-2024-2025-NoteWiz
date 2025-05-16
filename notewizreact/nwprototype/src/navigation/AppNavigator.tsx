import FoldersScreen from '../screens/FoldersScreen';

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Folders" component={FoldersScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 