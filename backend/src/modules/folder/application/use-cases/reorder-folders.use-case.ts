import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { ReorderFoldersCommand } from '../commands/reorder-folders.command';

@Injectable()
export class ReorderFoldersUseCase {
  constructor(private repo: FolderRepository) {}

  /**
   * Updates the sort positions of multiple folders owned by a user.
   *
   * @param cmd - The reordering command containing items and user ID.
   */
  async execute(cmd: ReorderFoldersCommand) {
    await this.repo.updatePositions(cmd.items, cmd.userId);
  }
}
