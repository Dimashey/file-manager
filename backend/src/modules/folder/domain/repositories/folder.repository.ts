import { Folder } from '../folder.entity';

export abstract class FolderRepository {
  abstract findById(id: string): Promise<Folder | null>;

  abstract findByOwner(userId: string, parentId: string | null): Promise<Folder[]>;

  abstract save(folder: Folder): Promise<Folder>;

  abstract delete(id: string): Promise<void>;

  abstract updatePosition(id: string, userId: string, position: number): Promise<void>;

  abstract updatePositions(items: { id: string; position: number }[], userId: string): Promise<void>;

  abstract findChildren(parentId: string, userId: string): Promise<Folder[]>;

  abstract search(userId: string, name: string): Promise<Folder[]>;

  abstract findSubfolders(parentId: string | null): Promise<Folder[]>;
}
