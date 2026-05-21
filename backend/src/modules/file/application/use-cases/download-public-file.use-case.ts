import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { SharedFileNotFoundError } from '../../domain/errors/shared-file-not-found.error';
import { DownloadPublicFileCommand } from '../commands/download-public-file.command';

@Injectable()
export class DownloadPublicFileUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly storageService: FileStorageService,
  ) {}

  /**
   * Downloads a public file.
   * Validates that the file exists and is marked as public, then returns its read stream.
   *
   * @param command - The command containing the file ID.
   * @returns An object containing the download stream and the file entity.
   * @throws {SharedFileNotFoundError} If the file is not found or is not public.
   */
  async execute(command: DownloadPublicFileCommand) {
    const file = await this.fileRepo.findById(command.fileId);
    if (!file || !file.isPublic) {
      throw new SharedFileNotFoundError();
    }
    const stream = await this.storageService.download(file.storagePath);
    return { stream, file };
  }
}
