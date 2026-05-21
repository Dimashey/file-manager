import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { DownloadFileCommand } from '../commands/download-file.command';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';

@Injectable()
export class DownloadFileUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly storage: FileStorageService,
  ) {}

  /**
   * Downloads a file owned by a user.
   * Validates ownership and returns a read stream along with file metadata.
   *
   * @param dto - The download command containing user ID and file ID.
   * @returns An object containing the download stream and the file entity.
   * @throws {FileNotFoundError} If the file does not exist or does not belong to the user.
   */
  async execute(dto: DownloadFileCommand) {
    const file = await this.fileRepo.findById(dto.fileId);

    if (!file || file.ownerId !== dto.userId) {
      throw new FileNotFoundError();
    }

    const stream = await this.storage.download(file.storagePath);

    return {
      stream,
      file,
    };
  }
}
