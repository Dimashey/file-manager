import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FolderOrm } from '../infrastructure/typeorm/etities/folder-orm.entity';
import { FolderController } from './folder.controller';
import { FolderRepository } from '../domain/repositories/folder.repository';
import { TypeOrmFolderRepository } from '../infrastructure/typeorm/repositories/folder.repository.impl';
import { ListFoldersUseCase } from '../application/use-cases/list-folders.use-case';
import { CreateFolderUseCase } from '../application/use-cases/create-folder.use-case';
import { GetFolderUseCase } from '../application/use-cases/get-folder.use-case';
import { ReorderFoldersUseCase } from '../application/use-cases/reorder-folders.use-case';
import { UpdateFolderUseCase } from '../application/use-cases/update-folder.use-case';
import { DeleteFolderUseCase } from '../application/use-cases/delete-folder.use-case';
import { CloneFolderUseCase } from '../application/use-cases/clone-folder.use-case';
import { FileMovePolicy } from 'src/modules/file/domain/policies/file-file.policy';
import { FileMovePolicyImpl } from 'src/modules/file/application/policies/file-move.policy.impl';

@Module({
  imports: [TypeOrmModule.forFeature([FolderOrm])],
  controllers: [FolderController],
  providers: [
    { provide: FolderRepository, useClass: TypeOrmFolderRepository },
    { provide: FileMovePolicy, useClass: FileMovePolicyImpl },

    ListFoldersUseCase,
    CreateFolderUseCase,
    GetFolderUseCase,
    ReorderFoldersUseCase,
    UpdateFolderUseCase,
    DeleteFolderUseCase,
    CloneFolderUseCase,
  ],
  exports: [TypeOrmModule, FolderRepository],
})
export class FolderModule {}
