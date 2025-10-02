import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './DTO/register.dto';
import { LoginDto } from './DTO/login.dto';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { ApiBody, ApiOperation, ApiTags, ApiOkResponse, ApiCreatedResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { LoginResponseDoc, OtpRequestResponseDoc, RegisterResponseDoc } from '../common/swagger/auth.doc';
import { MessageResponse } from '../common/swagger/common.doc';
import { Throttle } from '@nestjs/throttler';

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

class RegisterInitiateDto {
  @IsString()
  nom!: string;

  @IsString()
  prenom!: string;

  @IsEmail()
  email!: string;
}

class RegisterCompleteDto {
  @IsString()
  nom!: string;

  @IsString()
  prenom!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(4, 8)
  code!: string;

  @IsString()
  @MinLength(8)
  motDePasse!: string;

  @IsString()
  role!: string; // admin | formateur | parent

  @IsString()
  telephone?: string;
}

@ApiTags('auth')
@ApiExtraModels(LoginResponseDoc, RegisterResponseDoc, OtpRequestResponseDoc, MessageResponse)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription (flux simple sans OTP)' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'Inscription réussie', schema: { $ref: getSchemaPath(RegisterResponseDoc) } })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Connexion et récupération du JWT' })
  @Throttle({
    default: {
      ttl: 60,
      limit: 5,
    },
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Connexion réussie', schema: { $ref: getSchemaPath(LoginResponseDoc) } })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('request-otp')
  @ApiOperation({ summary: "Demande d'OTP (email)" })
  @ApiBody({ type: RequestOtpDto })
  @ApiCreatedResponse({ description: 'OTP généré', schema: { $ref: getSchemaPath(OtpRequestResponseDoc) } })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Vérification du code OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({ description: 'OTP validé', schema: { $ref: getSchemaPath(MessageResponse) } })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Réinitialisation du mot de passe via OTP' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Mot de passe réinitialisé', schema: { $ref: getSchemaPath(MessageResponse) } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.nouveauMotDePasse);
  }

  // Two-step registration flow
  @Post('register/initiate')
  @ApiOperation({ summary: "Inscription étape 1: envoi de l'OTP" })
  @ApiBody({ type: RegisterInitiateDto })
  @ApiCreatedResponse({ description: 'OTP envoyé pour inscription', schema: { $ref: getSchemaPath(OtpRequestResponseDoc) } })
  async registerInitiate(@Body() dto: RegisterInitiateDto) {
    // Vérifie que l'email n'est pas déjà utilisé puis envoie l'OTP
    return this.authService.initiateRegister(dto);
  }

  @Post('register/complete')
  @ApiOperation({ summary: 'Inscription étape 2: vérification OTP et création du compte' })
  @ApiBody({ type: RegisterCompleteDto })
  @ApiCreatedResponse({ description: 'Inscription complétée', schema: { $ref: getSchemaPath(RegisterResponseDoc) } })
  async registerComplete(@Body() dto: RegisterCompleteDto) {
    return this.authService.completeRegister(dto);
  }
}
