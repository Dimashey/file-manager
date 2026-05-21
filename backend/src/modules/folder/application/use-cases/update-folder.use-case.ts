import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { UpdateFolderCommand } from '../commands/update-folder.command';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';
import { InvalidParentFolderError } from '../../domain/errors/invalid-parent-folder.error';

@Injectable()
export class UpdateFolderUseCase {
  constructor(private repo: FolderRepository) {}

  /**
   * Updates folder properties (rename, move parent, or public status) for a user.
   *
   * @param cmd - The update command details.
   * @returns The updated folder entity.
   * @throws {FolderNotFoundError} If the folder is not found or is not owned by the user.
   * @throws {InvalidParentFolderError} If target parent folder is invalid or owned by another user.
   */
  async execute(cmd: UpdateFolderCommand) {
    const folder = await this.repo.findById(cmd.folderId);

    if (!folder || folder.ownerId !== cmd.userId) {
      throw new FolderNotFoundError();
    }

    if (cmd.name) folder.rename(cmd.name);
    if (cmd.isPublic !== undefined) folder.isPublic = cmd.isPublic;
    if (cmd.parentId !== undefined) {
      if (cmd.parentId) {
        const parent = await this.repo.findById(cmd.parentId);
        if (!parent || parent.ownerId !== cmd.userId) {
          throw new InvalidParentFolderError();
        }
      }
      folder.moveToParent(cmd.parentId);
    }

    return this.repo.save(folder);
  }
}
