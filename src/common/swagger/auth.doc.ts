import { ApiProperty } from '@nestjs/swagger';
import { UserDoc } from './user.doc';

export class LoginResponseDoc {
  @ApiProperty({ example: '<JWT>' })
  access_token!: string;

  @ApiProperty({ type: () => UserDoc })
  user!: UserDoc;
}

export class RegisterResponseDoc {
  @ApiProperty({ example: 'Inscription réussie' })
  message!: string;

  @ApiProperty({ type: () => UserDoc })
  user!: UserDoc;
}

export class OtpRequestResponseDoc {
  @ApiProperty({ example: 'OTP généré' })
  message!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: '123456' })
  code!: string;

  @ApiProperty({ example: '2025-09-24T10:15:00.000Z' })
  expiresAt!: string;
}
