import { ApiProperty } from '@nestjs/swagger';

export class NoteDoc {
  @ApiProperty({ example: '66f3b1ab12cd34e56789f301' })
  _id!: string;

  @ApiProperty({ example: '665f1b2c3d4e5f6789011111' })
  studentId!: string;

  @ApiProperty({ example: '665f1b2c3d4e5f6789012222' })
  formateurId!: string;

  @ApiProperty({ example: 'Maths' })
  matiere!: string;

  @ApiProperty({ example: 15 })
  valeur!: number;

  @ApiProperty({ example: '2025-09-24T10:02:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-09-24T10:02:00.000Z' })
  updatedAt!: string;
}
