import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FolderController } from '../src/modules/folder/presentation/folder.controller';
import { Folder } from '../src/modules/folder/domain/folder.entity';
import { User } from '../src/modules/auth/domain/user.entity';

interface MockFolderRepo {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  update: jest.Mock;
}

const mockUser = { id: 'user-1', email: 'a@b.com', name: 'A' } as User;

describe('FolderController', () => {
  let controller: FolderController;
  let repo: MockFolderRepo;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FolderController],
      providers: [{ provide: getRepositoryToken(Folder), useValue: repo }],
    }).compile();

    controller = module.get<FolderController>(FolderController);
  });

  describe('list', () => {
    it('should return root folders when no parentId given', async () => {
      const folders = [{ id: 'f-1', name: 'Docs' }] as Folder[];
      repo.find.mockResolvedValue(folders);

      const result = await controller.list(mockUser);

      expect(result).toEqual(folders);
    });
  });

  describe('create', () => {
    it('should create and return a folder', async () => {
      const folder = { id: 'f-1', name: 'New', ownerId: 'user-1' } as Folder;
      repo.create.mockReturnValue(folder);
      repo.save.mockResolvedValue(folder);

      const result = await controller.create(mockUser, { name: 'New' });

      expect(result.name).toBe('New');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return the folder when found', async () => {
      const folder = { id: 'f-1', name: 'Docs', ownerId: 'user-1' } as Folder;
      repo.findOne.mockResolvedValue(folder);

      const result = await controller.findOne(mockUser, 'f-1');

      expect(result).toEqual(folder);
    });

    it('should throw NotFoundException when folder does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(controller.findOne(mockUser, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the folder', async () => {
      const folder = { id: 'f-1' } as Folder;
      repo.findOne.mockResolvedValue(folder);
      repo.remove.mockResolvedValue(folder);

      await expect(controller.remove(mockUser, 'f-1')).resolves.toBeUndefined();
      expect(repo.remove).toHaveBeenCalledWith(folder);
    });

    it('should throw NotFoundException when folder does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(controller.remove(mockUser, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorder', () => {
    it('should update position for each item', async () => {
      repo.update.mockResolvedValue({ affected: 1 });

      await controller.reorder(mockUser, {
        items: [
          { id: 'f-1', position: 0 },
          { id: 'f-2', position: 1 },
        ],
      });

      expect(repo.update).toHaveBeenCalledTimes(2);
      expect(repo.update).toHaveBeenCalledWith({ id: 'f-1', ownerId: 'user-1' }, { position: 0 });
    });
  });

  describe('clone', () => {
    it('should throw NotFoundException when source folder does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(controller.clone(mockUser, 'bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should create a copy with (copy) suffix', async () => {
      const source = {
        id: 'f-1',
        name: 'Docs',
        parentId: null,
        ownerId: 'user-1',
        isPublic: false,
        position: 0,
      } as Folder;
      const cloned = { ...source, id: 'f-2', name: 'Docs (copy)' };

      repo.findOne.mockResolvedValue(source);
      repo.create.mockReturnValue(cloned);
      repo.save.mockResolvedValue(cloned);
      repo.find.mockResolvedValue([]); // no children

      const result = await controller.clone(mockUser, 'f-1');

      expect(result.name).toBe('Docs (copy)');
    });
  });
});
