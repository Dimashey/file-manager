import { Folder } from '../../domain/folder.entity';
import { FolderOrm } from './entities/folder-orm.entity';

export class FolderMapper {
  static toDomain(orm: FolderOrm): Folder {
    return new Folder(
      orm.id,
      orm.name,
      orm.parentId,
      orm.ownerId,
      orm.isPublic,
      orm.position,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrm(domain: Folder): FolderOrm {
    const orm = new FolderOrm();

    orm.id = domain.id;
    orm.name = domain.name;
    orm.parentId = domain.parentId;
    orm.ownerId = domain.ownerId;
    orm.isPublic = domain.isPublic;
    orm.position = domain.position;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;

    return orm;
  }
}
