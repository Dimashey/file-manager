import { FileOrm } from './entities/file-orm.entity';
import { File } from 'src/modules/file/domain/file.entity';

export class FileMapper {
  static toDomain(orm: FileOrm): File {
    return new File(
      orm.id,
      orm.name,
      orm.originalName,
      orm.mimeType,
      orm.extension,
      orm.size,
      orm.storagePath,
      orm.thumbnailPath,
      orm.folderId,
      orm.ownerId,
      orm.isPublic,
      orm.position,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrm(domain: File): FileOrm {
    const orm = new FileOrm();

    orm.id = domain.id;
    orm.name = domain.name;
    orm.originalName = domain.originalName;
    orm.mimeType = domain.mimeType;
    orm.extension = domain.extension;
    orm.size = domain.size;
    orm.storagePath = domain.storagePath;
    orm.thumbnailPath = domain.thumbnailPath;
    orm.folderId = domain.folderId;
    orm.ownerId = domain.ownerId;
    orm.isPublic = domain.isPublic;
    orm.position = domain.position;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;

    return orm;
  }
}
