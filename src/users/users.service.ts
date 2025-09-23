import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.schema';
import { QueryUserDto } from './DTO/query-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'asc', nom, prenom, email, role } = query;
    const filter: Record<string, any> = {};

    if (nom) filter.nom = { $regex: nom, $options: 'i' };
    if (prenom) filter.prenom = { $regex: prenom, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (role) filter.role = role;

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userModel.find(filter).sort(sort).skip(skip).limit(limit),
      this.userModel.countDocuments(filter),
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
    return this.userModel.findById(id);
  }

  async create(dto: any) {
    return this.userModel.create(dto);
  }

  async update(id: string, dto: any) {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
