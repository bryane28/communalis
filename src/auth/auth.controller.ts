import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './DTO/register.dto';
import { LoginDto } from './DTO/login.dto';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

class RequestOtpDto {
  @IsEmail()
  email!: string;
}

class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(4, 8)
  code!: string;
}

class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(4, 8)
  code!: string;

  @IsString()
  @MinLength(8)
  nouveauMotDePasse!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.nouveauMotDePasse);
  }
}
