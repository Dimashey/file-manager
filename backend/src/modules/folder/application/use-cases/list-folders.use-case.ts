import { Injectable } from '@nestjs/common';
import { ListFoldersCommand } from '../commands/list-folders.command';
import { FolderRepository } from '../../domain/repositories/folder.repository';

@Injectable()
export class ListFoldersUseCase {
  constructor(private repo: FolderRepository) {}

  execute(cmd: ListFoldersCommand) {
    return this.repo.findByOwner(cmd.userId, cmd.parentId ?? null);
  }
}
