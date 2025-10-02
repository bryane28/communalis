import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, BadRequestException, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { QueryUserDto } from './DTO/query-user.dto';
import { CreateUserDto } from './DTO/create-user.dto';
import { UpdateUserDto } from './DTO/update-user.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import type { Request } from 'express';
import sharp from 'sharp';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiExtraModels, getSchemaPath, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { UserDoc } from '../common/swagger/user.doc';
import { MetaDoc, MessageResponse, AvatarResponse } from '../common/swagger/common.doc';
import { PaginatedUserDoc } from '../common/swagger/paginated.doc';
@ApiTags('users')
@ApiBearerAuth('bearer')
@ApiExtraModels(UserDoc, MetaDoc, MessageResponse, AvatarResponse, PaginatedUserDoc, CreateUserDto, UpdateUserDto)
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Lister les utilisateurs avec filtres et pagination' })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiQuery({ name: 'nom', required: false })
  @ApiQuery({ name: 'prenom', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'role', required: false, example: 'admin | formateur | parent' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ description: 'Liste des utilisateurs', schema: { $ref: getSchemaPath(PaginatedUserDoc) } })
  async findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'formateur')
  @ApiOperation({ summary: "Récupérer un utilisateur par son id" })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Utilisateur trouvé', schema: { $ref: getSchemaPath(UserDoc) } })
  @ApiNotFoundResponse({ description: 'Utilisateur non trouvé', schema: { example: { message: 'Utilisateur non trouvé' } } })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiCreatedResponse({ description: 'Utilisateur créé', schema: { $ref: getSchemaPath(UserDoc) } })
  @ApiBadRequestResponse({ description: 'Erreur de validation', schema: { example: { message: 'Erreur de validation', errors: { email: 'Format invalide' } } } })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() dto: CreateUserDto) {
    try {
      return await this.usersService.create(dto);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Utilisateur mis à jour', schema: { $ref: getSchemaPath(UserDoc) } })
  @ApiNotFoundResponse({ description: 'Utilisateur non trouvé', schema: { example: { message: 'Utilisateur non trouvé' } } })
  @ApiBadRequestResponse({ description: 'Erreur de validation', schema: { example: { message: 'Erreur de validation', errors: { email: 'Déjà utilisé' } } } })
  @ApiBody({ type: UpdateUserDto })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Suppression confirmée', schema: { $ref: getSchemaPath(MessageResponse) } })
  @ApiNotFoundResponse({ description: 'Utilisateur non trouvé', schema: { example: { message: 'Utilisateur non trouvé' } } })
  async delete(@Param('id') id: string) {
    const user = await this.usersService.delete(id);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return { message: 'Utilisateur supprimé' };
  }

  @Post(':id/avatar')
  @Roles('admin', 'formateur', 'parent')
  @ApiOperation({ summary: "Uploader l'avatar d'un utilisateur" })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ description: 'Avatar mis à jour', schema: { $ref: getSchemaPath(AvatarResponse) } })
  @ApiBadRequestResponse({ description: 'Aucun fichier reçu ou format non supporté', schema: { example: { message: 'Aucun fichier reçu ou format non supporté' } } })
  @ApiNotFoundResponse({ description: 'Utilisateur non trouvé', schema: { example: { message: 'Utilisateur non trouvé' } } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
          const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const ext = path.extname(file.originalname).toLowerCase();
          const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          cb(null, safeName);
        },
      }),
      fileFilter: (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException("Format d'image non supporté") as unknown as Error, false);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    const publicPath = `/uploads/avatars/${file.filename}`;

    // Optimize and resize image (max 512x512), preserve original format when possible
    try {
      const absolutePath = path.join(process.cwd(), 'uploads', 'avatars', file.filename);
      const image = sharp(absolutePath).rotate();
      const metadata = await image.metadata();
      // Resize only if larger than 512 to avoid upscaling
      const needsResize = (metadata.width ?? 0) > 512 || (metadata.height ?? 0) > 512;
      let pipeline = needsResize
        ? image.resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        : image;

      // Determine target format based on input mimetype
      const mime = file.mimetype.toLowerCase();
      let targetFormat: 'jpeg' | 'png' | 'webp' = 'jpeg';
      if (mime.includes('png')) targetFormat = 'png';
      else if (mime.includes('webp')) targetFormat = 'webp';
      else if (mime.includes('jpeg') || mime.includes('jpg')) targetFormat = 'jpeg';
      else if (mime.includes('gif')) targetFormat = 'png'; // Sharp cannot write GIF; use PNG

      // Encode using target format with settings
      let buffer: Buffer;
      if (targetFormat === 'png') {
        buffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
      } else if (targetFormat === 'webp') {
        buffer = await pipeline.webp({ quality: 82 }).toBuffer();
      } else {
        buffer = await pipeline.jpeg({ quality: 82 }).toBuffer();
      }

      // If we converted GIF->PNG, rename file to .png and update publicPath
      if (mime.includes('gif') && targetFormat === 'png') {
        const newFilename = path.basename(file.filename, path.extname(file.filename)) + '.png';
        const newAbsolutePath = path.join(process.cwd(), 'uploads', 'avatars', newFilename);
        fs.writeFileSync(newAbsolutePath, buffer);
        try { fs.unlinkSync(absolutePath); } catch {}
        // Update publicPath to match new filename
        const newPublicPath = `/uploads/avatars/${newFilename}`;
        const user = await this.usersService.update(id, { avatarUrl: newPublicPath });
        if (!user) throw new NotFoundException('Utilisateur non trouvé');
        return { message: 'Avatar mis à jour', avatarUrl: newPublicPath };
      } else {
        // Overwrite original file when extension matches
        fs.writeFileSync(absolutePath, buffer);
      }
    } catch (e) {
      // Do not fail the request if optimization fails
    }
    const user = await this.usersService.update(id, { avatarUrl: publicPath });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return { message: 'Avatar mis à jour', avatarUrl: publicPath };
  }

  @Delete(':id/avatar')
  @Roles('admin', 'formateur', 'parent')
  @ApiOperation({ summary: "Supprimer l'avatar d'un utilisateur" })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Suppression confirmée', schema: { $ref: getSchemaPath(MessageResponse) } })
  @ApiNotFoundResponse({ description: 'Utilisateur non trouvé', schema: { example: { message: 'Utilisateur non trouvé' } } })
  async deleteAvatar(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    // Remove file from disk if exists
    if (user.avatarUrl) {
      const filename = user.avatarUrl.replace('/uploads/avatars/', '');
      const filePath = path.join(process.cwd(), 'uploads', 'avatars', filename);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {
        // ignore file delete errors
      }
    }

    await this.usersService.update(id, { avatarUrl: null as unknown as undefined });
    return { message: 'Avatar supprimé' };
  }
}
