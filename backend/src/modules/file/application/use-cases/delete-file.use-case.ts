import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';
import { DeleteFileCommand } from '../commands/delete-file.command';

@Injectable()
export class DeleteFileUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly storage: FileStorageService,
  ) {}

  async execute(dto: DeleteFileCommand) {
    const file = await this.fileRepo.findById(dto.fileId);

    if (!file || file.ownerId !== dto.userId) {
      throw new FileNotFoundError();
    }

    await this.storage.delete(file.storagePath);

    if (file.thumbnailPath) {
      await this.storage.delete(file.thumbnailPath);
    }

    await this.fileRepo.delete(file.id);
  }
}
