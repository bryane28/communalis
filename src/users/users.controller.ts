import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.schema';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  @Get()
  @Roles('admin') // Seul l'admin peut accéder à cette route
  async findAll() {
    return this.userModel.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userModel.findById(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.userModel.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
