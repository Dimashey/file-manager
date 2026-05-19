import { IsArray, ValidateNested, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FileReorderItemDto {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty()
  @IsInt()
  position!: number;
}

export class FileReorderDto {
  @ApiProperty({ type: [FileReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileReorderItemDto)
  items!: FileReorderItemDto[];
}
