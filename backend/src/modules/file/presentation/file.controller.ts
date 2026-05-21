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
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileReorderDto } from './dto/reorder.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../auth/domain/user.entity';
import { ListFilesUseCase } from '../application/use-cases/list-files.use-case';
import { ListFilesCommand } from '../application/commands/list-files.command';
import { GetFileUseCase } from '../application/use-cases/get-file.use-case';
import { GetFileCommand } from '../application/commands/get-file.command';
import { ReorderFilesUseCase } from '../application/use-cases/reorder.use-case';
import { ReorderFilesCommand } from '../application/commands/reorder.command';
import { UpdateFileUseCase } from '../application/use-cases/update-file.use-case';
import { UpdateFileCommand } from '../application/commands/update-file.command';
import { UploadFileCommand } from '../application/commands/upload-file.command';
import { UploadFileUseCase } from '../application/use-cases/upload-file.use-case';
import { DownloadFileUseCase } from '../application/use-cases/download-file.use-case';
import { DownloadFileCommand } from '../application/commands/download-file.command';
import { DeleteFileUseCase } from '../application/use-cases/delete-file.use-case';
import { DeleteFileCommand } from '../application/commands/delete-file.command';
import { CloneFileUseCase } from '../application/use-cases/clone-file.use-case';
import { CloneFileCommand } from '../application/commands/clone-file.command';
import { SearchFilesUseCase } from '../application/use-cases/search-files.use-case';
import { SearchFilesCommand } from '../application/commands/search-files.command';
import { GetPublicFileUseCase } from '../application/use-cases/get-public-file.use-case';
import { GetPublicFileCommand } from '../application/commands/get-public-file.command';
import { DownloadPublicFileUseCase } from '../application/use-cases/download-public-file.use-case';
import { DownloadPublicFileCommand } from '../application/commands/download-public-file.command';
import { Public } from '../../../shared/decorators/public.decorator';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

@ApiTags('files')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
    private readonly searchFilesUseCase: SearchFilesUseCase,
    private readonly getPublicFileUseCase: GetPublicFileUseCase,
    private readonly downloadPublicFileUseCase: DownloadPublicFileUseCase,
  ) {}

  @Public()
  @Get('public/:id')
  @ApiOperation({ summary: 'Get public file metadata' })
  async getPublicFile(@Param('id', ParseUUIDPipe) id: string): Promise<FileResponseDto> {
    return this.getPublicFileUseCase.execute(new GetPublicFileCommand(id));
  }

  @Public()
  @Get('public/:id/download')
  @ApiOperation({ summary: 'Download public file content' })
  async downloadPublicFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { stream, file } = await this.downloadPublicFileUseCase.execute(
      new DownloadPublicFileCommand(id),
    );
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });
    stream.pipe(res);
  }

  @Get()
  @ApiOperation({
    summary: 'List files',
    description:
      'Retrieve a list of files owned by the current user, optionally filtered by folder',
  })
  @ApiQuery({
    name: 'folderId',
    required: false,
    type: String,
    description: 'Filter files by parent folder ID (null or omit for root)',
  })
  @ApiOkResponse({
    type: [FileResponseDto],
    description: 'List of files retrieved successfully',
  })
  async list(
    @CurrentUser() user: User,
    @Query('folderId') folderId?: string,
  ): Promise<FileResponseDto[]> {
    return this.listFilesUseCase.execute(new ListFilesCommand(user.id, folderId));
  }

  /** Handles multipart file upload: validates size, stores in MinIO, enqueues compression for images */
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload file',
    description: 'Uploads a file to storage and creates a new file metadata record',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'The file payload' },
        folderId: { type: 'string', description: 'Target folder ID (omit for root)' },
      },
    },
  })
  @ApiCreatedResponse({
    type: FileResponseDto,
    description: 'File uploaded successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid file upload parameters or file too large',
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId?: string,
  ): Promise<FileResponseDto> {
    return this.uploadFileUseCase.execute(new UploadFileCommand(user.id, file, folderId));
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search files',
    description: 'Search files by their display names for the current user',
  })
  @ApiQuery({
    name: 'name',
    required: true,
    type: String,
    description: 'Term to match in file names',
  })
  @ApiOkResponse({
    type: [FileResponseDto],
    description: 'Matching files returned successfully',
  })
  async search(@CurrentUser() user: User, @Query('name') name: string): Promise<FileResponseDto[]> {
    return this.searchFilesUseCase.execute(new SearchFilesCommand(user.id, name ?? ''));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get file details',
    description: 'Retrieve detailed metadata of a specific file',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    format: 'uuid',
    description: 'The unique identifier of the file',
  })
  @ApiOkResponse({
    type: FileResponseDto,
    description: 'File details retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'File not found or user does not have access',
  })
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FileResponseDto> {
    return this.getFileUseCase.execute(new GetFileCommand(user.id, id));
  }

  /** Streams file content from MinIO to the HTTP response */
  @Get(':id/download')
  @ApiOperation({
    summary: 'Download file content',
    description: 'Streams the actual binary file content from storage',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    format: 'uuid',
    description: 'The unique identifier of the file to download',
  })
  @ApiOkResponse({
    description: 'File stream retrieved successfully',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiNotFoundResponse({
    description: 'File not found or user does not have access',
  })
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
  @ApiOperation({
    summary: 'Reorder files',
    description: 'Updates sorting positions for a set of files in a folder',
  })
  @ApiBody({
    type: FileReorderDto,
    description: 'Array of file IDs and their new position index values',
  })
  @ApiOkResponse({
    description: 'Files successfully reordered',
  })
  @ApiBadRequestResponse({
    description: 'Invalid payload format or IDs do not belong to the user',
  })
  async reorder(@CurrentUser() user: User, @Body() dto: FileReorderDto): Promise<void> {
    await this.reorderFilesUseCase.execute(new ReorderFilesCommand(user.id, dto.items));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update file details',
    description: 'Updates file name, parent folder relationship, or public status',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    format: 'uuid',
    description: 'The unique identifier of the file',
  })
  @ApiBody({
    type: UpdateFileDto,
    description: 'New property values for the file metadata',
  })
  @ApiOkResponse({
    type: FileResponseDto,
    description: 'File metadata successfully updated',
  })
  @ApiNotFoundResponse({
    description: 'File not found or user does not have access',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input parameters',
  })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFileDto,
  ): Promise<FileResponseDto> {
    return this.updateFileUseCase.execute(
      new UpdateFileCommand(user.id, id, dto.name, dto.folderId, dto.isPublic),
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete file',
    description: 'Permanently deletes a file from storage and removes its metadata record',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    format: 'uuid',
    description: 'The unique identifier of the file to delete',
  })
  @ApiOkResponse({
    description: 'File successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'File not found or user does not have access',
  })
  async remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteFileUseCase.execute(new DeleteFileCommand(user.id, id));
  }

  /** Copies a file in MinIO and creates a new DB record with "(copy)" suffix */
  @Post(':id/clone')
  @ApiOperation({
    summary: 'Clone file',
    description:
      'Duplicates the file in storage and creates a new metadata entry with the "(copy)" suffix',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    format: 'uuid',
    description: 'The unique identifier of the file to clone',
  })
  @ApiCreatedResponse({
    type: FileResponseDto,
    description: 'File successfully cloned',
  })
  @ApiNotFoundResponse({
    description: 'Original file not found or user does not have access',
  })
  async clone(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FileResponseDto> {
    return this.cloneFileUseCase.execute(new CloneFileCommand(user.id, id));
  }
}
