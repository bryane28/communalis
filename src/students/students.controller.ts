import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, BadRequestException, UseGuards, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiExtraModels, getSchemaPath, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { StudentDoc } from '../common/swagger/student.doc';
import { MetaDoc, MessageResponse } from '../common/swagger/common.doc';
import { PaginatedStudentDoc } from '../common/swagger/paginated.doc';
import { StudentsService } from './students.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { QueryStudentDto } from './DTO/query-student.dto';
import { CreateStudentDto } from './DTO/create-student.dto';
import { UpdateStudentDto } from './DTO/update-student.dto';
import { AssignFormateurDto } from './DTO/assign-formateur.dto';
import { AssignParentDto } from './DTO/assign-parent.dto';

@ApiTags('students')
@ApiBearerAuth('bearer')
@ApiExtraModels(StudentDoc, MetaDoc, MessageResponse, PaginatedStudentDoc, CreateStudentDto, UpdateStudentDto)
@Controller('students')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles('admin', 'formateur')
  @ApiOperation({ summary: 'Lister les élèves avec filtres et pagination' })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiQuery({ name: 'nom', required: false })
  @ApiQuery({ name: 'prenom', required: false })
  @ApiQuery({ name: 'formateurId', required: false })
  @ApiQuery({ name: 'parentId', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ description: 'Liste des élèves', schema: { $ref: getSchemaPath(PaginatedStudentDoc) } })
  async findAll(@Query() query: QueryStudentDto, @Req() req: any) {
    return this.studentsService.findAll(query, req.user);
  }

  @Get(':id')
  @Roles('admin', 'formateur', 'parent')
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Élève trouvé', schema: { $ref: getSchemaPath(StudentDoc) } })
  @ApiNotFoundResponse({ description: 'Élève non trouvé', schema: { example: { message: 'Élève non trouvé' } } })
  async findOne(@Param('id') id: string) {
    const student = await this.studentsService.findOne(id);
    if (!student) throw new NotFoundException('Élève non trouvé');
    return student;
  }

  @Post()
  @Roles('formateur')
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiCreatedResponse({ description: 'Élève créé', schema: { $ref: getSchemaPath(StudentDoc) } })
  @ApiBadRequestResponse({ description: 'Erreur de validation', schema: { example: { message: 'Erreur de validation', errors: { nom: 'Champ requis' } } } })
  @ApiBody({ type: CreateStudentDto })
  async create(@Body() dto: CreateStudentDto) {
    try {
      return await this.studentsService.create(dto);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  @Put(':id')
  @Roles('formateur')
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Élève mis à jour', schema: { $ref: getSchemaPath(StudentDoc) } })
  @ApiNotFoundResponse({ description: 'Élève non trouvé', schema: { example: { message: 'Élève non trouvé' } } })
  @ApiBadRequestResponse({ description: 'Erreur de validation', schema: { example: { message: 'Erreur de validation', errors: { prenom: 'Longueur minimale non respectée' } } } })
  @ApiBody({ type: UpdateStudentDto })
  async update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    const student = await this.studentsService.update(id, dto);
    if (!student) throw new NotFoundException('Élève non trouvé');
    return student;
  }

  @Delete(':id')
  @Roles('formateur')
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiOkResponse({ description: 'Suppression confirmée', schema: { $ref: getSchemaPath(MessageResponse) } })
  @ApiNotFoundResponse({ description: 'Élève non trouvé', schema: { example: { message: 'Élève non trouvé' } } })
  async delete(@Param('id') id: string) {
    const student = await this.studentsService.delete(id);
    if (!student) throw new NotFoundException('Élève non trouvé');
    return { message: 'Élève supprimé' };
  }

  @Post(':id/assign-formateur')
  @Roles('admin', 'formateur')
  @ApiOperation({ summary: "Assigner un formateur à l'élève" })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiBody({ type: AssignFormateurDto })
  @ApiOkResponse({ description: 'Élève mis à jour', schema: { $ref: getSchemaPath(StudentDoc) } })
  @ApiBadRequestResponse({ description: 'Erreur de validation', schema: { example: { message: 'Erreur de validation', errors: { formateurId: 'ID invalide' } } } })
  @ApiNotFoundResponse({ description: 'Élève non trouvé', schema: { example: { message: 'Élève non trouvé' } } })
  async assignFormateur(@Param('id') id: string, @Body() dto: AssignFormateurDto) {
    try {
      const updated = await this.studentsService.assignFormateur(id, dto.formateurId);
      if (!updated) throw new NotFoundException('Élève non trouvé');
      return updated;
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  @Post(':id/assign-parent')
  @Roles('admin', 'formateur')
  @ApiOperation({ summary: "Assigner un parent à l'élève" })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @ApiBody({ type: AssignParentDto })
  @ApiOkResponse({ description: 'Élève mis à jour', schema: { $ref: getSchemaPath(StudentDoc) } })
  @ApiBadRequestResponse({ description: 'Erreur de validation', schema: { example: { message: 'Erreur de validation', errors: { parentId: 'ID invalide' } } } })
  @ApiNotFoundResponse({ description: 'Élève non trouvé', schema: { example: { message: 'Élève non trouvé' } } })
  async assignParent(@Param('id') id: string, @Body() dto: AssignParentDto) {
    try {
      const updated = await this.studentsService.assignParent(id, dto.parentId);
      if (!updated) throw new NotFoundException('Élève non trouvé');
      return updated;
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }
}
