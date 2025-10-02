import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class AssignFormateurDto {
  @ApiProperty({ example: '665f1b2c3d4e5f6789012345' })
  @IsMongoId()
  formateurId!: string;
}
