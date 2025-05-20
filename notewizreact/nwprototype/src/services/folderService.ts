import { apiClient } from './newApi';

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isFolder: boolean;
}

export const folderService = {
  async getFolders(): Promise<Folder[]> {
    const response = await apiClient.get('/folder');
    return response.data.map((folder: any) => ({
      ...folder,
      id: folder.id.toString(),
      icon: 'folder',
      isFolder: true
    }));
  },
  async addFolder(name: string, color: string): Promise<Folder> {
    const response = await apiClient.post('/folder', { name, color });
    return {
      ...response.data,
      id: response.data.id.toString(),
      icon: 'folder',
      isFolder: true
    };
  },
  async deleteFolder(id: number): Promise<void> {
    await apiClient.delete(`/folder/${id}`);
  },
}; 