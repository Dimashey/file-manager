import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { ReorderFoldersCommand } from '../dto/reorder-folders.command';

@Injectable()
export class ReorderFoldersUseCase {
  constructor(private repo: FolderRepository) {}

  async execute(cmd: ReorderFoldersCommand) {
    await this.repo.updatePositions(cmd.items, cmd.userId);
  }
}
