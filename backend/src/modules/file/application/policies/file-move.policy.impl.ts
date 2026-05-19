import { Injectable } from '@nestjs/common';
import { FolderRepository } from 'src/modules/folder/domain/repositories/folder.repository';
import { FileMovePolicy } from '../../domain/policies/file-file.policy';

@Injectable()
export class FileMovePolicyImpl implements FileMovePolicy {
  constructor(private readonly folderRepo: FolderRepository) {}

  async canMoveToFolder(folderId: string | null, userId: string): Promise<boolean> {
    if (!folderId) return true;

    const folder = await this.folderRepo.findById(folderId);

    return !!folder && folder.ownerId === userId;
  }
}
