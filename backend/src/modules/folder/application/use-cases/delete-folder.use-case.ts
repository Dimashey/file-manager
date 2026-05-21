import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { DeleteFolderCommand } from '../commands/delete-folder.command';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';

@Injectable()
export class DeleteFolderUseCase {
  constructor(private repo: FolderRepository) {}

  /**
   * Deletes a folder by ID for a user.
   * Ensures the folder exists and is owned by the user before deletion.
   *
   * @param cmd - The command containing user ID and folder ID to delete.
   * @throws {FolderNotFoundError} If the folder does not exist or does not belong to the user.
   */
  async execute(cmd: DeleteFolderCommand) {
    const folder = await this.repo.findById(cmd.folderId);

    if (!folder || folder.ownerId !== cmd.userId) {
      throw new FolderNotFoundError();
    }

    await this.repo.delete(folder.id);
  }
}
