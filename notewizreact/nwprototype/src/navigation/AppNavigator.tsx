import NotesScreen from '../screens/NotesScreen';
import FolderDetailScreen from '../screens/FolderDetailScreen';
import PdfDrawingScreen from '../screens/PdfDrawingScreen';
import PdfListScreen from '../screens/PdfListScreen';
import HomeScreen from '../screens/HomeScreen';
import DocumentUploadScreen from '../screens/DocumentUploadScreen';
import AuthScreen from '../screens/AuthScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import StatsScreen from '../screens/StatsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import CalendarScreen from '../screens/CalendarScreen';
import DrawingScreen from '../screens/DrawingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ShareNoteScreen from '../screens/ShareNoteScreen';
import FriendsListScreen from '../screens/FriendsListScreen';
import FriendSearchScreen from '../screens/FriendSearchScreen';
import FriendRequestsScreen from '../screens/FriendRequestsScreen';
import CollaboratiNotesScreen from '../screens/CollaboratiNotesScreen';
import DiagnosticScreen from '../screens/DiagnosticScreen';
import OCRScreen from '../screens/OCRScreen';
import PdfViewerScreen from '../screens/PdfViewerScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AuthScreen" component={AuthScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="PdfListScreen" component={PdfListScreen} options={{ title: "PDF'lerim" }} />
      <Stack.Screen name="PdfDrawingScreen" component={PdfDrawingScreen} options={{ title: 'PDF Çizim' }} />
      <Stack.Screen name="FolderDetail" component={FolderDetailScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} options={{ title: 'Doküman Yükle' }} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="NoteDetailScreen" component={NoteDetailScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="TasksScreen" component={TasksScreen} />
      <Stack.Screen name="TaskDetailScreen" component={TaskDetailScreen} />
      <Stack.Screen name="StatsScreen" component={StatsScreen} />
      <Stack.Screen name="AIChatScreen" component={AIChatScreen} />
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
      <Stack.Screen name="DrawingScreen" component={DrawingScreen} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      <Stack.Screen name="ShareNoteScreen" component={ShareNoteScreen} />
      <Stack.Screen name="FriendsListScreen" component={FriendsListScreen} />
      <Stack.Screen name="FriendSearchScreen" component={FriendSearchScreen} />
      <Stack.Screen name="FriendRequestsScreen" component={FriendRequestsScreen} />
      <Stack.Screen name="CollaboratiNotesScreen" component={CollaboratiNotesScreen} />
      <Stack.Screen name="DiagnosticScreen" component={DiagnosticScreen} />
      <Stack.Screen name="OCRScreen" component={OCRScreen} />
      <Stack.Screen name="PdfViewerScreen" component={PdfViewerScreen} options={{ title: 'PDF Görüntüle' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 