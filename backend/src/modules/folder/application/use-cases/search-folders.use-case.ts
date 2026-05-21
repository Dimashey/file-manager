import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { SearchFoldersCommand } from '../commands/search-folders.command';

@Injectable()
export class SearchFoldersUseCase {
  constructor(private readonly repo: FolderRepository) {}

  execute(command: SearchFoldersCommand) {
    return this.repo.search(command.userId, command.name);
  }
}
