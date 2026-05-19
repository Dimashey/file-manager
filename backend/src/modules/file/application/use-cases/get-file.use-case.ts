import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';

@Injectable()
export class GetFileUseCase {
  constructor(private readonly fileRepo: FileRepository) {}

  async execute(input: { userId: string; fileId: string }) {
    const file = await this.fileRepo.findById(input.fileId);

    const isValid = !file || file.ownerId !== input.userId;

    if (isValid) throw new FileNotFoundError();

    return file;
  }
}
