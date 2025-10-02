import { ApiProperty } from '@nestjs/swagger';

export class StudentDoc {
  @ApiProperty({ example: '66f3b1ab12cd34e56789f201' })
  _id!: string;

  @ApiProperty({ example: 'Kouassi' })
  nom!: string;

  @ApiProperty({ example: 'Awa' })
  prenom!: string;

  @ApiProperty({ example: '665f1b2c3d4e5f6789012345', required: false, nullable: true })
  formateurId?: string | null;

  @ApiProperty({ example: '665f1b2c3d4e5f6789019999', required: false, nullable: true })
  parentId?: string | null;

  @ApiProperty({ example: '2025-09-24T10:02:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-09-24T10:02:00.000Z' })
  updatedAt!: string;
}
