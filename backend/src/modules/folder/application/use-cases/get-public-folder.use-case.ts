import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { FileRepository } from '../../../file/domain/repositories/file.repository';
import { SharedFolderNotFoundError } from '../../domain/errors/shared-folder-not-found.error';
import { GetPublicFolderCommand } from '../dto/get-public-folder.command';

@Injectable()
export class GetPublicFolderUseCase {
  constructor(
    private readonly folderRepo: FolderRepository,
    private readonly fileRepo: FileRepository,
  ) {}

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
