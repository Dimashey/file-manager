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
