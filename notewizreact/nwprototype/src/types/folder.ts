export interface Folder {
    id: string;
    title: string;
    isFolder: boolean;
    parentFolderId: string | null;
    updatedAt: Date | string;
} 