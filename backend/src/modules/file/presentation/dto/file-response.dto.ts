import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the file',
  })
  id!: string;

  @ApiProperty({
    example: 'project-report.pdf',
    description: 'Display name shown to the user (can be renamed)',
  })
  name!: string;

  @ApiProperty({
    example: 'project-report-v1-final.pdf',
    description: 'Original filename from the upload',
  })
  originalName!: string;

  @ApiProperty({
    example: 'application/pdf',
    description: 'MIME type detected at upload time',
  })
  mimeType!: string;

  @ApiProperty({
    example: '.pdf',
    description: 'File extension including dot',
  })
  extension!: string;

  @ApiProperty({
    example: 1048576,
    description: 'File size in bytes',
  })
  size!: number;

  @ApiProperty({
    example: 'uploads/123e4567-e89b-12d3-a456-426614174000/file.pdf',
    description: 'Object key in MinIO storage bucket',
  })
  storagePath!: string;

  @ApiProperty({
    example: 'uploads/123e4567-e89b-12d3-a456-426614174000/thumbnail.jpg',
    description: 'Compressed thumbnail path in MinIO storage. Only populated for image files.',
    nullable: true,
  })
  thumbnailPath!: string | null;

  @ApiProperty({
    example: 'b08f4989-9a2c-4b67-a2f0-e593d6c70034',
    description: 'Parent folder ID. Null if at root level.',
    nullable: true,
  })
  folderId!: string | null;

  @ApiProperty({
    example: 'a9c0c8ef-f1b9-4c8d-8a62-ff93d6c70099',
    description: 'ID of the user who owns this file',
  })
  ownerId!: string;

  @ApiProperty({
    example: false,
    description: 'Whether this file is publicly accessible without authentication',
  })
  isPublic!: boolean;

  @ApiProperty({
    example: 1,
    description: 'Sort position within the parent folder',
  })
  position!: number;

  @ApiProperty({
    example: '2026-05-21T12:00:00Z',
    description: 'Timestamp when the file was uploaded',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-05-21T12:00:00Z',
    description: 'Timestamp of the most recent update to this file record',
  })
  updatedAt!: Date;
}
