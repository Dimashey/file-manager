import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { GetFolderCommand } from '../commands/get-folder.command';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';

@Injectable()
export class GetFolderUseCase {
  constructor(private repo: FolderRepository) {}

  /**
   * Retrieves a folder by its ID for a user.
   * Validates that the folder exists and is owned by the requesting user.
   *
   * @param cmd - The command containing user ID and folder ID.
   * @returns The retrieved folder entity.
   * @throws {FolderNotFoundError} If the folder does not exist or does not belong to the user.
   */
  async execute(cmd: GetFolderCommand) {
    const folder = await this.repo.findById(cmd.folderId);

    if (!folder || folder.ownerId !== cmd.userId) {
      throw new FolderNotFoundError();
    }

    return folder;
  }
}
