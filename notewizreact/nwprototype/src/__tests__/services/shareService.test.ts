import { shareService } from '../../services/shareService';
import { api } from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('ShareService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shareNote', () => {
    it('should share note with user', async () => {
      const noteId = 1;
      const shareData = {
        sharedWithUserId: 2,
        canEdit: true,
      };

      const mockShare = {
        id: 1,
        noteId,
        sharedWithUserId: shareData.sharedWithUserId,
        canEdit: shareData.canEdit,
        sharedAt: new Date().toISOString(),
        sharedWithUser: {
          id: 2,
          username: 'testuser',
          email: 'test@example.com',
          fullName: 'Test User',
        },
      };

      mockedApi.post.mockResolvedValueOnce({ data: mockShare });

      const result = await shareService.shareNote(noteId, shareData);

      expect(result).toEqual(mockShare);
      expect(mockedApi.post).toHaveBeenCalledWith(`/notes/${noteId}/share`, shareData);
    });
  });

  describe('getSharedNotes', () => {
    it('should return shared notes array', async () => {
      const mockShares = [
        {
          id: 1,
          noteId: 1,
          sharedWithUserId: 2,
          canEdit: true,
          sharedAt: new Date().toISOString(),
          sharedWithUser: {
            id: 2,
            username: 'user1',
            email: 'user1@example.com',
            fullName: 'User One',
          },
        },
        {
          id: 2,
          noteId: 2,
          sharedWithUserId: 3,
          canEdit: false,
          sharedAt: new Date().toISOString(),
          sharedWithUser: {
            id: 3,
            username: 'user2',
            email: 'user2@example.com',
            fullName: 'User Two',
          },
        },
      ];

      mockedApi.get.mockResolvedValueOnce({ data: mockShares });

      const result = await shareService.getSharedNotes();

      expect(result).toEqual(mockShares);
      expect(mockedApi.get).toHaveBeenCalledWith('/notes/shared');
    });
  });

  describe('updateSharePermission', () => {
    it('should update share permission', async () => {
      const shareId = 1;
      const canEdit = false;

      const mockUpdatedShare = {
        id: shareId,
        noteId: 1,
        sharedWithUserId: 2,
        canEdit,
        sharedAt: new Date().toISOString(),
        sharedWithUser: {
          id: 2,
          username: 'testuser',
          email: 'test@example.com',
          fullName: 'Test User',
        },
      };

      mockedApi.put.mockResolvedValueOnce({ data: mockUpdatedShare });

      const result = await shareService.updateSharePermission(shareId, canEdit);

      expect(result).toEqual(mockUpdatedShare);
      expect(mockedApi.put).toHaveBeenCalledWith(`/notes/shares/${shareId}`, { canEdit });
    });
  });
}); 