import { InjectRepository } from '@nestjs/typeorm';
import { FileRepository } from 'src/modules/file/domain/repositories/file.repository';
import { FileOrm } from '../entities/file-orm.entity';
import { ILike, IsNull, Repository } from 'typeorm';
import { FileMapper } from '../file.mapper';
import { File } from 'src/modules/file/domain/file.entity';

export class TypeOrmFileRepository implements FileRepository {
  constructor(
    @InjectRepository(FileOrm)
    private readonly repo: Repository<FileOrm>,
  ) {}

  async findById(id: string): Promise<File | null> {
    const file = await this.repo.findOneBy({ id });

    if (!file) return null;

    return FileMapper.toDomain(file);
  }

  async findByOwner(ownerId: string, folderId: string | null): Promise<File[]> {
    const files = await this.repo.find({
      where: {
        ownerId,
        folderId: folderId ?? IsNull(),
      },
      order: {
        position: 'ASC',
        createdAt: 'ASC',
      },
    });

    return files.map((f) => FileMapper.toDomain(f));
  }

  async save(file: File): Promise<File> {
    const orm = FileMapper.toOrm(file);

    const saved = await this.repo.save(orm);

    return FileMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async updatePosition(id: string, ownerId: string, position: number): Promise<void> {
    await this.repo.update({ id, ownerId }, { position });
  }

  async updatePositions(items: { id: string; position: number }[], ownerId: string): Promise<void> {
    await this.repo.manager.transaction(async (manager) => {
      for (const item of items) {
        await manager.update(FileOrm, { id: item.id, ownerId }, { position: item.position });
      }
    });
  }

  async search(ownerId: string, name: string): Promise<File[]> {
    const files = await this.repo.find({
      where: { ownerId, name: ILike(`%${name}%`) },
      order: { position: 'ASC', createdAt: 'ASC' },
    });

    return files.map((f) => FileMapper.toDomain(f));
  }

  async findByFolder(folderId: string | null): Promise<File[]> {
    const files = await this.repo.find({
      where: { folderId: folderId ?? IsNull() },
      order: { position: 'ASC', createdAt: 'ASC' },
    });

    return files.map((f) => FileMapper.toDomain(f));
  }
}
