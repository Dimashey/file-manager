import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { UpdateFolderCommand } from '../commands/update-folder.command';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';
import { InvalidParentFolderError } from '../../domain/errors/invalid-parent-folder.error';

@Injectable()
export class UpdateFolderUseCase {
  constructor(private repo: FolderRepository) {}

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
