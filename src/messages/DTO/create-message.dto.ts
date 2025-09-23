import { IsMongoId, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  senderId!: string;

  @IsMongoId()
  receiverId!: string;

  @IsString()
  content!: string;
}
