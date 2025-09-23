import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { PaginationQueryDto } from '../../common/DTO/pagination-query.dto';

export class QueryNoteDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @IsOptional()
  @IsString()
  matiere?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minNote?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxNote?: number;

  @IsOptional()
  @IsMongoId()
  formateurId?: string;
}
