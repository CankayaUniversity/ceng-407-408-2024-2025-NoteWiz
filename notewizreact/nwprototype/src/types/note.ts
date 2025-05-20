import { User, Task, Category, NavigationProps } from '../types';

export interface Note {
    id: string | number;
    title: string;
    content: string;
    coverId?: string;
    coverColor?: string;
    coverImage?: string;
    isPinned: boolean;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    userId: number;
    tags: string[];
    collaborators: User[];
    category?: string;
    isImportant?: boolean;
    folderId?: string | null;
    isPdf?: boolean;
    pdfUrl?: string;
    pdfName?: string;
}

export interface CreateNoteDto {
    title: string;
    content: string;
    coverId?: string;
    coverColor?: string;
    isArchived?: boolean;
<<<<<<< HEAD
    pageType?: string; // lined, grid, plain
=======
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
}

export interface UpdateNoteDto {
    title: string;
    content: string;
    coverId?: string;
    coverColor?: string;
    isArchived?: boolean;
<<<<<<< HEAD
    pageType?: string; // lined, grid, plain
=======
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
}

export interface NoteData {
    title: string;
    content: string;
    tags?: string[];
<<<<<<< HEAD
=======
    color?: string;
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    isImportant?: boolean;
    categoryId?: string;
    folderId?: string | null;
}

export interface NoteDto {
    id: number;
    title: string;
    content: string;
    coverId?: string;
    coverColor?: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt?: string;
    userId: number;
}