import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, BadRequestException, UseGuards, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiExtraModels, getSchemaPath, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { MessageDoc } from '../common/swagger/message.doc';
import { MetaDoc, MessageResponse } from '../common/swagger/common.doc';
import { PaginatedMessageDoc } from '../common/swagger/paginated.doc';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { QueryMessageDto } from './DTO/query-message.dto';
import { CreateMessageDto } from './DTO/create-message.dto';
import { UpdateMessageDto } from './DTO/update-message.dto';

@ApiTags('messages')
@ApiBearerAuth('bearer')
@ApiExtraModels(MessageDoc, MetaDoc, MessageResponse, PaginatedMessageDoc, CreateMessageDto, UpdateMessageDto)
@Controller('messages')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @Roles('admin', 'formateur', 'parent')
  @ApiOperation({ summary: 'Lister les messages (filtrés par rôle et par critères)' })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiQuery({ name: 'senderId', required: false })
  @ApiQuery({ name: 'receiverId', required: false })
  @ApiQuery({ name: 'content', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ description: 'Liste des messages', schema: { $ref: getSchemaPath(PaginatedMessageDoc) } })
  async findAll(@Query() query: QueryMessageDto, @Req() req: any) {
    return this.messagesService.findAll(query, req.user);
  }

  @Get(':id')
  @Roles('admin', 'formateur', 'parent')
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Message trouvé', schema: { $ref: getSchemaPath(MessageDoc) } })
  @ApiNotFoundResponse({ description: 'Message non trouvé', schema: { example: { message: 'Message non trouvé' } } })
  async findOne(@Param('id') id: string) {
    const message = await this.messagesService.findOne(id);
    if (!message) throw new NotFoundException('Message non trouvé');
    return message;
  }

  @Post()
  @Roles('formateur', 'parent')
  @ApiOperation({ summary: 'Créer un message' })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiBody({ type: CreateMessageDto })
  @ApiCreatedResponse({ description: 'Message créé', schema: { $ref: getSchemaPath(MessageDoc) } })
  @ApiBadRequestResponse({ description: 'Erreur de validation', schema: { example: { message: 'Erreur de validation', errors: { content: 'Champ requis' } } } })
  async create(@Body() dto: CreateMessageDto) {
    try {
      return await this.messagesService.create(dto);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  @Put(':id')
  @Roles('formateur', 'parent')
  @ApiOperation({ summary: 'Mettre à jour un message' })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiBody({ type: UpdateMessageDto })
  @ApiOkResponse({ description: 'Message mis à jour', schema: { $ref: getSchemaPath(MessageDoc) } })
  @ApiNotFoundResponse({ description: 'Message non trouvé', schema: { example: { message: 'Message non trouvé' } } })
  @ApiBadRequestResponse({ description: 'Erreur de validation', schema: { example: { message: 'Erreur de validation', errors: { content: 'Longueur minimale non respectée' } } } })
  async update(@Param('id') id: string, @Body() dto: UpdateMessageDto) {
    const message = await this.messagesService.update(id, dto);
    if (!message) throw new NotFoundException('Message non trouvé');
    return message;
  }

  @Delete(':id')
  @Roles('admin')
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Suppression confirmée', schema: { $ref: getSchemaPath(MessageResponse) } })
  @ApiNotFoundResponse({ description: 'Message non trouvé', schema: { example: { message: 'Message non trouvé' } } })
  async delete(@Param('id') id: string) {
    const message = await this.messagesService.delete(id);
    if (!message) throw new NotFoundException('Message non trouvé');
    return { message: 'Message supprimé' };
  }
}
