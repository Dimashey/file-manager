import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { Folder } from '../../domain/folder.entity';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { CloneFolderCommand } from '../commands/clone-folder.command';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';

@Injectable()
export class CloneFolderUseCase {
  constructor(private repo: FolderRepository) {}

  /**
   * Clones a folder and all of its contents (subfolders) recursively for a user.
   *
   * @param cmd The command containing the user ID and the folder ID to clone.
   * @returns The newly cloned root-level folder.
   * @throws {FolderNotFoundError} If the folder does not exist or does not belong to the user.
   */
  async execute(cmd: CloneFolderCommand) {
    const source = await this.repo.findById(cmd.folderId);

    if (!source || source.ownerId !== cmd.userId) {
      throw new FolderNotFoundError();
    }

    return this.cloneRecursive(source, source.parentId, cmd.userId);
  }

  private async cloneRecursive(
    source: Folder,
    parentId: string | null,
    userId: string,
  ): Promise<Folder> {
    const clone = new Folder(
      crypto.randomUUID(),
      parentId === source.parentId ? `${source.name} (copy)` : source.name,
      parentId,
      userId,
      source.isPublic,
      source.position,
      new Date(),
      new Date(),
    );

    const saved = await this.repo.save(clone);

    const children = await this.repo.findChildren(source.id, userId);

    for (const child of children) {
      await this.cloneRecursive(child, saved.id, userId);
    }

    return saved;
  }
}
