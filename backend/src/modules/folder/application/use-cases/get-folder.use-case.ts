import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { GetFolderCommand } from '../commands/get-folder.command';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';

@Injectable()
export class GetFolderUseCase {
  constructor(private repo: FolderRepository) {}

  async execute(cmd: GetFolderCommand) {
    const folder = await this.repo.findById(cmd.folderId);

    if (!folder || folder.ownerId !== cmd.userId) {
      throw new FolderNotFoundError();
    }

    return folder;
  }
}
