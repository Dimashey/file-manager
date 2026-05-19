import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  updatedAt!: Date;
}
