import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, BadRequestException, UseGuards, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { QueryMessageDto } from './DTO/query-message.dto';
import { CreateMessageDto } from './DTO/create-message.dto';
import { UpdateMessageDto } from './DTO/update-message.dto';

@Controller('messages')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @Roles('admin', 'formateur', 'parent')
  async findAll(@Query() query: QueryMessageDto) {
    return this.messagesService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'formateur', 'parent')
  async findOne(@Param('id') id: string) {
    const message = await this.messagesService.findOne(id);
    if (!message) throw new NotFoundException('Message non trouvé');
    return message;
  }

  @Post()
  @Roles('formateur', 'parent')
  async create(@Body() dto: CreateMessageDto) {
    try {
      return await this.messagesService.create(dto);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  @Put(':id')
  @Roles('formateur', 'parent')
  async update(@Param('id') id: string, @Body() dto: UpdateMessageDto) {
    const message = await this.messagesService.update(id, dto);
    if (!message) throw new NotFoundException('Message non trouvé');
    return message;
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string) {
    const message = await this.messagesService.delete(id);
    if (!message) throw new NotFoundException('Message non trouvé');
    return { message: 'Message supprimé' };
  }
}
