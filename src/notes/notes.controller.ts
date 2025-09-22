import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from '../models/note.schema';

@Controller('notes')
export class NotesController {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

  @Get()
  async findAll() {
    return this.noteModel.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.noteModel.findById(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.noteModel.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.noteModel.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.noteModel.findByIdAndDelete(id);
  }
}
