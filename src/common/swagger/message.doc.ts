import { ApiProperty } from '@nestjs/swagger';

export class MessageDoc {
  @ApiProperty({ example: '66f3b1ab12cd34e56789f401' })
  _id!: string;

  @ApiProperty({ example: '665f1b2c3d4e5f6789012345' })
  senderId!: string;

  @ApiProperty({ example: '665f1b2c3d4e5f6789019999' })
  receiverId!: string;

  @ApiProperty({ example: 'Bonjour' })
  content!: string;

  @ApiProperty({ example: '2025-09-24T10:02:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-09-24T10:02:00.000Z' })
  updatedAt!: string;
}
