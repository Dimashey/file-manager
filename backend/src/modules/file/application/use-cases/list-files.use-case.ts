import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { ListFilesCommand } from '../commands/list-files.command';

@Injectable()
export class ListFilesUseCase {
  constructor(private readonly fileRepo: FileRepository) {}

  /**
   * Lists files owned by a user inside a specific folder (or root).
   *
   * @param command - The query details including user ID and folder ID.
   * @returns An array of matching file entities.
   */
  async execute(command: ListFilesCommand) {
    return this.fileRepo.findByOwner(command.userId, command.folderId ?? null);
  }
}
