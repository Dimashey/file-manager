import { IsArray, ValidateNested, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FileReorderItemDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the file to be reordered',
  })
  @IsUUID()
  id!: string;

  @ApiProperty({
    example: 0,
    description: 'The new 0-indexed sorting position of the file within the parent folder',
  })
  @IsInt()
  position!: number;
}

export class FileReorderDto {
  @ApiProperty({
    type: [FileReorderItemDto],
    description: 'An array of files and their new positions to update in bulk',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileReorderItemDto)
  items!: FileReorderItemDto[];
}
