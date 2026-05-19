import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { DeleteFolderCommand } from '../dto/delete-folder.command';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';

@Injectable()
export class DeleteFolderUseCase {
  constructor(private repo: FolderRepository) {}

  async execute(cmd: DeleteFolderCommand) {
    const folder = await this.repo.findById(cmd.folderId);

    if (!folder || folder.ownerId !== cmd.userId) {
      throw new FolderNotFoundError();
    }

    await this.repo.delete(folder.id);
  }
}
