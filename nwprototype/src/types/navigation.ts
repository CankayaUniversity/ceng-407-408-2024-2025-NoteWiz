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
    isPdf?: boolean;
    pdfUrl?: string;
    pdfName?: string;
    // Added new properties:
    folderId?: string | null;
    coverImage?: any;
  };
  TaskDetail: {
    taskId?: string;
    presetDueDate?: string; // Takvimden seçilen tarih için
  };
  Calendar: undefined; // Yeni eklenen takvim ekranı
};

export type MainTabParamList = {
  Home: undefined;
  Notes: undefined;
  Tasks: undefined;
  Calendar: undefined; // Tab navigator'a Calendar ekledik
  Stats: undefined;
  Settings: undefined;
};