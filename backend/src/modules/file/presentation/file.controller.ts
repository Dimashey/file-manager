import {
  Body,
  Controller,
  Delete,
  Get,
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
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileReorderDto } from './dto/reorder.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../auth/domain/user.entity';
import { ListFilesUseCase } from '../application/use-cases/list-files.use-case';
import { ListFilesCommand } from '../application/dto/list-files.command';
import { GetFileUseCase } from '../application/use-cases/get-file.use-case';
import { GetFileCommand } from '../application/dto/get-file.command';
import { ReorderFilesUseCase } from '../application/use-cases/reorder.use-case';
import { ReorderFilesCommand } from '../application/dto/reorder.command';
import { UpdateFileUseCase } from '../application/use-cases/update-file.use-case';
import { UpdateFileCommand } from '../application/dto/update-file.command';
import { UploadFileCommand } from '../application/dto/upload-file.command';
import { UploadFileUseCase } from '../application/use-cases/upload-file.use-case';
import { DownloadFileUseCase } from '../application/use-cases/download-file.use-case';
import { DownloadFileCommand } from '../application/dto/download-file.command';
import { DeleteFileUseCase } from '../application/use-cases/delete-file.use-case';
import { DeleteFileCommand } from '../application/dto/delete-file.command';
import { CloneFileUseCase } from '../application/use-cases/clone-file.use-case';
import { CloneFileCommand } from '../application/dto/clone-file.command';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(
    private readonly listFilesUseCase: ListFilesUseCase,
    private readonly getFileUseCase: GetFileUseCase,
    private readonly reorderFilesUseCase: ReorderFilesUseCase,
    private readonly updateFileUseCase: UpdateFileUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly downloadFileUseCase: DownloadFileUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly cloneFileUseCase: CloneFileUseCase,
  ) {}

  @Get()
  async list(@CurrentUser() user: User, @Query('folderId') folderId?: string) {
    return this.listFilesUseCase.execute(new ListFilesCommand(user.id, folderId));
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
  ) {
    return this.uploadFileUseCase.execute(new UploadFileCommand(user.id, file, folderId));
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.getFileUseCase.execute(new GetFileCommand(user.id, id));
  }

  /** Streams file content from MinIO to the HTTP response */
  @Get(':id/download')
  async download(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { stream, file } = await this.downloadFileUseCase.execute(
      new DownloadFileCommand(user.id, id),
    );
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });

    stream.pipe(res);
  }

  @Patch('reorder')
  async reorder(@CurrentUser() user: User, @Body() dto: FileReorderDto): Promise<void> {
    await this.reorderFilesUseCase.execute(new ReorderFilesCommand(user.id, dto.items));
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFileDto,
  ) {
    return this.updateFileUseCase.execute(
      new UpdateFileCommand(user.id, id, dto.name, dto.folderId, dto.isPublic),
    );
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteFileUseCase.execute(new DeleteFileCommand(user.id, id));
  }

  /** Copies a file in MinIO and creates a new DB record with "(copy)" suffix */
  @Post(':id/clone')
  async clone(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.cloneFileUseCase.execute(new CloneFileCommand(user.id, id));
  }
}
