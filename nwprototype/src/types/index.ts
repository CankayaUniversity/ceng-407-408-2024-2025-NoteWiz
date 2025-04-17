// src\types\index.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;  // Şimdilik categoryId yerine category kullanmaya devam edelim
  timestamp: string;
  isImportant: boolean;
  updatedAt: Date;
}
  
  export interface NavigationProps {
    navigation: any; // Daha sonra spesifik olarak tanımlanabilir
  }