// src/types/index.ts

// Navigation types
export interface NavigationProps {
    navigation: {
        navigate: (screen: string, params?: any) => void;
        goBack: () => void;
        setOptions: (options: any) => void;
        // Diğer navigation prop'ları eklenebilir
    };
}

// Tüm type'ları export ediyoruz
export * from './note';
export * from './user';
export * from './task';
export * from './category';

// Not: Note interface'i artık note.ts içinde tanımlı olduğu için
// buradaki Note interface'ini kaldırıyoruz.