import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FolderRepository } from 'src/modules/folder/domain/repositories/folder.repository';
import { IsNull, Repository } from 'typeorm';
import { FolderOrm } from '../etities/folder-orm.entity';
import { FolderMapper } from '../folder.mapper';
import { Folder } from 'src/modules/folder/domain/folder.entity';

@Injectable()
export class TypeOrmFolderRepository implements FolderRepository {
  constructor(
    @InjectRepository(FolderOrm)
    private readonly repo: Repository<FolderOrm>,
  ) {}

  async findById(id: string): Promise<Folder | null> {
    const folder = await this.repo.findOneBy({ id });

    if (!folder) return null;

    return FolderMapper.toDomain(folder);
  }

  async findByOwner(userId: string, parentId: string | null): Promise<Folder[]> {
    const folders = await this.repo.find({
      where: {
        ownerId: userId,
        parentId: parentId ?? IsNull(),
      },
      order: {
        position: 'ASC',
        createdAt: 'ASC',
      },
    });

    return folders.map(FolderMapper.toDomain);
  }

  async save(folder: Folder): Promise<Folder> {
    const orm = FolderMapper.toOrm(folder);

    const saved = await this.repo.save(orm);

    return FolderMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async updatePosition(id: string, userId: string, position: number): Promise<void> {
    await this.repo.update({ id, ownerId: userId }, { position });
  }

  async updatePositions(items: { id: string; position: number }[], userId: string): Promise<void> {
    await this.repo.manager.transaction(async (manager) => {
      for (const item of items) {
        await manager.update(FolderOrm, { id: item.id, ownerId: userId }, { position: item.position });
      }
    });
  }

  async findChildren(parentId: string, userId: string): Promise<Folder[]> {
    const children = await this.repo.find({
      where: {
        parentId,
        ownerId: userId,
      },
    });

    return children.map(FolderMapper.toDomain);
  }
}
