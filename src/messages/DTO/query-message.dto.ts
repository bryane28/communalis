import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/DTO/pagination-query.dto';

export class QueryMessageDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  senderId?: string;

  @IsOptional()
  @IsMongoId()
  receiverId?: string;

  @IsOptional()
  @IsString()
  content?: string; // substring match
}
