// src/types/navigation.ts
export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  MainApp: undefined;
  Drawing: {
    noteId?: string;
  };
  NoteDetail: {
    noteId?: string;
    title?: string;
    content?: string;
    category?: string;
    isImportant?: boolean;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Notes: undefined;
  Stats: undefined;
  Settings: undefined;
};