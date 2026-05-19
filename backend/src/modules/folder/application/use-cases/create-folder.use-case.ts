import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { Folder } from '../../domain/folder.entity';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { CreateFolderCommand } from '../dto/create-folder-command';
import { InvalidParentFolderError } from '../../domain/errors/invalid-parent-folder.error';

@Injectable()
export class CreateFolderUseCase {
  constructor(private repo: FolderRepository) {}

  async execute(cmd: CreateFolderCommand) {
    if (cmd.parentId) {
      const parent = await this.repo.findById(cmd.parentId);

      if (!parent || parent.ownerId !== cmd.userId) {
        throw new InvalidParentFolderError();
      }
    }

    const folder = new Folder(
      crypto.randomUUID(),
      cmd.name,
      cmd.parentId ?? null,
      cmd.userId,
      false,
      0,
      new Date(),
      new Date(),
    );

    return this.repo.save(folder);
  }
}
