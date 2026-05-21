import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { ReorderFilesCommand } from '../commands/reorder.command';

@Injectable()
export class ReorderFilesUseCase {
  constructor(private readonly fileRepo: FileRepository) {}

  async execute(dto: ReorderFilesCommand) {
    await this.fileRepo.updatePositions(dto.items, dto.userId);
  }
}
