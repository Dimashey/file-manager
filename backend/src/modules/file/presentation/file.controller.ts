import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { FileEntity } from '../domain/file.entity';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileReorderDto } from './dto/reorder.dto';
import { MinioProvider } from '../infrastructure/minio.provider';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../auth/domain/user.entity';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly minioProvider: MinioProvider,
    @InjectQueue('image-compression')
    private readonly compressionQueue: Queue,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query('folderId') folderId?: string,
  ): Promise<FileEntity[]> {
    return this.fileRepository.find({
      where: {
        ownerId: user.id,
        folderId: folderId ?? IsNull(),
      },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  /** Handles multipart file upload: validates size, stores in MinIO, enqueues compression for images */
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folderId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId?: string,
  ): Promise<FileEntity> {
    const ext = extname(file.originalname);
    const storageKey = `${user.id}/${uuidv4()}${ext}`;

    await this.minioProvider.upload(storageKey, file.buffer, file.mimetype);

    const fileEntity = this.fileRepository.create({
      name: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      extension: ext,
      size: file.size,
      storagePath: storageKey,
      thumbnailPath: null,
      folderId: folderId ?? null,
      ownerId: user.id,
    });
    const saved = await this.fileRepository.save(fileEntity);

    if (file.mimetype.startsWith('image/')) {
      await this.compressionQueue.add('compress', {
        fileId: saved.id,
        storageKey,
        mimeType: file.mimetype,
      });
    }

    return saved;
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  /** Streams file content from MinIO to the HTTP response */
  @Get(':id/download')
  async download(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const stream = await this.minioProvider.download(file.storagePath);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });
    stream.pipe(res);
  }

  @Patch('reorder')
  async reorder(@CurrentUser() user: User, @Body() dto: FileReorderDto): Promise<void> {
    for (const item of dto.items) {
      await this.fileRepository.update(
        { id: item.id, ownerId: user.id },
        { position: item.position },
      );
    }
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFileDto,
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    Object.assign(file, dto);
    return this.fileRepository.save(file);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    await this.minioProvider.delete(file.storagePath);
    if (file.thumbnailPath) {
      await this.minioProvider.delete(file.thumbnailPath);
    }
    await this.fileRepository.remove(file);
  }

  /** Copies a file in MinIO and creates a new DB record with "(copy)" suffix */
  @Post(':id/clone')
  async clone(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const newKey = `${user.id}/${uuidv4()}${file.extension}`;
    await this.minioProvider.copy(file.storagePath, newKey);

    const clone = this.fileRepository.create({
      name: `${file.name} (copy)`,
      originalName: file.originalName,
      mimeType: file.mimeType,
      extension: file.extension,
      size: file.size,
      storagePath: newKey,
      thumbnailPath: null,
      folderId: file.folderId,
      ownerId: user.id,
      isPublic: file.isPublic,
      position: file.position,
    });
    return this.fileRepository.save(clone);
  }
}
