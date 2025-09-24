import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, BadRequestException, UseGuards, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { QueryStudentDto } from './DTO/query-student.dto';
import { CreateStudentDto } from './DTO/create-student.dto';
import { UpdateStudentDto } from './DTO/update-student.dto';
import { IsMongoId } from 'class-validator';

class AssignFormateurDto {
  @IsMongoId()
  formateurId!: string;
}

class AssignParentDto {
  @IsMongoId()
  parentId!: string;
}

@ApiTags('students')
@ApiBearerAuth('bearer')
@Controller('students')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles('admin', 'formateur')
  async findAll(@Query() query: QueryStudentDto, @Req() req: any) {
    return this.studentsService.findAll(query, req.user);
  }

  @Get(':id')
  @Roles('admin', 'formateur', 'parent')
  async findOne(@Param('id') id: string) {
    const student = await this.studentsService.findOne(id);
    if (!student) throw new NotFoundException('Élève non trouvé');
    return student;
  }

  @Post()
  @Roles('formateur')
  async create(@Body() dto: CreateStudentDto) {
    try {
      return await this.studentsService.create(dto);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  @Put(':id')
  @Roles('formateur')
  async update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    const student = await this.studentsService.update(id, dto);
    if (!student) throw new NotFoundException('Élève non trouvé');
    return student;
  }

  @Delete(':id')
  @Roles('formateur')
  async delete(@Param('id') id: string) {
    const student = await this.studentsService.delete(id);
    if (!student) throw new NotFoundException('Élève non trouvé');
    return { message: 'Élève supprimé' };
  }

  @Post(':id/assign-formateur')
  @Roles('admin', 'formateur')
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
