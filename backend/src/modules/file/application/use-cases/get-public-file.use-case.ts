import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { SharedFileNotFoundError } from '../../domain/errors/shared-file-not-found.error';
import { GetPublicFileCommand } from '../commands/get-public-file.command';

@Injectable()
export class GetPublicFileUseCase {
  constructor(private readonly fileRepo: FileRepository) {}

  /**
   * Retrieves metadata for a public/shared file.
   *
   * @param command - The command containing the file ID.
   * @returns The retrieved public file entity.
   * @throws {SharedFileNotFoundError} If the file is not found or is not public.
   */
  async execute(command: GetPublicFileCommand) {
    const file = await this.fileRepo.findById(command.fileId);
    if (!file || !file.isPublic) {
      throw new SharedFileNotFoundError();
    }
    return file;
  }
}
