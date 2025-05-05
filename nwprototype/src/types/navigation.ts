// src/types/navigation.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Auth: undefined;
  MainApp: undefined;
  NoteDetail: {
    noteId?: string | number;
    title?: string;
    content?: string;
    category?: string;
    isImportant?: boolean;
    color?: string;
    tags?: string[];
    folderId?: string | null;
  };
  Drawing: undefined;
  TaskDetail: {
    taskId?: string;
  };
  Calendar: undefined;
  SharedNotes: undefined;
  DocumentUpload: undefined;
  DocumentView: {
    documentId: number;
    title: string;
  };
  ShareNote: {
    noteId: number;
  };
  Diagnostic: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// NoteDetailScreen için özel tipler
export type NoteDetailScreenNavigationProp = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>['navigation'];
export type NoteDetailScreenRouteProp = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>['route'];

// DocumentUploadScreen için özel tipler
export type DocumentUploadScreenNavigationProp = NativeStackScreenProps<RootStackParamList, 'DocumentUpload'>['navigation'];
export type DocumentUploadScreenRouteProp = NativeStackScreenProps<RootStackParamList, 'DocumentUpload'>['route'];

// DocumentViewScreen için özel tipler
export type DocumentViewScreenNavigationProp = NativeStackScreenProps<RootStackParamList, 'DocumentView'>['navigation'];
export type DocumentViewScreenRouteProp = NativeStackScreenProps<RootStackParamList, 'DocumentView'>['route'];

// ShareNoteScreen için özel tipler
export type ShareNoteScreenNavigationProp = NativeStackScreenProps<RootStackParamList, 'ShareNote'>['navigation'];
export type ShareNoteScreenRouteProp = NativeStackScreenProps<RootStackParamList, 'ShareNote'>['route'];

export type MainTabParamList = {
  Home: undefined;
  Notes: undefined;
  Tasks: undefined;
  Calendar: undefined;
  Stats: undefined;
  Settings: undefined;
};