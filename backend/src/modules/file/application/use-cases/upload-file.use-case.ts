import { Injectable, ForbiddenException } from '@nestjs/common';
import { extname } from 'path';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { File } from '../../domain/file.entity';
import { ImageProcessingQueueService } from '../interfaces/image-processing-queue.service';

import { v4 as uuidv4 } from 'uuid';
import { UploadFileCommand } from '../dto/upload-file.command';
import { FileMovePolicy } from '../../domain/policies/file-file.policy';
import { CanNotMoveFileToFilderError as CanNotMoveFileToFolderError } from '../../domain/errors/can-not-move-file.error';

@Injectable()
export class UploadFileUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly storage: FileStorageService,
    private readonly imageQueue: ImageProcessingQueueService,
    private readonly fileMovePolicy: FileMovePolicy,
  ) {}

  async execute(dto: UploadFileCommand) {
    if (dto.folderId) {
      const folder = await this.fileMovePolicy.canMoveToFolder(dto.folderId);

      if (!folder) throw new CanNotMoveFileToFolderError();
    }

    const ext = extname(dto.file.originalname);
    const storageKey = `${dto.userId}/${uuidv4()}${ext}`;

    await this.storage.upload(storageKey, dto.file.buffer, dto.file.mimetype);

    const file = new File(
      uuidv4(),
      dto.file.originalname,
      dto.file.originalname,
      dto.file.mimetype,
      ext,
      dto.file.size,
      storageKey,
      null,
      dto.folderId ?? null,
      dto.userId,
      false,
      0,
      new Date(),
      new Date(),
    );

    const saved = await this.fileRepo.save(file);

    if (dto.file.mimetype.startsWith('image/')) {
      await this.imageQueue.enqueueCompression({
        fileId: saved.id,
        storageKey,
        mimeType: dto.file.mimetype,
      });
    }

    return saved;
  }
}
