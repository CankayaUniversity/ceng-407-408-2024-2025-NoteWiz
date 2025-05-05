import { noteService } from '../../services/noteService';
import { api } from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('NoteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotes', () => {
    it('should return notes array', async () => {
      const mockNotes = [
        { id: 1, title: 'Note 1', content: 'Content 1' },
        { id: 2, title: 'Note 2', content: 'Content 2' },
      ];

      mockedApi.get.mockResolvedValueOnce({ data: mockNotes });

      const result = await noteService.getNotes();

      expect(result).toEqual(mockNotes);
      expect(mockedApi.get).toHaveBeenCalledWith('/notes');
    });

    it('should throw error when API call fails', async () => {
      const error = new Error('API Error');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(noteService.getNotes()).rejects.toThrow('API Error');
    });
  });

  describe('createNote', () => {
    it('should create and return new note', async () => {
      const newNote = {
        title: 'New Note',
        content: 'New Content',
        tags: ['tag1'],
      };

      const createdNote = {
        id: 1,
        ...newNote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockedApi.post.mockResolvedValueOnce({ data: createdNote });

      const result = await noteService.createNote(newNote);

      expect(result).toEqual(createdNote);
      expect(mockedApi.post).toHaveBeenCalledWith('/notes', newNote);
    });
  });

  describe('updateNote', () => {
    it('should update and return note', async () => {
      const noteId = 1;
      const updateData = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const updatedNote = {
        id: noteId,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      mockedApi.put.mockResolvedValueOnce({ data: updatedNote });

      const result = await noteService.updateNote(noteId, updateData);

      expect(result).toEqual(updatedNote);
      expect(mockedApi.put).toHaveBeenCalledWith(`/notes/${noteId}`, updateData);
    });
  });

  describe('deleteNote', () => {
    it('should delete note', async () => {
      const noteId = 1;

      mockedApi.delete.mockResolvedValueOnce({});

      await noteService.deleteNote(noteId);

      expect(mockedApi.delete).toHaveBeenCalledWith(`/notes/${noteId}`);
    });
  });

  describe('updateCover', () => {
    it('should update note cover', async () => {
      const noteId = 1;
      const coverData = {
        coverType: 'color',
        coverPosition: 'top',
      };

      const updatedNote = {
        id: noteId,
        ...coverData,
        updatedAt: new Date().toISOString(),
      };

      mockedApi.put.mockResolvedValueOnce({ data: updatedNote });

      const result = await noteService.updateCover(noteId, coverData);

      expect(result).toEqual(updatedNote);
      expect(mockedApi.put).toHaveBeenCalledWith(`/notes/${noteId}/cover`, coverData);
    });
  });

  describe('shareNote', () => {
    it('should share note with user', async () => {
      const noteId = 1;
      const userId = 2;
      const canEdit = true;

      mockedApi.post.mockResolvedValueOnce({});

      await noteService.shareNote(noteId, userId, canEdit);

      expect(mockedApi.post).toHaveBeenCalledWith(`/notes/${noteId}/share`, {
        sharedWithUserId: userId,
        canEdit,
      });
    });
  });
}); 