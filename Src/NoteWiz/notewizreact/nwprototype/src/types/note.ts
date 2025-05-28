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
    pageType?: string; // lined, grid, plain
}

export interface UpdateNoteDto {
    title: string;
    content: string;
    coverId?: string;
    coverColor?: string;
    isArchived?: boolean;
    pageType?: string; // lined, grid, plain
}

export interface NoteData {
    title: string;
    content: string;
    tags?: string[];
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