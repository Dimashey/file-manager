import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { SearchFoldersCommand } from '../commands/search-folders.command';

@Injectable()
export class SearchFoldersUseCase {
  constructor(private readonly repo: FolderRepository) {}

  /**
   * Searches folders owned by a user by a name query.
   *
   * @param command - The search query containing user ID and name query.
   * @returns An array of matching folder entities.
   */
  execute(command: SearchFoldersCommand) {
    return this.repo.search(command.userId, command.name);
  }
}
