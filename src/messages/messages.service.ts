import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../models/message.schema';
import { QueryMessageDto } from './DTO/query-message.dto';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async findAll(query: QueryMessageDto) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'asc', senderId, receiverId, content } = query;
    const filter: Record<string, any> = {};

    if (senderId) filter.senderId = senderId;
    if (receiverId) filter.receiverId = receiverId;
    if (content) filter.content = { $regex: content, $options: 'i' };

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.messageModel.find(filter).sort(sort).skip(skip).limit(limit),
      this.messageModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.messageModel.findById(id);
  }

  async create(dto: any) {
    return this.messageModel.create(dto);
  }

  async update(id: string, dto: any) {
    return this.messageModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async delete(id: string) {
    return this.messageModel.findByIdAndDelete(id);
  }
}
