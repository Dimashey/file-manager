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
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Folder } from '../domain/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ReorderDto } from './dto/reorder.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../auth/domain/user.entity';

@ApiTags('folders')
@ApiBearerAuth()
@Controller('folders')
export class FolderController {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  @Get()
  async list(@CurrentUser() user: User, @Query('parentId') parentId?: string): Promise<Folder[]> {
    return this.folderRepository.find({
      where: {
        ownerId: user.id,
        parentId: parentId ?? IsNull(),
      },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateFolderDto): Promise<Folder> {
    const folder = this.folderRepository.create({
      name: dto.name,
      parentId: dto.parentId ?? null,
      ownerId: user.id,
    });
    return this.folderRepository.save(folder);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id, ownerId: user.id },
      relations: ['children'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return folder;
  }

  /** Updates the position field for a list of folders to enable reordering */
  @Patch('reorder')
  async reorder(@CurrentUser() user: User, @Body() dto: ReorderDto): Promise<void> {
    for (const item of dto.items) {
      await this.folderRepository.update(
        { id: item.id, ownerId: user.id },
        { position: item.position },
      );
    }
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFolderDto,
  ): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    Object.assign(folder, dto);
    return this.folderRepository.save(folder);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const folder = await this.folderRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    await this.folderRepository.remove(folder);
  }

  /** Deep-clones a folder and all its subfolders, preserving hierarchy */
  @Post(':id/clone')
  async clone(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return this.deepCloneFolder(folder, folder.parentId, user.id);
  }

  /**
   * Recursively clones a folder and all its children.
   * Each cloned folder gets a new UUID and "(copy)" suffix on the top-level clone.
   */
  private async deepCloneFolder(
    source: Folder,
    parentId: string | null,
    ownerId: string,
  ): Promise<Folder> {
    const isTopLevel = parentId === source.parentId;
    const clone = this.folderRepository.create({
      name: isTopLevel ? `${source.name} (copy)` : source.name,
      parentId,
      ownerId,
      isPublic: source.isPublic,
      position: source.position,
    });
    const saved = await this.folderRepository.save(clone);

    const children = await this.folderRepository.find({
      where: { parentId: source.id, ownerId },
    });
    for (const child of children) {
      await this.deepCloneFolder(child, saved.id, ownerId);
    }

    return saved;
  }
}
