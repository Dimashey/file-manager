import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { SearchFilesCommand } from '../commands/search-files.command';

@Injectable()
export class SearchFilesUseCase {
  constructor(private readonly fileRepo: FileRepository) {}

  /**
   * Searches files owned by a user by their display name.
   *
   * @param command - The search query containing user ID and name query.
   * @returns An array of matching file entities.
   */
  execute(command: SearchFilesCommand) {
    return this.fileRepo.search(command.userId, command.name);
  }
}
