import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';

@Injectable()
export class GetFileUseCase {
  constructor(private readonly fileRepo: FileRepository) {}

  /**
   * Retrieves metadata for a file owned by a user.
   * Validates that the file exists and belongs to the user.
   *
   * @param input - An object containing user ID and file ID.
   * @returns The retrieved file entity.
   * @throws {FileNotFoundError} If the file does not exist or belongs to another user.
   */
  async execute(input: { userId: string; fileId: string }) {
    const file = await this.fileRepo.findById(input.fileId);

    const isValid = !file || file.ownerId !== input.userId;

    if (isValid) throw new FileNotFoundError();

    return file;
  }
}
