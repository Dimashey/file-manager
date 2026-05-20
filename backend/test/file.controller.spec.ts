import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from '../src/modules/file/presentation/file.controller';
import { ListFilesUseCase } from '../src/modules/file/application/use-cases/list-files.use-case';
import { GetFileUseCase } from '../src/modules/file/application/use-cases/get-file.use-case';
import { UploadFileUseCase } from '../src/modules/file/application/use-cases/upload-file.use-case';
import { UpdateFileUseCase } from '../src/modules/file/application/use-cases/update-file.use-case';
import { DeleteFileUseCase } from '../src/modules/file/application/use-cases/delete-file.use-case';
import { CloneFileUseCase } from '../src/modules/file/application/use-cases/clone-file.use-case';
import { SearchFilesUseCase } from '../src/modules/file/application/use-cases/search-files.use-case';
import { ReorderFilesUseCase } from '../src/modules/file/application/use-cases/reorder.use-case';
import { DownloadFileUseCase } from '../src/modules/file/application/use-cases/download-file.use-case';
import { User } from '../src/modules/auth/domain/user.entity';

const mockUser = { id: 'user-1', email: 'a@b.com', name: 'A' } as User;

describe('FileController', () => {
  let controller: FileController;
  let listUseCase: jest.Mocked<ListFilesUseCase>;
  let getUseCase: jest.Mocked<GetFileUseCase>;
  let uploadUseCase: jest.Mocked<UploadFileUseCase>;
  let updateUseCase: jest.Mocked<UpdateFileUseCase>;
  let deleteUseCase: jest.Mocked<DeleteFileUseCase>;
  let cloneUseCase: jest.Mocked<CloneFileUseCase>;
  let searchUseCase: jest.Mocked<SearchFilesUseCase>;
  let reorderUseCase: jest.Mocked<ReorderFilesUseCase>;
  let downloadUseCase: jest.Mocked<DownloadFileUseCase>;

  beforeEach(async () => {
    listUseCase = { execute: jest.fn() } as any;
    getUseCase = { execute: jest.fn() } as any;
    uploadUseCase = { execute: jest.fn() } as any;
    updateUseCase = { execute: jest.fn() } as any;
    deleteUseCase = { execute: jest.fn() } as any;
    cloneUseCase = { execute: jest.fn() } as any;
    searchUseCase = { execute: jest.fn() } as any;
    reorderUseCase = { execute: jest.fn() } as any;
    downloadUseCase = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        { provide: ListFilesUseCase, useValue: listUseCase },
        { provide: GetFileUseCase, useValue: getUseCase },
        { provide: UploadFileUseCase, useValue: uploadUseCase },
        { provide: UpdateFileUseCase, useValue: updateUseCase },
        { provide: DeleteFileUseCase, useValue: deleteUseCase },
        { provide: CloneFileUseCase, useValue: cloneUseCase },
        { provide: SearchFilesUseCase, useValue: searchUseCase },
        { provide: ReorderFilesUseCase, useValue: reorderUseCase },
        { provide: DownloadFileUseCase, useValue: downloadUseCase },
      ],
    }).compile();

    controller = module.get<FileController>(FileController);
  });

  describe('list', () => {
    it('should return files for the current user', async () => {
      const files = [{ id: 'f-1', name: 'doc.pdf' }] as any;
      listUseCase.execute.mockResolvedValue(files);

      const result = await controller.list(mockUser);

      expect(result).toEqual(files);
      expect(listUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single file', async () => {
      const file = { id: 'f-1', name: 'doc.pdf' } as any;
      getUseCase.execute.mockResolvedValue(file);

      const result = await controller.findOne(mockUser, 'f-1');

      expect(result).toEqual(file);
      expect(getUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('upload', () => {
    it('should upload a file and return file record', async () => {
      const file = { id: 'f-1', name: 'photo.jpg' } as any;
      const multerFile = { originalname: 'photo.jpg', buffer: Buffer.from('') } as any;
      uploadUseCase.execute.mockResolvedValue(file);

      const result = await controller.upload(mockUser, multerFile);

      expect(result).toEqual(file);
      expect(uploadUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a file and return updated record', async () => {
      const updated = { id: 'f-1', name: 'renamed.pdf' } as any;
      updateUseCase.execute.mockResolvedValue(updated);

      const result = await controller.update(mockUser, 'f-1', { name: 'renamed.pdf' });

      expect(result).toEqual(updated);
      expect(updateUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should call deleteUseCase', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);

      await controller.remove(mockUser, 'f-1');

      expect(deleteUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('clone', () => {
    it('should clone a file and return the clone', async () => {
      const cloned = { id: 'f-2', name: 'doc (copy).pdf' } as any;
      cloneUseCase.execute.mockResolvedValue(cloned);

      const result = await controller.clone(mockUser, 'f-1');

      expect(result).toEqual(cloned);
      expect(cloneUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should return files matching the search query', async () => {
      const files = [{ id: 'f-1', name: 'report.pdf' }] as any;
      searchUseCase.execute.mockResolvedValue(files);

      const result = await controller.search(mockUser, 'report');

      expect(result).toEqual(files);
      expect(searchUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    it('should call reorderUseCase', async () => {
      reorderUseCase.execute.mockResolvedValue(undefined);

      await controller.reorder(mockUser, { items: [{ id: 'f-1', position: 0 }] });

      expect(reorderUseCase.execute).toHaveBeenCalled();
    });
  });
});
