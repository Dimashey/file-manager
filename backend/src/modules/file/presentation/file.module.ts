import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { FileController } from './file.controller';
import { FileRepository } from '../domain/repositories/file.repository';
import { TypeOrmFileRepository } from '../infrastructure/persistance/typeorm/repositories/files.respository.impl';
import { FileOrm } from '../infrastructure/persistance/typeorm/entities/file-orm.entity';
import { ListFilesUseCase } from '../application/use-cases/list-files.use-case';
import { GetFileUseCase } from '../application/use-cases/get-file.use-case';
import { ReorderFilesUseCase } from '../application/use-cases/reorder.use-case';
import { UpdateFileUseCase } from '../application/use-cases/update-file.use-case';
import { UploadFileUseCase } from '../application/use-cases/upload-file.use-case';
import { DownloadFileUseCase } from '../application/use-cases/download-file.use-case';
import { DeleteFileUseCase } from '../application/use-cases/delete-file.use-case';
import { CloneFileUseCase } from '../application/use-cases/clone-file.use-case';
import { SearchFilesUseCase } from '../application/use-cases/search-files.use-case';
import { FileStorageService } from '../application/interfaces/file-storage.service';
import { MinioStorageService } from '../infrastructure/storage/minio/minio-storage.service';
import { ImageProcessingQueueService } from '../application/interfaces/image-processing-queue.service';
import { BullImageProcessingQueueService } from '../infrastructure/queues/bull/image-processing.queue';
import { SharpImageService } from '../infrastructure/image/share-image.service';
import { ImageCompressionProcessor } from '../infrastructure/queues/bull/image-compression.processor';

import { FolderModule } from '../../folder/presentation/folder.module';
import { FileMovePolicy } from '../domain/policies/file-file.policy';
import { FileMovePolicyImpl } from '../application/policies/file-move.policy.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileOrm]),
    BullModule.registerQueue({ name: 'image-compression' }),
    FolderModule,
  ],
  controllers: [FileController],
  providers: [
    {
      provide: FileRepository,
      useClass: TypeOrmFileRepository,
    },
    {
      provide: FileMovePolicy,
      useClass: FileMovePolicyImpl,
    },
    {
      provide: FileStorageService,
      useClass: MinioStorageService,
    },
    {
      provide: ImageProcessingQueueService,
      useClass: BullImageProcessingQueueService,
    },
    SharpImageService,
    ImageCompressionProcessor,
    ListFilesUseCase,
    GetFileUseCase,
    ReorderFilesUseCase,
    UpdateFileUseCase,
    UploadFileUseCase,
    DownloadFileUseCase,
    DeleteFileUseCase,
    CloneFileUseCase,
    SearchFilesUseCase,
  ],
  exports: [TypeOrmModule, FileStorageService],
})
export class FileModule {}
