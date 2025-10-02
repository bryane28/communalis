import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, BadRequestException, UseGuards, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiExtraModels, getSchemaPath, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { NoteDoc } from '../common/swagger/note.doc';
import { MetaDoc, MessageResponse } from '../common/swagger/common.doc';
import { PaginatedNoteDoc } from '../common/swagger/paginated.doc';
import { NotesService } from './notes.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { QueryNoteDto } from './DTO/query-note.dto';
import { CreateNoteDto } from './DTO/create-note.dto';
import { UpdateNoteDto } from './DTO/update-note.dto';

@ApiTags('notes')
@ApiBearerAuth('bearer')
@ApiExtraModels(NoteDoc, MetaDoc, MessageResponse, PaginatedNoteDoc, CreateNoteDto, UpdateNoteDto)
@Controller('notes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @Roles('admin', 'formateur', 'parent')
  @ApiOperation({ summary: 'Lister les notes avec filtres et pagination' })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'formateurId', required: false })
  @ApiQuery({ name: 'matiere', required: false })
  @ApiQuery({ name: 'minNote', required: false, example: 10 })
  @ApiQuery({ name: 'maxNote', required: false, example: 20 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ description: 'Liste des notes', schema: { $ref: getSchemaPath(PaginatedNoteDoc) } })
  async findAll(@Query() query: QueryNoteDto, @Req() req: any) {
    return this.notesService.findAll(query, req.user);
  }

  @Get(':id')
  @Roles('admin', 'formateur', 'parent')
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Note trouvée', schema: { $ref: getSchemaPath(NoteDoc) } })
  @ApiNotFoundResponse({ description: 'Note non trouvée', schema: { example: { message: 'Note non trouvée' } } })
  async findOne(@Param('id') id: string) {
    const note = await this.notesService.findOne(id);
    if (!note) throw new NotFoundException('Note non trouvée');
    return note;
  }

  @Post()
  @Roles('formateur')
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiCreatedResponse({ description: 'Note créée', schema: { $ref: getSchemaPath(NoteDoc) } })
  @ApiBadRequestResponse({ description: 'Erreur de validation', schema: { example: { message: 'Erreur de validation', errors: { note: 'Doit être un nombre' } } } })
  @ApiBody({ type: CreateNoteDto })
  async create(@Body() dto: CreateNoteDto) {
    try {
      return await this.notesService.create(dto);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  @Put(':id')
  @Roles('formateur')
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Note mise à jour', schema: { $ref: getSchemaPath(NoteDoc) } })
  @ApiNotFoundResponse({ description: 'Note non trouvée', schema: { example: { message: 'Note non trouvée' } } })
  @ApiBadRequestResponse({ description: 'Erreur de validation', schema: { example: { message: 'Erreur de validation', errors: { matiere: 'Champ requis' } } } })
  @ApiBody({ type: UpdateNoteDto })
  async update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    const note = await this.notesService.update(id, dto);
    if (!note) throw new NotFoundException('Note non trouvée');
    return note;
  }

  @Delete(':id')
  @Roles('formateur')
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Suppression confirmée', schema: { $ref: getSchemaPath(MessageResponse) } })
  @ApiNotFoundResponse({ description: 'Note non trouvée', schema: { example: { message: 'Note non trouvée' } } })
  async delete(@Param('id') id: string) {
    const note = await this.notesService.delete(id);
    if (!note) throw new NotFoundException('Note non trouvée');
    return { message: 'Note supprimée' };
  }
}
