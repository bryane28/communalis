import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsNotEmpty()
  prenom!: string;

  @Type(() => Number)
  @IsNumber()
  age!: number;

  @IsString()
  @IsNotEmpty()
  matricule!: string;

  @IsMongoId()
  formateurId!: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsOptional()
  @IsString()
  remarques?: string;
}