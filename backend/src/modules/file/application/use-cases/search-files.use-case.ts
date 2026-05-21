import { Injectable } from '@nestjs/common';
import { FileRepository } from '../../domain/repositories/file.repository';
import { SearchFilesCommand } from '../commands/search-files.command';

@Injectable()
export class SearchFilesUseCase {
  constructor(private readonly fileRepo: FileRepository) {}

  execute(command: SearchFilesCommand) {
    return this.fileRepo.search(command.userId, command.name);
  }
}
