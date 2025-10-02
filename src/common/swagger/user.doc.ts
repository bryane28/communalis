import { ApiProperty } from '@nestjs/swagger';

export class UserDoc {
  @ApiProperty({ example: '66f3b1ab12cd34e56789f012' })
  _id!: string;

  @ApiProperty({ example: 'Dupont' })
  nom!: string;

  @ApiProperty({ example: 'Jean' })
  prenom!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ enum: ['admin', 'formateur', 'parent'], example: 'formateur' })
  role!: string;

  @ApiProperty({ required: false, nullable: true, example: '/uploads/avatars/123.png' })
  avatarUrl?: string | null;

  @ApiProperty({ required: false, nullable: true, example: '+2250700000000' })
  telephone?: string | null;

  @ApiProperty({ example: '2025-09-24T10:02:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-09-24T10:02:00.000Z' })
  updatedAt!: string;
}
