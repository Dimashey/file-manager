import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFileDto {
  @ApiPropertyOptional({
    example: 'new-document-name.pdf',
    description: 'New display name for the file',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'b08f4989-9a2c-4b67-a2f0-e593d6c70034',
    description: 'The parent folder ID. Pass null to move the file to the root level.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  folderId?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the file is accessible publicly without authentication',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
