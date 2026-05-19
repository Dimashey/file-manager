import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from '../domain/folder.entity';
import { FolderController } from './folder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Folder])],
  controllers: [FolderController],
  exports: [TypeOrmModule],
})
export class FolderModule {}
