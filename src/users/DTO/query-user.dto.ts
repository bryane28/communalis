import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/DTO/pagination-query.dto';

export class QueryUserDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['admin', 'formateur', 'parent'])
  role?: string;
}
