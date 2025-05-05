import { documentService } from '../../services/documentService';
import { api } from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('DocumentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadDocument', () => {
    it('should upload document and return document data', async () => {
      const mockFile = {
        uri: 'file://test.pdf',
        type: 'application/pdf',
        name: 'test.pdf',
      };

      const mockDocument = {
        id: 1,
        filePath: '/uploads/test.pdf',
        extractedText: 'Sample text',
        uploadedAt: new Date().toISOString(),
        userId: 1,
      };

      mockedApi.post.mockResolvedValueOnce({ data: mockDocument });

      const result = await documentService.uploadDocument({ file: mockFile });

      expect(result).toEqual(mockDocument);
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/documents/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
    });
  });

  describe('getDocuments', () => {
    it('should return documents array', async () => {
      const mockDocuments = [
        {
          id: 1,
          filePath: '/uploads/test1.pdf',
          extractedText: 'Text 1',
          uploadedAt: new Date().toISOString(),
          userId: 1,
        },
        {
          id: 2,
          filePath: '/uploads/test2.pdf',
          extractedText: 'Text 2',
          uploadedAt: new Date().toISOString(),
          userId: 1,
        },
      ];

      mockedApi.get.mockResolvedValueOnce({ data: mockDocuments });

      const result = await documentService.getDocuments();

      expect(result).toEqual(mockDocuments);
      expect(mockedApi.get).toHaveBeenCalledWith('/documents');
    });
  });

  describe('extractText', () => {
    it('should extract text from document', async () => {
      const documentId = 1;
      const mockText = 'Extracted text content';

      mockedApi.post.mockResolvedValueOnce({ data: { text: mockText } });

      const result = await documentService.extractText(documentId);

      expect(result).toBe(mockText);
      expect(mockedApi.post).toHaveBeenCalledWith(`/documents/${documentId}/extract-text`);
    });
  });
}); 