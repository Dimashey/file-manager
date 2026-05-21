import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';

import { File } from '../../domain/file.entity';
import { v4 as uuidv4 } from 'uuid';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';

@Injectable()
export class CloneFileUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly storage: FileStorageService,
  ) {}

  async execute(input: { userId: string; fileId: string }) {
    const file = await this.fileRepo.findById(input.fileId);

    if (!file || file.ownerId !== input.userId) {
      throw new FileNotFoundError();
    }

    const newKey = `${input.userId}/${uuidv4()}${file.extension}`;

    await this.storage.copy(file.storagePath, newKey);

    const clone = new File(
      uuidv4(),
      `${file.name} (copy)`,
      file.originalName,
      file.mimeType,
      file.extension,
      file.size,
      newKey,
      null,
      file.folderId,
      file.ownerId,
      file.isPublic,
      file.position,
      new Date(),
      new Date(),
    );

    return this.fileRepo.save(clone);
  }
}
