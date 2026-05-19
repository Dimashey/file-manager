import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { FileEntity } from '../domain/file.entity';
import { FileController } from './file.controller';
import { MinioProvider } from '../infrastructure/minio.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    BullModule.registerQueue({ name: 'image-compression' }),
  ],
  controllers: [FileController],
  providers: [MinioProvider],
  exports: [TypeOrmModule, MinioProvider],
})
export class FileModule {}
