import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/DTO/pagination-query.dto';

export class QueryStudentDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsMongoId()
  formateurId?: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;
}
