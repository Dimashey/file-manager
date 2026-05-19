import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { ListFilesCommand } from '../dto/list-files.command';

@Injectable()
export class ListFilesUseCase {
  constructor(private readonly fileRepo: FileRepository) {}

  async execute(command: ListFilesCommand) {
    return this.fileRepo.findByOwner(command.userId, command.folderId ?? null);
  }
}
