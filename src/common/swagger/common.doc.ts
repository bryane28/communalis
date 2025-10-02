import { ApiProperty } from '@nestjs/swagger';

export class MetaDoc {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class MessageResponse {
  @ApiProperty({ example: 'Opération réussie' })
  message!: string;
}

export class AvatarResponse {
  @ApiProperty({ example: 'Avatar mis à jour' })
  message!: string;

  @ApiProperty({ example: '/uploads/avatars/123.png' })
  avatarUrl!: string;
}
