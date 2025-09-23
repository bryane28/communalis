import { IsArray, IsEmail, IsIn, IsMongoId, IsOptional, IsString, MinLength, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nom!: string;

  @IsString()
  prenom!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  motDePasse!: string;

  @IsString()
  @IsIn(['admin', 'formateur', 'parent'])
  role!: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  studentIds?: string[];
}
