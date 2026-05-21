/* eslint-disable @typescript-eslint/unbound-method */
import { Readable } from 'stream';
import { UploadFileUseCase } from './upload-file.use-case';
import { UploadFileCommand } from '../commands/upload-file.command';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { ImageProcessingQueueService } from '../interfaces/image-processing-queue.service';
import { FileMovePolicy } from '../../domain/policies/file-file.policy';
import { File } from '../../domain/file.entity';
import { CanNotMoveFileToFolderError } from '../../domain/errors/can-not-move-file.error';

describe('UploadFileUseCase', () => {
  let useCase: UploadFileUseCase;
  let mockFileRepo: jest.Mocked<FileRepository>;
  let mockStorage: jest.Mocked<FileStorageService>;
  let mockQueue: jest.Mocked<ImageProcessingQueueService>;
  let mockMovePolicy: jest.Mocked<FileMovePolicy>;

  beforeEach(() => {
    mockFileRepo = {
      findById: jest.fn(),
      findByOwner: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      updatePosition: jest.fn(),
      updatePositions: jest.fn(),
      search: jest.fn(),
      findByFolder: jest.fn(),
    };

    mockStorage = {
      upload: jest.fn(),
      download: jest.fn(),
      delete: jest.fn(),
      copy: jest.fn(),
    };

    mockQueue = {
      enqueueCompression: jest.fn(),
    };

    mockMovePolicy = {
      canMoveToFolder: jest.fn(),
    };

    useCase = new UploadFileUseCase(mockFileRepo, mockStorage, mockQueue, mockMovePolicy);
  });

  describe('execute', () => {
    const mockFileObj = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 100,
      destination: '',
      filename: '',
      path: '',
      buffer: Buffer.from('data'),
      stream: Readable.from([]),
    } as Express.Multer.File;

    it('should throw CanNotMoveFileToFolderError if move policy denies upload to folder', async () => {
      mockMovePolicy.canMoveToFolder.mockResolvedValue(false);

      const cmd = new UploadFileCommand('user-1', mockFileObj, 'folder-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(CanNotMoveFileToFolderError);
      expect(mockMovePolicy.canMoveToFolder).toHaveBeenCalledWith('folder-1', 'user-1');
    });

    it('should successfully upload an image, trigger queue compression, and return saved file metadata', async () => {
      mockMovePolicy.canMoveToFolder.mockResolvedValue(true);
      mockStorage.upload.mockResolvedValue('uploaded-key');
      mockFileRepo.save.mockImplementation((f) => Promise.resolve(f));
      mockQueue.enqueueCompression.mockResolvedValue(undefined);

      const cmd = new UploadFileCommand('user-1', mockFileObj, 'folder-1');
      const result = await useCase.execute(cmd);

      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('test.jpg');
      expect(result.ownerId).toBe('user-1');
      expect(result.folderId).toBe('folder-1');

      expect(mockStorage.upload).toHaveBeenCalledTimes(1);
      expect(mockFileRepo.save).toHaveBeenCalledTimes(1);
      expect(mockQueue.enqueueCompression).toHaveBeenCalledWith({
        fileId: result.id,
        storageKey: result.storagePath,
        mimeType: 'image/jpeg',
      });
    });

    it('should upload a non-image file successfully without enqueuing compression', async () => {
      const txtFileObj = {
        fieldname: 'file',
        originalname: 'doc.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 50,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('txt'),
        stream: Readable.from([]),
      } as Express.Multer.File;

      mockStorage.upload.mockResolvedValue('uploaded-key');
      mockFileRepo.save.mockImplementation((f) => Promise.resolve(f));

      const cmd = new UploadFileCommand('user-1', txtFileObj, undefined);
      const result = await useCase.execute(cmd);

      expect(result.name).toBe('doc.txt');
      expect(mockStorage.upload).toHaveBeenCalledTimes(1);
      expect(mockFileRepo.save).toHaveBeenCalledTimes(1);
      expect(mockQueue.enqueueCompression).not.toHaveBeenCalled();
    });
  });
});
