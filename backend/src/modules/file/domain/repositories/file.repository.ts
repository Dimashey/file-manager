import { File } from '../file.entity';

export abstract class FileRepository {
  abstract findById(id: string): Promise<File | null>;

  abstract findByOwner(ownerId: string, folderId: string | null): Promise<File[]>;

  abstract save(file: File): Promise<File>;

  abstract delete(id: string): Promise<void>;

  abstract updatePosition(id: string, ownerId: string, position: number): Promise<void>;

  abstract updatePositions(
    items: { id: string; position: number }[],
    ownerId: string,
  ): Promise<void>;
}
