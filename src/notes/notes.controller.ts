import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, BadRequestException, UseGuards, Query } from '@nestjs/common';
import { NotesService } from './notes.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { QueryNoteDto } from './DTO/query-note.dto';
import { CreateNoteDto } from './DTO/create-note.dto';
import { UpdateNoteDto } from './DTO/update-note.dto';

@Controller('notes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @Roles('admin', 'formateur')
  async findAll(@Query() query: QueryNoteDto) {
    return this.notesService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'formateur', 'parent')
  async findOne(@Param('id') id: string) {
    const note = await this.notesService.findOne(id);
    if (!note) throw new NotFoundException('Note non trouvée');
    return note;
  }

  @Post()
  @Roles('formateur')
  async create(@Body() dto: CreateNoteDto) {
    try {
      return await this.notesService.create(dto);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  @Put(':id')
  @Roles('formateur')
  async update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    const note = await this.notesService.update(id, dto);
    if (!note) throw new NotFoundException('Note non trouvée');
    return note;
  }

  @Delete(':id')
  @Roles('formateur')
  async delete(@Param('id') id: string) {
    const note = await this.notesService.delete(id);
    if (!note) throw new NotFoundException('Note non trouvée');
    return { message: 'Note supprimée' };
  }
}
