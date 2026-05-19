import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ReorderDto } from './dto/reorder.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../auth/domain/user.entity';
import { CloneFolderCommand } from '../application/dto/clone-folder.command';
import { CreateFolderCommand } from '../application/dto/create-folder-command';
import { DeleteFolderCommand } from '../application/dto/delete-folder.command';
import { GetFolderCommand } from '../application/dto/get-folder.command';
import { ListFoldersCommand } from '../application/dto/list-folders.command';
import { ReorderFoldersCommand } from '../application/dto/reorder-folders.command';
import { UpdateFolderCommand } from '../application/dto/update-folder.command';
import { CloneFolderUseCase } from '../application/use-cases/clone-folder.use-case';
import { CreateFolderUseCase } from '../application/use-cases/create-folder.use-case';
import { DeleteFolderUseCase } from '../application/use-cases/delete-folder.use-case';
import { GetFolderUseCase } from '../application/use-cases/get-folder.use-case';
import { ListFoldersUseCase } from '../application/use-cases/list-folders.use-case';
import { ReorderFoldersUseCase } from '../application/use-cases/reorder-folders.use-case';
import { UpdateFolderUseCase } from '../application/use-cases/update-folder.use-case';

@Controller('folders')
export class FolderController {
  constructor(
    private readonly list: ListFoldersUseCase,
    private readonly create: CreateFolderUseCase,
    private readonly get: GetFolderUseCase,
    private readonly reorder: ReorderFoldersUseCase,
    private readonly update: UpdateFolderUseCase,
    private readonly remove: DeleteFolderUseCase,
    private readonly clone: CloneFolderUseCase,
  ) {}

  @Get()
  listFolders(@CurrentUser() user: User, @Query('parentId') parentId?: string) {
    return this.list.execute(new ListFoldersCommand(user.id, parentId));
  }

  @Post()
  createFolder(@CurrentUser() user: User, @Body() dto: CreateFolderDto) {
    return this.create.execute(new CreateFolderCommand(user.id, dto.name, dto.parentId));
  }

  @Get(':id')
  getFolder(@CurrentUser() user: User, @Param('id') id: string) {
    return this.get.execute(new GetFolderCommand(user.id, id));
  }

  @Patch('reorder')
  reorderFolders(@CurrentUser() user: User, @Body() dto: ReorderDto) {
    return this.reorder.execute(new ReorderFoldersCommand(user.id, dto.items));
  }

  @Patch(':id')
  updateFolder(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateFolderDto) {
    return this.update.execute(new UpdateFolderCommand(user.id, id, dto.name, dto.parentId));
  }

  @Delete(':id')
  deleteFolder(@CurrentUser() user: User, @Param('id') id: string) {
    return this.remove.execute(new DeleteFolderCommand(user.id, id));
  }

  @Post(':id/clone')
  cloneFolder(@CurrentUser() user: User, @Param('id') id: string) {
    return this.clone.execute(new CloneFolderCommand(user.id, id));
  }
}
