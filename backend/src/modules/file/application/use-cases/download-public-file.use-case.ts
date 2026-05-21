import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { SharedFileNotFoundError } from '../../domain/errors/shared-file-not-found.error';
import { DownloadPublicFileCommand } from '../dto/download-public-file.command';

@Injectable()
export class DownloadPublicFileUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly storageService: FileStorageService,
  ) {}

  async execute(command: DownloadPublicFileCommand) {
    const file = await this.fileRepo.findById(command.fileId);
    if (!file || !file.isPublic) {
      throw new SharedFileNotFoundError();
    }
    const stream = await this.storageService.download(file.storagePath);
    return { stream, file };
  }
}
