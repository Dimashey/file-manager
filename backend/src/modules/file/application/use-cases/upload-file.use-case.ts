import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { File } from '../../domain/file.entity';
import { ImageProcessingQueueService } from '../interfaces/image-processing-queue.service';

import { v4 as uuidv4 } from 'uuid';
import { UploadFileCommand } from '../commands/upload-file.command';
import { FileMovePolicy } from '../../domain/policies/file-file.policy';
import { CanNotMoveFileToFolderError } from '../../domain/errors/can-not-move-file.error';

@Injectable()
export class UploadFileUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly storage: FileStorageService,
    private readonly imageQueue: ImageProcessingQueueService,
    private readonly fileMovePolicy: FileMovePolicy,
  ) {}

  /**
   * Uploads a new file to storage and saves metadata in the database.
   * Triggers compression tasks for image uploads.
   *
   * @param dto - The upload command containing file buffer, metadata, and folder context.
   * @returns The saved file entity.
   * @throws {CanNotMoveFileToFolderError} If target upload folder belongs to another user.
   */
  async execute(dto: UploadFileCommand) {
    if (dto.folderId) {
      const folder = await this.fileMovePolicy.canMoveToFolder(dto.folderId, dto.userId);

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
