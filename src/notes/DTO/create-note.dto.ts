import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNoteDto {
  @IsMongoId()
  studentId!: string;

  @IsString()
  matiere!: string;

  @Type(() => Number)
  @IsNumber()
  note!: number;

  @IsOptional()
  @IsString()
  remarques?: string;

  @IsMongoId()
  formateurId!: string;
}
