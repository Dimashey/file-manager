import { Injectable, ForbiddenException } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';
import { UpdateFileCommand } from '../dto/update-file.command';
import { File } from '../../domain/file.entity';
import { FileMovePolicy } from '../../domain/policies/file-file.policy';

@Injectable()
export class UpdateFileUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly fileMovePolicy: FileMovePolicy,
  ) {}

  async execute(cmd: UpdateFileCommand): Promise<File> {
    const file = await this.fileRepo.findById(cmd.fileId);
    if (!file || file.ownerId !== cmd.userId) throw new FileNotFoundError();

    if (cmd.folderId) {
      const folder = await this.fileMovePolicy.canMoveToFolder(cmd.folderId);

      if (!folder) throw new ForbiddenException('Invalid folder');
    }

    if (cmd.name !== undefined) file.name = cmd.name;
    if (cmd.folderId !== undefined) file.folderId = cmd.folderId;
    if (cmd.isPublic !== undefined) file.isPublic = cmd.isPublic;

    return this.fileRepo.save(file);
  }
}
