import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../models/message.schema';

@Controller('messages')
export class MessagesController {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  @Get()
  async findAll() {
    return this.messageModel.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.messageModel.findById(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.messageModel.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.messageModel.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.messageModel.findByIdAndDelete(id);
  }
}
