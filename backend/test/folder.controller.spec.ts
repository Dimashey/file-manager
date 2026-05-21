/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { FolderController } from '../src/modules/folder/presentation/folder.controller';
import { ListFoldersUseCase } from '../src/modules/folder/application/use-cases/list-folders.use-case';
import { CreateFolderUseCase } from '../src/modules/folder/application/use-cases/create-folder.use-case';
import { GetFolderUseCase } from '../src/modules/folder/application/use-cases/get-folder.use-case';
import { ReorderFoldersUseCase } from '../src/modules/folder/application/use-cases/reorder-folders.use-case';
import { UpdateFolderUseCase } from '../src/modules/folder/application/use-cases/update-folder.use-case';
import { DeleteFolderUseCase } from '../src/modules/folder/application/use-cases/delete-folder.use-case';
import { CloneFolderUseCase } from '../src/modules/folder/application/use-cases/clone-folder.use-case';
import { SearchFoldersUseCase } from '../src/modules/folder/application/use-cases/search-folders.use-case';
import { GetPublicFolderUseCase } from '../src/modules/folder/application/use-cases/get-public-folder.use-case';
import { User } from '../src/modules/auth/domain/user.entity';

const mockUser = { id: 'user-1', email: 'a@b.com', name: 'A' } as User;

describe('FolderController', () => {
  let controller: FolderController;
  let listUseCase: jest.Mocked<ListFoldersUseCase>;
  let createUseCase: jest.Mocked<CreateFolderUseCase>;
  let getUseCase: jest.Mocked<GetFolderUseCase>;
  let reorderUseCase: jest.Mocked<ReorderFoldersUseCase>;
  let updateUseCase: jest.Mocked<UpdateFolderUseCase>;
  let deleteUseCase: jest.Mocked<DeleteFolderUseCase>;
  let cloneUseCase: jest.Mocked<CloneFolderUseCase>;
  let searchUseCase: jest.Mocked<SearchFoldersUseCase>;
  let getPublicFolderUseCase: jest.Mocked<GetPublicFolderUseCase>;

  beforeEach(async () => {
    listUseCase = { execute: jest.fn() } as any;
    createUseCase = { execute: jest.fn() } as any;
    getUseCase = { execute: jest.fn() } as any;
    reorderUseCase = { execute: jest.fn() } as any;
    updateUseCase = { execute: jest.fn() } as any;
    deleteUseCase = { execute: jest.fn() } as any;
    cloneUseCase = { execute: jest.fn() } as any;
    searchUseCase = { execute: jest.fn() } as any;
    getPublicFolderUseCase = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FolderController],
      providers: [
        { provide: ListFoldersUseCase, useValue: listUseCase },
        { provide: CreateFolderUseCase, useValue: createUseCase },
        { provide: GetFolderUseCase, useValue: getUseCase },
        { provide: ReorderFoldersUseCase, useValue: reorderUseCase },
        { provide: UpdateFolderUseCase, useValue: updateUseCase },
        { provide: DeleteFolderUseCase, useValue: deleteUseCase },
        { provide: CloneFolderUseCase, useValue: cloneUseCase },
        { provide: SearchFoldersUseCase, useValue: searchUseCase },
        { provide: GetPublicFolderUseCase, useValue: getPublicFolderUseCase },
      ],
    }).compile();

    controller = module.get<FolderController>(FolderController);
  });

  describe('listFolders', () => {
    it('should call listFoldersUseCase', async () => {
      const folders = [{ id: 'f-1', name: 'Docs' }] as any;
      listUseCase.execute.mockResolvedValue(folders);

      const result = await controller.listFolders(mockUser);

      expect(result).toEqual(folders);
      expect(listUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('createFolder', () => {
    it('should call createFolderUseCase', async () => {
      const folder = { id: 'f-1', name: 'New' } as any;
      createUseCase.execute.mockResolvedValue(folder);

      const result = await controller.createFolder(mockUser, { name: 'New' });

      expect(result).toEqual(folder);
      expect(createUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('getFolder', () => {
    it('should call getFolderUseCase', async () => {
      const folder = { id: 'f-1', name: 'Docs' } as any;
      getUseCase.execute.mockResolvedValue(folder);

      const result = await controller.getFolder(mockUser, 'f-1');

      expect(result).toEqual(folder);
      expect(getUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('deleteFolder', () => {
    it('should call deleteFolderUseCase', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);

      await controller.deleteFolder(mockUser, 'f-1');

      expect(deleteUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('reorderFolders', () => {
    it('should call reorderFoldersUseCase', async () => {
      reorderUseCase.execute.mockResolvedValue(undefined);

      await controller.reorderFolders(mockUser, {
        items: [{ id: 'f-1', position: 0 }],
      });

      expect(reorderUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('cloneFolder', () => {
    it('should call cloneFolderUseCase', async () => {
      const cloned = { id: 'f-2', name: 'Docs (copy)' } as any;
      cloneUseCase.execute.mockResolvedValue(cloned);

      const result = await controller.cloneFolder(mockUser, 'f-1');

      expect(result).toEqual(cloned);
      expect(cloneUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('getPublicFolder', () => {
    it('should call getPublicFolderUseCase', async () => {
      const folder = { id: 'f-1', name: 'Public Folder' } as any;
      getPublicFolderUseCase.execute.mockResolvedValue(folder);

      const result = await controller.getPublicFolder('f-1');

      expect(result).toEqual(folder);
      expect(getPublicFolderUseCase.execute).toHaveBeenCalled();
    });
  });
});
