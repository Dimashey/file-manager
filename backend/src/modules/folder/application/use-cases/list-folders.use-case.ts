import { Injectable } from '@nestjs/common';
import { ListFoldersCommand } from '../commands/list-folders.command';
import { FolderRepository } from '../../domain/repositories/folder.repository';

@Injectable()
export class ListFoldersUseCase {
  constructor(private repo: FolderRepository) {}

  /**
   * Lists all folders owned by a user at a specific parent directory level (or root).
   *
   * @param cmd - The listing query containing user ID and parent folder ID.
   * @returns An array of matching folder entities.
   */
  execute(cmd: ListFoldersCommand) {
    return this.repo.findByOwner(cmd.userId, cmd.parentId ?? null);
  }
}
