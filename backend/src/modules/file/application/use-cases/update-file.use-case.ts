import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';
import { UpdateFileCommand } from '../commands/update-file.command';
import { File } from '../../domain/file.entity';
import { FileMovePolicy } from '../../domain/policies/file-file.policy';
import { CanNotMoveFileToFolderError } from '../../domain/errors/can-not-move-file.error';

@Injectable()
export class UpdateFileUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly fileMovePolicy: FileMovePolicy,
  ) {}

  /**
   * Renames, moves, or changes public status of a file.
   * Validates folder moves against FileMovePolicy.
   *
   * @param cmd - The update command details.
   * @returns The updated file entity.
   * @throws {FileNotFoundError} If the file does not exist or is not owned by the user.
   * @throws {CanNotMoveFileToFolderError} If target folder is invalid or belongs to another user.
   */
  async execute(cmd: UpdateFileCommand): Promise<File> {
    const file = await this.fileRepo.findById(cmd.fileId);
    if (!file || file.ownerId !== cmd.userId) throw new FileNotFoundError();

    if (cmd.folderId) {
      const folder = await this.fileMovePolicy.canMoveToFolder(cmd.folderId, cmd.userId);

      if (!folder) throw new CanNotMoveFileToFolderError();
    }

    if (cmd.name !== undefined) file.name = cmd.name;
    if (cmd.folderId !== undefined) file.folderId = cmd.folderId;
    if (cmd.isPublic !== undefined) file.isPublic = cmd.isPublic;

    return this.fileRepo.save(file);
  }
}
