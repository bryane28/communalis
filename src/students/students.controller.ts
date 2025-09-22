import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from '../models/student.schema';
import { AuthGuard } from '@nestjs/passport';

@Controller('students')
export class StudentsController {
  constructor(@InjectModel(Student.name) private studentModel: Model<Student>) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.studentModel.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.studentModel.findById(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.studentModel.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.studentModel.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.studentModel.findByIdAndDelete(id);
  }
}
