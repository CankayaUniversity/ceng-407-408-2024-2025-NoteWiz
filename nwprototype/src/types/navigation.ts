// src/types/navigation.ts
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  TabNavigator: undefined;
  NoteDetail: {
    noteId?: number;
    title?: string;
    content?: string;
    category?: string;
    isImportant?: boolean;
    color?: string;
    folderId?: string | null;
  };
  DocumentUpload: undefined;
  DocumentView: {
    documentId: string;
    title: string;
  };
  TaskDetail: {
    taskId?: number;
    presetDueDate?: string;
  };
  Drawing: {
    noteId: number;
  };
  SharedNotes: undefined;
  ShareNote: {
    noteId: number;
  };
  Settings: undefined;
  Diagnostic: undefined;
  Auth: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

// NoteDetailScreen için özel tipler
export type NoteDetailScreenProps = RootStackScreenProps<'NoteDetail'>;

// DocumentUploadScreen için özel tipler
export type DocumentUploadScreenProps = RootStackScreenProps<'DocumentUpload'>;

// DocumentViewScreen için özel tipler
export type DocumentViewScreenProps = RootStackScreenProps<'DocumentView'>;

// ShareNoteScreen için özel tipler
export type ShareNoteScreenProps = RootStackScreenProps<'ShareNote'>;

export type MainTabParamList = {
  Home: undefined;
  Notes: undefined;
  Tasks: undefined;
  Calendar: undefined;
  Stats: undefined;
  Settings: undefined;
};