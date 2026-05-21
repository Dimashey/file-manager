import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { FileRepository } from '../../../file/domain/repositories/file.repository';
import { SharedFolderNotFoundError } from '../../domain/errors/shared-folder-not-found.error';
import { GetPublicFolderCommand } from '../commands/get-public-folder.command';

@Injectable()
export class GetPublicFolderUseCase {
  constructor(
    private readonly folderRepo: FolderRepository,
    private readonly fileRepo: FileRepository,
  ) {}

  /**
   * Retrieves a public folder along with all its subfolders and files.
   * Validates that the folder exists and has public access enabled.
   *
   * @param command - The command containing the shared folder ID.
   * @returns An object with the folder, its subfolders, and its files.
   * @throws {SharedFolderNotFoundError} If the folder is not found or is not public.
   */
  async execute(command: GetPublicFolderCommand) {
    const folder = await this.folderRepo.findById(command.folderId);
    if (!folder || !folder.isPublic) {
      throw new SharedFolderNotFoundError();
    }

    const subfolders = await this.folderRepo.findSubfolders(command.folderId);
    const files = await this.fileRepo.findByFolder(command.folderId);

    return { folder, subfolders, files };
  }
}
